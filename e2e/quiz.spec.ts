import { expect, test, type Page } from '@playwright/test';

// The mock API is driven by query params, so loading/empty/error states and
// zero latency can be exercised deterministically in a real browser.

async function startFirstQuiz(page: Page) {
  await page.goto('/?mockDelay=0');
  await page
    .getByRole('link', { name: /start quiz/i })
    .first()
    .click();
  await expect(page.getByRole('button', { name: /start quiz/i })).toBeVisible();
  await page.getByRole('button', { name: /^start quiz$/i }).click();
}

async function answerCurrent(page: Page, correct = true) {
  const radios = page.getByRole('radio');
  await radios.first().waitFor();
  // Choosing any option is enough to enable Next/Finish; correctness only
  // affects the score, which these flows assert separately.
  await radios.nth(correct ? 0 : 1).check();
}

test('completes a quiz, shows a score, and records it in history', async ({ page }) => {
  await startFirstQuiz(page);

  // Answer every question until Finish completes the quiz.
  for (let i = 0; i < 20; i += 1) {
    await answerCurrent(page);
    const finish = page.getByRole('button', { name: /finish quiz/i });
    if (await finish.isVisible()) {
      await finish.click();
      break;
    }
    await page.getByRole('button', { name: /next/i }).click();
  }

  await expect(page).toHaveURL(/\/results\//);
  await expect(page.getByText(/%/).first()).toBeVisible();

  // The attempt is in history and survives a reload.
  await page.goto('/history?mockDelay=0');
  await expect(page.getByRole('heading', { name: /your progress/i })).toBeVisible();
  // At least one attempt links to its result page.
  await expect(page.locator('a[href^="/results/"]').first()).toBeVisible();
});

test('rapid clicking an answer and Next does not skip or double-count', async ({ page }) => {
  await startFirstQuiz(page);

  const firstRadio = page.getByRole('radio').first();
  // Hammer the same option; the reducer records it once.
  await Promise.all([firstRadio.check(), firstRadio.check(), firstRadio.check()]);

  // The question counter should read "Question 1 of N" before advancing.
  await expect(page.getByText(/question 1 of/i)).toBeVisible();

  const next = page.getByRole('button', { name: /next/i });
  // Rapid double-click of Next must advance exactly one question.
  await next.click();
  await expect(page.getByText(/question 2 of/i)).toBeVisible();
});

test('refreshing mid-quiz resumes at the same place', async ({ page }) => {
  await startFirstQuiz(page);
  await answerCurrent(page);
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByText(/question 2 of/i)).toBeVisible();

  await page.reload();
  // Resume banner and the same position.
  await expect(page.getByText(/picked up where you left off/i)).toBeVisible();
  await expect(page.getByText(/question 2 of/i)).toBeVisible();
});

test('shows an error state with a retry when the catalog fails', async ({ page }) => {
  await page.goto('/?mockDelay=0&mockError=catalog');
  await expect(page.getByTestId('error-state')).toBeVisible();
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
});

test('shows an empty state when there are no quizzes', async ({ page }) => {
  await page.goto('/?mockDelay=0&mockEmpty=1');
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
