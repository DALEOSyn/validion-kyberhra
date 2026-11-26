import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';
import { loadContent } from '../../scripts/lib/content.ts';

async function axe(page: Page) {
  // Let the stamp and clue animations finish, so contrast is measured on the final colours.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

const consoleErrors = new WeakMap<Page, string[]>();

test.afterEach(async ({ page }) => {
  // No console errors, which also catches CSP violations (style-src has no 'unsafe-inline').
  expect(consoleErrors.get(page) ?? []).toEqual([]);
});

test.beforeEach(async ({ page }) => {
  const errs: string[] = [];
  consoleErrors.set(page, errs);
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text());
  });
  page.on('pageerror', (e) => errs.push(e.message));
  // Nothing may leave the device: fail on any request to another origin.
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && !url.protocol.startsWith('data')) throw new Error(`external request: ${req.url()}`);
  });
});

test('J1 "Drak zadarmo" plays from the start screen to the closed case file', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Vyber si trasu' })).toBeVisible();
  await expect(page.locator('[data-track="teen"]')).toHaveAttribute('data-theme', 'teen');
  await expect(page.locator('[data-track="junior"]')).toContainText('Uzavreté: 0/');
  await axe(page);

  await page.locator('[data-track="junior"]').click();
  await page.locator('[data-case="j1-drak-zadarmo"]').click();
  await expect(page.getByText('Vitaj v STOPE. Práve prišla klientka.')).toBeVisible();
  await page.getByRole('button', { name: 'Vziať lupu' }).click();

  // a decoy gives a hint but no clue
  await page.getByRole('button', { name: /GRATULUJEME/ }).click();
  await expect(page.locator('.tip')).toContainText('Toto samo osebe stopa nie je');
  // the sender is the worked example from the brief (pre_found), so the count starts at 1
  await expect(page.getByTestId('clue-count')).toHaveText('1/5');
  for (const id of ['prize', 'hurry', 'link']) await page.locator(`[data-clue="${id}"]`).click();
  await expect(page.getByTestId('clue-count')).toHaveText('4/5');
  await axe(page);

  // keyboard: the continue button is reachable and works with Enter
  const go = page.getByRole('button', { name: 'Poradiť Lei' });
  await go.focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-option="verify"]').click();
  await expect(page.getByText('Prípad vyriešený')).toBeVisible();
  await page.getByRole('button', { name: /Dôvera alebo pasca/ }).click();

  const answers = ['Dôvera', 'Pasca', 'Pasca', 'Dôvera', 'Pasca'];
  for (const [i, a] of answers.entries()) {
    await page.getByRole('button', { name: a, exact: true }).click();
    await expect(page.locator('.tip')).toContainText('Správne.');
    const last = i === answers.length - 1;
    // keyboard: "Ďalej" has focus after an answer, and the next card gets focus after Enter (QA F2)
    await expect(page.getByRole('button', { name: last ? 'Uzavrieť prípad' : 'Ďalej' })).toBeFocused();
    await page.keyboard.press('Enter');
    if (!last) await expect(page.locator('.card')).toBeFocused();
  }

  // the debrief comes in four short pages
  await expect(page.getByText('UZAVRETÉ')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Hviezdy: 3 z 3' })).toBeVisible();
  await expect(page.getByText('Nový odznak: Bronzová lupa.')).toBeVisible();
  await axe(page);
  await page.getByRole('button', { name: 'Ďalej: Stopy' }).click();
  await expect(page.getByText('Stopy v tomto prípade')).toBeVisible();
  await page.getByRole('button', { name: 'Ďalej: Ak sa to už stalo' }).click();
  await expect(page.getByRole('heading', { name: /Ak sa to už stalo/ })).toBeFocused();
  await expect(page.getByText('116 111').first()).toBeVisible();
  await page.getByRole('button', { name: 'Ďalej: Stopa v príbehu' }).click();
  await expect(page.getByText('Stopa k Tieňovi č. 1')).toBeVisible();
  await axe(page);

  // progress survives a reload
  await page.reload();
  await page.locator('[data-track="junior"]').click();
  await expect(page.locator('[data-case="j1-drak-zadarmo"]')).toContainText('Uzavretý');
});

test('help is reachable from every screen and returns to the same place', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Pomoc' }).click();
  await expect(page.getByRole('heading', { name: 'Kde nájsť pomoc' })).toBeVisible();
  await expect(page.getByText('116 111').first()).toBeVisible();
  await axe(page);
  await page.getByRole('button', { name: 'Späť do hry' }).click();

  await page.locator('[data-track="junior"]').click();
  await page.locator('[data-case="j1-drak-zadarmo"]').click();
  await page.getByRole('button', { name: 'Vziať lupu' }).click();
  await page.locator('[data-clue="sender"]').click();
  await page.getByRole('button', { name: 'Pomoc' }).click();
  await expect(page.getByText('116 111').first()).toBeVisible();
  await page.getByRole('button', { name: 'Späť do hry' }).click();
  await expect(page.getByTestId('clue-count')).toHaveText('1/5');
  // Escape closes help too (QA F9)
  await page.getByRole('button', { name: 'Pomoc' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Pomoc' })).toBeFocused();
  await expect(page.getByTestId('clue-count')).toHaveText('1/5');
});

test('pilot build: the start screen shows the pilot label and the page is noindex', async ({ page, request }) => {
  await page.goto('./');
  await expect(page.getByTestId('pilot-label')).toHaveText('Pilotná verzia 0.2.0');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  // the built index.html itself carries the tag (search engines read the HTML, not the running app)
  const html = await (await request.get('./index.html')).text();
  expect(html).toContain('<meta name="robots" content="noindex" />');
  // the label stays on the start screen only
  await page.locator('[data-track="junior"]').click();
  await expect(page.getByTestId('pilot-label')).toHaveCount(0);
});

test('„O hre“ opens from the start screen and closes by keyboard like help', async ({ page }) => {
  await page.goto('./');
  const aboutBtn = page.getByRole('button', { name: 'O hre' });
  await aboutBtn.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'O hre', level: 2 })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Pre dospelých: pripomienky a chyby' })).toBeVisible();
  await expect(page.getByText('github.com/DALEOSyn/validion-kyberhra/issues')).toBeVisible();
  await expect(page.getByText('Ak ťa niečo trápi, zavolaj na Linku detskej istoty 116 111.')).toBeVisible();
  // addresses are plain text: the screen has no links at all
  await expect(page.locator('main a')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Vyber si trasu' })).toBeHidden();
  await axe(page);

  // Escape closes it and returns focus to the button
  await page.keyboard.press('Escape');
  await expect(aboutBtn).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Vyber si trasu' })).toBeVisible();

  // "Späť do hry" by keyboard does the same
  await page.keyboard.press('Enter');
  const back = page.getByRole('button', { name: 'Späť do hry' });
  await back.focus();
  await page.keyboard.press('Enter');
  await expect(aboutBtn).toBeFocused();

  // help and about never show together
  await aboutBtn.click();
  await page.getByRole('button', { name: 'Pomoc' }).click();
  await expect(page.getByRole('heading', { name: 'Kde nájsť pomoc' })).toBeVisible();
  await expect(page.locator('[data-screen="about"]')).toHaveCount(0);
  await page.keyboard.press('Escape');

  // the entry is on the start screen only
  await page.locator('[data-track="junior"]').click();
  await expect(page.getByRole('button', { name: 'O hre' })).toHaveCount(0);
});

test('after a clue tap the hint and the count are on screen without scrolling (QA F1)', async ({ page }) => {
  await page.goto('./');
  for (const [track, caseId] of [['junior', 'j1-drak-zadarmo'], ['teen', 't2-cheat-zadarmo']] as const) {
    await page.evaluate(() => localStorage.setItem('stopa.progress.v1', JSON.stringify({ version: 1, cases: { 't1-lahka-brigada': { stars: 1, closed: true } }, lastTrack: null, sound: false })));
    await page.goto('./');
    await page.locator(`[data-track="${track}"]`).click();
    await page.locator(`[data-case="${caseId}"]`).click();
    // cases 2+ open with a recall question: answer it with any option, then continue
    const recall = page.locator('[data-recall]');
    if (await recall.count()) {
      await recall.first().click();
      await page.locator('section.screen .btn').last().click();
    }
    await page.locator('section.screen .btn').first().click();
    const clue = page.locator('[data-clue]').first();
    await clue.click();
    await expect(page.locator('.scan-bar .tip')).toBeInViewport({ ratio: 1 });
    await expect(page.getByTestId('clue-count')).toBeInViewport();
    await expect(page.getByTestId('clue-count')).toHaveText(/^1\//);
    await page.getByRole('button', { name: 'Úvod' }).click();
    await page.getByRole('button', { name: 'Odísť' }).click();
  }
});

test('keyboard focus on evidence is never hidden under the scan bar (QA F16, WCAG 2.4.11)', async ({ page }) => {
  for (const size of [{ width: 640, height: 400 }, { width: 320, height: 568 }, { width: 360, height: 740 }]) {
    await page.setViewportSize(size);
    await page.goto('./');
    await page.locator('[data-track="teen"]').click();
    await page.locator('[data-case="t1-lahka-brigada"]').click();
    await page.locator('section.screen .btn').first().click();
    await expect(page.locator('.scan-bar')).toBeVisible();
    // 200 % zoom (640×400): the bar stays a compact band
    const barH = await page.locator('.scan-bar').evaluate((el) => el.getBoundingClientRect().height);
    if (size.height <= 500) expect(barH).toBeLessThanOrEqual(size.height * 0.3);
    const stops = await page.locator('.evidence .tap').count();
    expect(stops).toBeGreaterThan(5);
    await page.locator('.evidence .tap').first().focus();
    for (let i = 0; i < stops; i++) {
      if (i > 0) await page.keyboard.press('Tab');
      const box = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        const bar = document.querySelector('.scan-bar')!.getBoundingClientRect();
        return { tap: el.classList.contains('tap'), top: r.top, bottom: r.bottom, barTop: bar.top };
      });
      expect(box.tap, `stop ${i} at ${size.width}×${size.height}`).toBe(true);
      expect(box.top, `stop ${i} at ${size.width}×${size.height}`).toBeGreaterThanOrEqual(0);
      expect(box.bottom, `stop ${i} at ${size.width}×${size.height}`).toBeLessThanOrEqual(box.barTop);
    }
  }
});

test('leaving a case mid-play asks first, with the Úvod button and with browser Back (QA F7)', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-track="junior"]').click();
  await page.locator('[data-case="j1-drak-zadarmo"]').click();
  await page.getByRole('button', { name: 'Vziať lupu' }).click();
  await page.locator('[data-clue="sender"]').click();

  await page.goBack();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zostať v prípade' })).toBeFocused();
  await page.getByRole('button', { name: 'Zostať v prípade' }).click();
  await expect(page.getByTestId('clue-count')).toHaveText('1/5');

  // QA F17: the dialog is modal (the case behind it is inert) and Escape means "Zostať"
  await page.getByRole('button', { name: 'Úvod' }).click();
  await expect(page.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
  expect(await page.locator('[data-clue]').first().evaluate((el) => el.closest('[inert]') !== null)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Úvod' })).toBeFocused();
  await expect(page.getByTestId('clue-count')).toHaveText('1/5');

  await page.getByRole('button', { name: 'Úvod' }).click();
  await page.getByRole('button', { name: 'Odísť' }).click();
  await expect(page.getByRole('heading', { name: 'Vyber si trasu' })).toBeVisible();

  // Back from a track goes to the start screen; Back from an unstarted case goes to its track without asking
  await page.locator('[data-track="junior"]').click();
  await page.locator('[data-case="j1-drak-zadarmo"]').click();
  await page.goBack();
  await expect(page.locator('[data-case="j1-drak-zadarmo"]')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Vyber si trasu' })).toBeVisible();
});

test('teen track renders in its own theme and plays T1 to the debrief', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-track="teen"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'teen');
  await axe(page);
  await page.locator('[data-case="t1-lahka-brigada"]').click();
  await page.getByRole('button', { name: 'Otvoriť spis' }).click();
  await page.getByRole('button', { name: 'Tip' }).click();
  await expect(page.locator('.tip')).toContainText('Dôkaz A');
  for (const id of ['pay', 'noexp', 'account', 'forward', 'login']) await page.locator(`[data-clue="${id}"]`).click();
  await axe(page);
  await page.getByRole('button', { name: 'Rozhodnúť' }).click();
  await page.locator('[data-option="refuse"]').click();
  await page.getByRole('button', { name: /ako to overiť/ }).click();

  // verify: a wrong channel explains why and lets the player pick again
  await page.locator('[data-option="followers"]').click();
  await expect(page.getByText('Čísla nič neoveria')).toBeVisible();
  await page.getByRole('button', { name: 'Vybrať iný spôsob overenia' }).click();
  await page.locator('[data-option="ask-in-person"]').click();
  await page.getByRole('button', { name: /Oto už povedal áno/ }).click();

  // lock-up: one distractor tap (1 error), then the steps in order; focus stays on a card, then on the close button
  await page.locator('[data-card="send-on"]').click();
  await expect(page.locator('.tip')).toContainText('Peniaze už nikam neposielať');
  for (const id of ['stop', 'tell-adult', 'call-bank']) {
    await page.locator(`[data-card="${id}"]`).click();
    await expect(page.locator('.lock-card:focus')).toHaveCount(1);
  }
  await page.locator('[data-card="police"]').click();
  await expect(page.getByRole('button', { name: 'Uzavrieť prípad' })).toBeFocused();
  await expect(page.locator('.tip')).toContainText('Presne tak.');
  await axe(page);
  await page.getByRole('button', { name: 'Uzavrieť prípad' }).click();
  await expect(page.getByText('UZAVRETÉ')).toBeVisible();
  // the first verify pick was wrong, so 2 of 3 stars
  await expect(page.getByRole('img', { name: 'Hviezdy: 2 z 3' })).toBeVisible();
  await axe(page);
});

test('reset progress asks first, then clears stars', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('stopa.progress.v1', JSON.stringify({ version: 1, cases: { 'j1-drak-zadarmo': { stars: 2, closed: true } }, lastTrack: 'junior', sound: false })));
  await page.reload();
  await page.locator('[data-track="junior"]').click();
  await expect(page.locator('[data-case="j1-drak-zadarmo"]')).toContainText('Uzavretý');
  await page.getByRole('button', { name: 'Vymazať postup' }).click();
  await page.getByRole('button', { name: 'Áno, vymazať' }).click();
  await expect(page.locator('[data-case="j1-drak-zadarmo"]')).toContainText('Otvorený spis');
  await expect(page.getByRole('button', { name: 'Vymazať postup' })).toBeFocused();
  // settings survive the reset, stars do not (sceptic 13c)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('stopa.progress.v1') ?? 'null') as { cases: object; lastTrack: string } | null);
  expect(stored?.cases).toEqual({});
  expect(stored?.lastTrack).toBe('junior');
});

test('works offline after the first load', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Vyber si trasu' })).toBeVisible();
  await page.locator('[data-track="junior"]').click();
  await expect(page.locator('[data-case="j1-drak-zadarmo"]')).toBeVisible();
  await context.setOffline(false);
});

// Every case's best path, data-driven from content/ (sceptic 13e).
const loaded = loadContent(resolve(import.meta.dirname, '../../content'));
for (const t of loaded.content?.tracks ?? []) {
  for (const id of t.cases) {
    const c = loaded.content?.cases[id];
    if (!c) continue;
    test(`best path: ${t.id} ${c.id}`, async ({ page }) => {
      await page.goto('./');
      // every case unlocked
      const cases = Object.fromEntries(t.cases.map((x) => [x, { stars: 0, closed: true }]));
      await page.evaluate((v) => localStorage.setItem('stopa.progress.v1', v), JSON.stringify({ version: 1, cases, lastTrack: null, sound: false }));
      await page.goto('./');
      await page.locator(`[data-track="${t.id}"]`).click();
      await page.locator(`[data-case="${c.id}"]`).click();
      const btn = page.locator('section.screen > .btn, section.screen > .row > .btn, .scan-bar .row > .btn').first();

      if (c.recall) {
        const right = c.recall.options.find((o) => o.correct);
        await page.locator(`[data-recall="${right?.id}"]`).click();
        await page.getByRole('button', { name: c.recall.button, exact: true }).click();
      }
      await page.getByRole('button', { name: c.intro.button, exact: true }).click();
      for (const ev of c.evidence) for (const l of ev.lines) for (const sg of l.segments) if (sg.clue && !c.scan.pre_found.includes(sg.clue.id)) await page.locator(`[data-clue="${sg.clue.id}"]`).click();
      await page.getByRole('button', { name: c.scan.button, exact: true }).click();

      const best = c.decision.options.find((o) => o.outcome === 'best');
      await page.locator(`[data-option="${best?.id}"]`).click();
      await expect(page.locator('.result.best')).toBeVisible();
      await btn.click();
      if (c.verify) {
        const vb = c.verify.options.find((o) => o.outcome === 'best');
        await page.locator(`[data-option="${vb?.id}"]`).click();
        await expect(page.locator('.result.best')).toBeVisible();
        await btn.click();
      }
      if (c.trust_or_trap) {
        const tt = c.trust_or_trap;
        for (const item of tt.items) {
          await page.getByRole('button', { name: item.answer === 'trust' ? tt.trust_label : tt.trap_label, exact: true }).click();
          await expect(page.locator('.tip')).toContainText('Správne.');
          await btn.click();
        }
      }
      if (c.lock_up) {
        for (const st of c.lock_up.steps) await page.locator(`[data-card="${st.id}"]`).click();
        await page.getByRole('button', { name: 'Uzavrieť prípad' }).click();
      }
      await expect(page.getByRole('img', { name: `Hviezdy: ${c.stars.length} z ${c.stars.length}` })).toBeVisible();
      await expect(page.getByText(c.debrief.rule)).toBeVisible();
      for (const next of ['Stopy', 'Ak sa to už stalo', 'Stopa v príbehu']) await page.getByRole('button', { name: `Ďalej: ${next}` }).click();
      await expect(page.getByText(c.debrief.story_clue.title)).toBeVisible();
      await axe(page);
    });
  }
}
