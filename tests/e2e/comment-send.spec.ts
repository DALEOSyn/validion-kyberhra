import { expect, test, type Page, type Request as PwRequest } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { FEEDBACK_ENDPOINT, SEND_PORT } from '../../playwright.config.ts';

/**
 * „Odoslať“ in the comment box, in the third build (playwright.config.ts, dist-send) with VITE_FEEDBACK_ENDPOINT set.
 * The endpoint is mocked with page.route; any other request off the page's origin fails the test. The service worker
 * is blocked so page.route sees every request (the game's worker never handles cross-origin requests anyway).
 */
test.use({ baseURL: `http://127.0.0.1:${SEND_PORT}/`, serviceWorkers: 'block' });

const ENDPOINT_ORIGIN = new URL(FEEDBACK_ENDPOINT).origin;

async function axe(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page, context }) => {
  const errs: string[] = [];
  errors.set(page, errs);
  page.on('console', (m) => {
    // A mocked 500 or 429 shows up as a failed resource load in the console; that is the case under test, not an error.
    if (m.type() === 'error' && !/status of (500|429)/.test(m.text())) errs.push(m.text());
  });
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && url.origin !== ENDPOINT_ORIGIN && !url.protocol.startsWith('data')) errs.push(`external request: ${req.url()}`);
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page) ?? []).toEqual([]);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toContain('pochopili');
});

async function openAndFill(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'O hre' }).click();
  const box = page.locator('[data-comment-box]');
  await expect(box.getByText('Pripomienku môžete odoslať tlačidlom „Odoslať“.', { exact: false })).toBeVisible();
  await expect(box.getByText('Nepíšte sem mená, školu, kontakty ani nič osobné o deťoch.', { exact: false })).toBeVisible();
  await expect(box.getByText('Si dieťa a niečo ťa trápi? Nepíš to sem.', { exact: false })).toContainText('116 111');
  await box.getByText('Formulár pre dospelých').click();
  await box.getByRole('radio', { name: 'Zo školy' }).check();
  await box.getByLabel('Ku ktorému prípadu').selectOption('T1 Ľahká brigáda');
  await box.getByRole('radio', { name: '4', exact: true }).check();
  await box.getByRole('textbox', { name: 'Pripomienka' }).fill('Deti pochopili pravidlo.');
  return box;
}

test('„Odoslať“ posts only the comment, then confirms calmly and clears the draft', async ({ page }) => {
  const seen: PwRequest[] = [];
  await page.route(FEEDBACK_ENDPOINT, async (route) => {
    seen.push(route.request());
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST' } });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"ok":true}' });
  });
  const box = await openAndFill(page);

  // the CSP allows only the game itself and the endpoint's origin
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain(`connect-src 'self' ${ENDPOINT_ORIGIN};`);
  // all three ways out, „Odoslať“ first; the honeypot is not reachable
  await expect(box.getByRole('button', { name: 'Odoslať' })).toBeVisible();
  await expect(box.getByRole('link', { name: 'Poslať e-mailom' })).toBeVisible();
  await expect(box.getByRole('button', { name: 'Kopírovať text' })).toBeVisible();
  await expect(box.getByRole('textbox')).toHaveCount(1);
  await expect(box.locator('input[name="stopa_hp"]')).toHaveAttribute('tabindex', '-1');
  await axe(page);

  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Ďakujeme. Pripomienka je odoslaná. Na pripomienky neodpovedáme. Ak niekto potrebuje pomoc hneď, volajte Linku detskej istoty 116 111.');
  const post = seen.find((r) => r.method() === 'POST');
  expect(post).toBeDefined();
  expect(post?.postDataJSON()).toEqual({ v: 1, app_version: '0.2.0', role: 'Zo školy', case: 'T1 Ľahká brigáda', rating: 4, text: 'Deti pochopili pravidlo.', hp: '' });
  const headers = (await post?.allHeaders()) ?? {};
  expect(headers['cookie']).toBeUndefined();
  expect(headers['referer']).toBeUndefined();
  expect(headers['content-type']).toBe('application/json');

  // the draft is cleared
  await expect(box.getByRole('textbox', { name: 'Pripomienka' })).toHaveValue('');
  await expect(box.getByRole('radio', { name: 'Zo školy' })).not.toBeChecked();
  await axe(page);
  // a further click on the empty box keeps the thank-you
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Ďakujeme. Pripomienka je odoslaná. Na pripomienky neodpovedáme. Ak niekto potrebuje pomoc hneď, volajte Linku detskej istoty 116 111.');
  expect(seen.filter((r) => r.method() === 'POST')).toHaveLength(1);
});

test('the privacy texts name „Odoslať“ in this build', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByText('Pripomienku môže odoslať len dospelý v časti „O hre“.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'O hre' }).click();
  const priv = page.locator('[data-about="sukromie"]');
  await expect(priv).toContainText('Hra ju odošle, len keď dospelý stlačí „Odoslať“.');
  await expect(priv).not.toContainText('Hra ju sama nikam neodošle.');
});

test('while sending, the fields are locked: a double click and an edit attempt give exactly one POST and lose no text', async ({ page }) => {
  const posts: PwRequest[] = [];
  let release: () => void = () => undefined;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(FEEDBACK_ENDPOINT, async (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST' } });
    posts.push(route.request());
    await gate;
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"ok":true}' });
  });
  const box = await openAndFill(page);
  const area = box.getByRole('textbox', { name: 'Pripomienka' });
  await box.getByRole('button', { name: 'Odoslať' }).dblclick();
  await expect(box.getByRole('status')).toHaveText('Pripomienka sa odosiela.');
  await expect(area).toBeDisabled();
  await expect(box.getByRole('radio', { name: 'Z rodiny' })).toBeDisabled();
  // an edit attempt changes nothing and does not reset the status
  await area.fill('Iný text.', { timeout: 500 }).catch(() => undefined);
  await expect(area).toHaveValue('Deti pochopili pravidlo.');
  await expect(box.getByRole('status')).toHaveText('Pripomienka sa odosiela.');
  // the button is aria-disabled while sending (Playwright's click would wait for it), so dispatch a click directly
  await box.getByRole('button', { name: 'Odoslať' }).dispatchEvent('click');
  release();
  await expect(box.getByRole('status')).toHaveText('Ďakujeme. Pripomienka je odoslaná. Na pripomienky neodpovedáme. Ak niekto potrebuje pomoc hneď, volajte Linku detskej istoty 116 111.');
  expect(posts).toHaveLength(1);
  expect(posts[0]?.postDataJSON()).toMatchObject({ text: 'Deti pochopili pravidlo.' });
  await expect(area).toBeEnabled();
});

test('a 429 answer asks to try again in a few minutes, and the text stays', async ({ page }) => {
  await page.route(FEEDBACK_ENDPOINT, (route) =>
    route.fulfill({ status: 429, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '{"ok":false}' }),
  );
  const box = await openAndFill(page);
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Teraz prišlo veľa pripomienok naraz. Skúste to znova o pár minút alebo text skopírujte tlačidlom „Kopírovať text“.');
  const copy = box.getByRole('button', { name: 'Kopírovať text' });
  await expect(copy).toBeFocused();
  await expect(copy).toHaveAttribute('aria-describedby', 'comment-status');
  await expect(box.getByRole('textbox', { name: 'Pripomienka' })).toHaveValue('Deti pochopili pravidlo.');
});

test('a comment whose JSON is over 2 KB is not sent, and the too-long message shows', async ({ page }) => {
  let posted = false;
  await page.route(FEEDBACK_ENDPOINT, (route) => {
    posted = true;
    return route.abort();
  });
  const box = await openAndFill(page);
  // 500 characters that JSON writes as 6 bytes each (\u0001): within the textarea's limit, over the server's 2 KB
  await box.getByRole('textbox', { name: 'Pripomienka' }).fill('a' + '\u0001'.repeat(499));
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Pripomienka je na odoslanie príliš dlhá. Skráťte ju, prosím, alebo text skopírujte tlačidlom „Kopírovať text“.');
  expect(posted).toBe(false);
});

test('when sending fails, the text stays and „Kopírovať text“ is the way on', async ({ page }) => {
  await page.route(FEEDBACK_ENDPOINT, (route) =>
    route.fulfill({ status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '{"ok":false}' }),
  );
  const box = await openAndFill(page);
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Pripomienku sa teraz nepodarilo odoslať. Text zostal v poli. Môžete ho skopírovať tlačidlom „Kopírovať text“.');
  await expect(box.getByRole('button', { name: 'Kopírovať text' })).toBeFocused();
  await expect(box.getByRole('button', { name: 'Kopírovať text' })).toHaveAttribute('aria-describedby', 'comment-status');
  await expect(box.getByRole('status')).toBeInViewport();
  await expect(box.getByRole('textbox', { name: 'Pripomienka' })).toHaveValue('Deti pochopili pravidlo.');
  await axe(page);
  await page.keyboard.press('Enter');
  await expect(box.getByRole('status')).toHaveText('Text je skopírovaný. Môžete ho vložiť do e-mailu alebo do formulára.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('### Pripomienka\n\nDeti pochopili pravidlo.');
});

test('offline, nothing is sent and „Kopírovať text“ is offered', async ({ page, context }) => {
  let posted = false;
  await page.route(FEEDBACK_ENDPOINT, (route) => {
    posted = true;
    return route.abort();
  });
  const box = await openAndFill(page);
  await context.setOffline(true);
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Zariadenie je bez pripojenia. Text zostal v poli. Môžete ho skopírovať tlačidlom „Kopírovať text“ a poslať neskôr.');
  await expect(box.getByRole('button', { name: 'Kopírovať text' })).toBeFocused();
  expect(posted).toBe(false);
  await context.setOffline(false);
});

test('without a role or text, nothing is sent', async ({ page }) => {
  let posted = false;
  await page.route(FEEDBACK_ENDPOINT, (route) => {
    posted = true;
    return route.abort();
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'O hre' }).click();
  const box = page.locator('[data-comment-box]');
  await box.getByText('Formulár pre dospelých').click();
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Vyberte, prosím, kto píše.');
  await box.getByRole('radio', { name: 'Z rodiny' }).check();
  await box.getByRole('button', { name: 'Odoslať' }).click();
  await expect(box.getByRole('status')).toHaveText('Najprv napíšte pripomienku.');
  expect(posted).toBe(false);
});
