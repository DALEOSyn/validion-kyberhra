import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { EMAIL_PORT, FEEDBACK_EMAIL } from '../../playwright.config.ts';

/**
 * The comment box on „O hre“ (src/ui/CommentBox.tsx). The default build (no VITE_FEEDBACK_EMAIL) offers only
 * „Kopírovať text“; the second build (playwright.config.ts, dist-email) also offers the mailto: link. The game sends
 * nothing: every request to another origin fails the test, and no comment text may end up in storage.
 */

async function axe(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page, context }) => {
  const errs: string[] = [];
  errors.set(page, errs);
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && !url.protocol.startsWith('data')) errs.push(`external request: ${req.url()}`);
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page) ?? []).toEqual([]);
  // nothing typed into the box is stored on the device
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toContain('pochopili');
});

const EXPECTED = '### Kto píše\n\nZo školy\n\n### Prípad\n\nT1 Ľahká brigáda\n\n### Hodnotenie\n\n4\n\n### Pripomienka\n\nDeti pochopili pravidlo.';

async function openAndFill(page: Page) {
  await page.getByRole('button', { name: 'O hre' }).click();
  const box = page.locator('[data-comment-box]');
  await expect(box).toBeVisible();
  await expect(box.getByRole('heading', { name: 'Pripomienka pre dospelých' })).toBeVisible();
  await expect(box.getByText('Nepíšte sem mená, školu, kontakty ani nič osobné o deťoch.', { exact: false })).toBeVisible();
  await expect(box.getByText('Si dieťa a niečo ťa trápi? Nepíš to sem.', { exact: false })).toContainText('116 111');
  await expect(box.getByRole('group', { name: 'Hodnotenie (nepovinné)' })).toBeVisible();
  // asks for the role and the text first, calmly
  await box.getByRole('button', { name: 'Kopírovať text' }).click();
  await expect(box.getByRole('status')).toHaveText('Vyberte, prosím, kto píše.');
  await box.getByRole('radio', { name: 'Zo školy' }).check();
  await box.getByRole('button', { name: 'Kopírovať text' }).click();
  await expect(box.getByRole('status')).toHaveText('Najprv napíšte pripomienku.');
  await box.getByLabel('Ku ktorému prípadu').selectOption('T1 Ľahká brigáda');
  await box.getByRole('radio', { name: '4', exact: true }).check();
  const area = box.getByRole('textbox', { name: 'Pripomienka' });
  await area.fill('Deti pochopili pravidlo.');
  await expect(box.getByText('24 z 500 znakov')).toBeVisible();
  // Escape while a comment is typed keeps the screen (and the text) open
  await area.press('Escape');
  await expect(area).toHaveValue('Deti pochopili pravidlo.');
  return box;
}

test.describe('default build (no e-mail address)', () => {
  test('the box offers only „Kopírovať text“ and copies the issue-form text', async ({ page }) => {
    await page.goto('./');
    const box = await openAndFill(page);
    await expect(box.getByRole('link')).toHaveCount(0);
    await expect(box.getByText('Otvorí sa vaša e-mailová aplikácia. Hra sama nič neodošle.')).toHaveCount(0);
    await expect(page.locator('main a')).toHaveCount(0);
    await box.getByRole('button', { name: 'Kopírovať text' }).click();
    await expect(box.getByRole('status')).toHaveText('Text je skopírovaný. Môžete ho vložiť do e-mailu alebo do formulára.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EXPECTED);
    // the textarea stops at 500 characters
    await box.getByRole('textbox', { name: 'Pripomienka' }).fill('a'.repeat(600));
    await expect(box.getByText('500 z 500 znakov')).toBeVisible();
    await axe(page);
  });
});

test('the typed comment survives Escape and closing „O hre“ (QA review)', async ({ page }) => {
  await page.goto('./');
  const box = await openAndFill(page);
  const area = () => page.locator('[data-comment-box]').getByRole('textbox', { name: 'Pripomienka' });
  // focus on the page body, then Escape
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'O hre' }).click();
  await expect(area()).toHaveValue('Deti pochopili pravidlo.');
  // focus on „Späť do hry“, then Escape
  await page.getByRole('button', { name: 'Späť do hry' }).focus();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'O hre' }).click();
  await expect(area()).toHaveValue('Deti pochopili pravidlo.');
  // the other choices are kept too
  await expect(page.locator('[data-comment-box]').getByRole('radio', { name: 'Zo školy' })).toBeChecked();
  await expect(box).toBeVisible();
});

test('when copying fails, the text waits selected in a field (QA review)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await page.goto('./');
  const box = await openAndFill(page);
  await box.getByRole('button', { name: 'Kopírovať text' }).click();
  await expect(box.getByRole('status')).toHaveText('Kopírovanie sa nepodarilo. Text je v poli nižšie, môžete ho označiť a skopírovať.');
  const field = box.getByRole('textbox', { name: 'Text na skopírovanie' });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue(EXPECTED);
  expect(await field.evaluate((t: HTMLTextAreaElement) => t.value.slice(t.selectionStart, t.selectionEnd))).toBe(EXPECTED);
  await axe(page);
});

test.describe('build with VITE_FEEDBACK_EMAIL', () => {
  test.use({ baseURL: `http://127.0.0.1:${EMAIL_PORT}/` });

  test('„Poslať e-mailom“ is a mailto: link with the subject and the issue-form body', async ({ page }) => {
    await page.goto('./');
    const box = await openAndFill(page);
    await expect(box.getByText('Otvorí sa vaša e-mailová aplikácia. Hra sama nič neodošle.')).toBeVisible();
    const mail = box.getByRole('link', { name: 'Poslať e-mailom' });
    const href = (await mail.getAttribute('href')) ?? '';
    expect(href.startsWith(`mailto:${FEEDBACK_EMAIL}?subject=Pripomienka%20k%20hre%200.2.0&body=`)).toBe(true);
    expect(decodeURIComponent(href.split('&body=')[1] ?? '')).toBe(EXPECTED.replace(/\n/g, '\r\n'));
    // the one link in the game
    await expect(page.locator('a')).toHaveCount(1);
    // the CSP is the same as in the default build: no connect-src beyond the game itself
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain("connect-src 'self';");
    // copying works here too
    await box.getByRole('button', { name: 'Kopírovať text' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EXPECTED);
    await axe(page);
  });

  test('without a role or text the link does not open the mail app', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'O hre' }).click();
    const box = page.locator('[data-comment-box]');
    const before = page.url();
    await box.getByRole('link', { name: 'Poslať e-mailom' }).click();
    await expect(box.getByRole('status')).toHaveText('Vyberte, prosím, kto píše.');
    expect(page.url()).toBe(before);
  });
});
