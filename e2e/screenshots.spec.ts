import { test } from '@playwright/test';

// Not a functional test — captures screenshots of the key screens for review.
test('capture key screens', async ({ page }) => {
  await page.goto('/?mockDelay=0');
  await page.getByRole('article').first().waitFor();
  await page.screenshot({ path: 'test-results/shots/01-catalog.png', fullPage: true });

  await page
    .getByRole('link', { name: /start quiz/i })
    .first()
    .click();
  await page.getByRole('button', { name: /^start quiz$/i }).click();
  await page.getByRole('radio').first().check();
  await page.screenshot({ path: 'test-results/shots/02-question-feedback.png', fullPage: true });

  for (let i = 0; i < 20; i += 1) {
    const finish = page.getByRole('button', { name: /finish quiz/i });
    if (await finish.isVisible()) {
      await finish.click();
      break;
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('radio').first().check();
  }
  await page.waitForURL(/\/results\//);
  await page.screenshot({ path: 'test-results/shots/03-results.png', fullPage: true });

  await page.goto('/history?mockDelay=0');
  await page.screenshot({ path: 'test-results/shots/04-progress.png', fullPage: true });
});
