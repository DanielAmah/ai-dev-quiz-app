# AI Development Quiz App: Plan

This is the working plan for v1. Every ticket below is a GitHub issue; they are worked
one after another, and each commit references the issue it belongs to.

## Product goals

1. Help users learn and test AI software development concepts (agent design, prompt
   engineering, workflow automation).
2. A smooth quiz flow: browse, start, answer with instant feedback, see results, retake.
3. Progress that persists across sessions and is visible over time.
4. Easy to extend: adding a quiz is adding a JSON file, not changing code.
5. Correct under real interaction: rapid clicks, refreshes and slow or failing data.

## Architecture decisions

| Area         | Decision                                                                                       | Why                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Build        | Vite + React 19 + TypeScript (strict)                                                          | Fast dev loop; types make the data shape and state transitions explicit.                              |
| Routing      | React Router with URL per screen (`/quiz/:id`, `/results/:attemptId`)                          | Every screen survives a refresh and is linkable.                                                      |
| Quiz state   | `useReducer` with a pure, guarded reducer                                                      | Transitions are testable without React; guards make duplicate events no-ops.                          |
| Score        | Derived from `answers`, never incremented                                                      | A double click cannot double-count something that is computed.                                        |
| Persistence  | `localStorage` behind a storage service: namespaced, versioned keys, runtime validation        | Corrupt or outdated data is discarded deliberately instead of crashing the app.                       |
| Shared state | React Context for attempt history and profile, backed by `useSyncExternalStore`                | One source of truth that also stays in sync across browser tabs.                                      |
| Mock API     | Static JSON under `public/mock-api`, fetched with simulated latency and an opt-in failure mode | Real async with real failure paths; new quizzes are new files.                                        |
| Styling      | CSS Modules plus a small token file (CSS custom properties)                                    | Scoped, dependency-free, consistent spacing and colour.                                               |
| Quality      | ESLint (TS, hooks, a11y) + Prettier + Vitest + Playwright + GitHub Actions                     | Formatting is automatic, logic is unit tested, and the hard constraints are tested in a real browser. |

## Data shape

```ts
QuizSummary { id, title, category, description, difficulty, questionCount, estimatedMinutes, version }
Quiz extends QuizSummary { questions: Question[] }
Question { id, prompt, options: { id, text }[], correctOptionId, explanation }

QuizSession { schemaVersion, attemptId, quizId, quizVersion, mode, questionOrder, currentIndex,
              answers: Record<questionId, optionId>, status, startedAt, completedAt? }
AttemptRecord { id, quizId, quizTitle, category, mode, score, total, percentage,
                startedAt, completedAt, answers: AnsweredQuestion[] }
```

## Tickets

| #   | Ticket                                                                      | Depends on |
| --- | --------------------------------------------------------------------------- | ---------- |
| 1   | Epic: AI Development Quiz App v1                                            |            |
| 2   | Project setup: Vite, React, TypeScript, ESLint, Prettier, folders, CI       |            |
| 3   | Quiz data model and mock API service                                        | 2          |
| 4   | Versioned persistence layer for local storage                               | 2          |
| 5   | App shell: routing, layout, error boundary, loading/empty/error components  | 2          |
| 6   | Landing page and quiz catalog with category filter and search               | 3, 5       |
| 7   | Quiz session state machine that is safe under rapid clicks                  | 3          |
| 8   | Quiz-taking UI: questions, feedback, explanations, progress indicator       | 6, 7       |
| 9   | Resume a quiz after refresh or interruption                                 | 4, 8       |
| 10  | Results page: score, percentage, performance message, missed review, retake | 8          |
| 11  | Progress tracking: attempt history, progress chart, personal bests          | 4, 10      |
| 12  | Profile: username form with validation                                      | 4, 5       |
| 13  | Stretch: randomized question order and Learn Mode                           | 8, 9       |
| 14  | End-to-end tests for rapid clicks, refresh and error states                 | 9, 10, 11  |
| 15  | Documentation: README, trade-offs, chat history                             | all        |

## Deliberately out of scope for v1

- A real backend, accounts and a global leaderboard (local-first keeps the scope honest;
  the service layer is the seam where a real API would plug in).
- Daily or weekly challenges.
- Timed questions.
- Internationalisation.
