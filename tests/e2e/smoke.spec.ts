import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function axe(page: Page) {
  // Let the stamp and clue animations finish, so contrast is measured on the final colours.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  // Nothing may leave the device: fail on any request to another origin.
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && !url.protocol.startsWith('data')) throw new Error(`external request: ${req.url()}`);
  });
});

test('J1 "Drak zadarmo" plays from the start screen to the closed case file', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /Kancelária STOPA/ })).toBeVisible();
  await axe(page);

  await page.locator('[data-track="junior"]').click();
  await page.locator('[data-case="j1-drak-zadarmo"]').click();
  await expect(page.getByText('Vitaj v STOPE. Práve prišla klientka.')).toBeVisible();
  await page.getByRole('button', { name: 'Vziať lupu' }).click();

  // a decoy gives a hint but no clue
  await page.getByRole('button', { name: /GRATULUJEME/ }).click();
  await expect(page.locator('.tip')).toContainText('Toto samo osebe stopa nie je');
  await expect(page.getByTestId('clue-count')).toHaveText('0/5');
  for (const id of ['sender', 'prize', 'hurry', 'link']) await page.locator(`[data-clue="${id}"]`).click();
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
    await page.getByRole('button', { name: i === answers.length - 1 ? 'Uzavrieť prípad' : 'Ďalej' }).click();
  }

  await expect(page.getByText('UZAVRETÉ')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Hviezdy: 3 z 3' })).toBeVisible();
  await expect(page.getByText('Nový odznak: Bronzová lupa.')).toBeVisible();
  await expect(page.getByText('Ak sa to už stalo')).toBeVisible();
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
  await expect(page.getByText('116 111')).toBeVisible();
  await axe(page);
  await page.getByRole('button', { name: 'Späť do hry' }).click();

  await page.locator('[data-track="junior"]').click();
  await page.locator('[data-case="j1-drak-zadarmo"]').click();
  await page.getByRole('button', { name: 'Vziať lupu' }).click();
  await page.locator('[data-clue="sender"]').click();
  await page.getByRole('button', { name: 'Pomoc' }).click();
  await expect(page.getByText('116 111')).toBeVisible();
  await page.getByRole('button', { name: 'Späť do hry' }).click();
  await expect(page.getByTestId('clue-count')).toHaveText('1/5');
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

  // lock-up: one distractor tap (1 error), then the steps in order
  await page.locator('[data-card="send-on"]').click();
  await expect(page.locator('.tip')).toContainText('Peniaze už nikam neposielať');
  for (const id of ['stop', 'tell-adult', 'call-bank', 'police']) await page.locator(`[data-card="${id}"]`).click();
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
  expect(await page.evaluate(() => localStorage.getItem('stopa.progress.v1'))).toBeNull();
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
  await expect(page.getByRole('heading', { name: /Kancelária STOPA/ })).toBeVisible();
  await page.locator('[data-track="junior"]').click();
  await expect(page.locator('[data-case="j1-drak-zadarmo"]')).toBeVisible();
  await context.setOffline(false);
});
