# AI Development Quiz App

An educational quiz platform for **AI software development** concepts — agent design,
prompt engineering and workflow automation. Browse quizzes, answer multiple-choice
questions with instant feedback and explanations, see a scored result with a review of
what you missed, and track your progress over time. State is local-first and survives
refreshes, and the UI is built to stay correct under real, messy interaction.

> Built with React + TypeScript + Vite. Quiz data comes from a mock API (static JSON),
> so the service layer is the single seam where a real backend would plug in.

## Quick start

```bash
npm install
npm run dev          # start the dev server (prints a local URL)
```

Then open the printed URL (default http://localhost:5173).

### Build and preview the production bundle

```bash
npm run build        # type-checks then builds to dist/
npm run preview      # serves the built app
```

### Quality checks

```bash
npm run lint         # ESLint (TypeScript, React hooks, jsx-a11y)
npm run typecheck    # tsc --build, strict
npm run format       # Prettier write  (format:check to verify)
npm test             # Vitest unit/component tests
npm run test:e2e     # Playwright end-to-end tests (builds + previews first)
npm run validate     # format:check + lint + typecheck + unit tests
```

The repo ships a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs the full
validate suite, a build, and the Playwright tests on every push and pull request.

## What it does

- **Browse & start** — a landing view explaining the app, a searchable, category-filtered
  catalog of quizzes, and a one-click start. A resume banner appears if you have an
  attempt in progress.
- **Take a quiz** — multiple-choice questions (≥5 each), immediate correct/incorrect
  feedback with an explanation, a progress indicator, Previous/Next, and retake.
- **See results** — total score and percentage, a performance message that varies by
  band, and a review of every missed question (your answer, the correct answer, the
  explanation).
- **Track progress** — attempt history that persists across sessions, a progress-over-time
  chart, per-quiz personal bests, and summary stats.
- **Stretch goals** — optional **Learn Mode** (explanation shown before answering) and
  **randomized question order**, chosen on the start screen. A local **profile** greets
  you by name.

## The constraints that matter (and how they're handled)

These are the things an agent's happy-path UI usually gets wrong. They're handled
deliberately and verified by driving the real app in a browser (`e2e/quiz.spec.ts`).

### Stays correct under rapid interaction
All quiz state lives in a **pure reducer** (`src/features/quiz/quizReducer.ts`):

- An answer is recorded **once per question**; re-answering (a rapid double-click, or a
  different option) is a no-op.
- `next`/`finish` are guarded by the current index and status, so repeated clicks can't
  skip a question or advance past the end.
- The **score is derived** from the recorded answers, never incremented — so there is
  nothing to double-count.

### Survives interruption (refresh / return later)
The active attempt is persisted to `localStorage` on every change
(`src/services/sessionStore.ts`). On load it's restored **only if** it's in progress,
belongs to this quiz, matches the quiz `version`, and its question set still matches —
otherwise it's discarded cleanly. On completion the attempt is written to history exactly
once and the active session is cleared.

### Loading / empty / error states everywhere
Data fetching goes through `useAsync`, which models `idle | loading | success | error` and
**aborts the in-flight request** on unmount or input change (no stale overwrites). Every
data screen renders a spinner while loading, a typed error with a Retry, or an empty
state — never a blank or broken view. A top-level **ErrorBoundary** catches render errors.

You can exercise these states on demand via query params (see below).

## Mock API

Quiz data is static JSON in `public/mock-api/quizzes/`, fetched through `fetch` with
simulated latency and `AbortSignal` support. Every response is **validated at runtime**
(`src/services/quizValidation.ts`) and errors are surfaced as a typed `ApiError`
(`network | not-found | invalid-data | aborted`).

Query params for exercising states (dev or preview):

| Param               | Effect                                        |
| ------------------- | --------------------------------------------- |
| `?mockDelay=2000`   | Override latency (ms)                         |
| `?mockError=catalog`| Force the catalog fetch to fail               |
| `?mockError=quiz`   | Force a quiz fetch to fail                    |
| `?mockError=all`    | Force everything to fail                      |
| `?mockEmpty=1`      | Return an empty catalog                       |

Default latency is `VITE_MOCK_LATENCY_MS` (see `.env.example`).

### Adding a quiz

1. Add `public/mock-api/quizzes/<id>.json` (≥5 questions; see an existing file for the
   shape).
2. Add its summary entry to `public/mock-api/quizzes/index.json`.

`src/services/quizData.test.ts` validates every file and checks the index matches, so a
malformed addition fails the test suite rather than the running app.

## Project structure

```
src/
  components/      reusable UI: common (Button, Spinner, state views, ErrorBoundary),
                   layout, quiz, results, history
  context/         HistoryProvider, ProfileProvider (localStorage-backed state)
  features/quiz/   the quiz state machine, session binding, attempt builder
  hooks/           useAsync
  pages/           Home, Quiz, Results, History, Profile, NotFound
  services/        mock quiz API, storage layer, validation
  styles/          design tokens + global CSS
  types/           domain types
  utils/           shuffle, id, username validation, performance bands, error messages
public/mock-api/   static JSON "backend"
e2e/               Playwright specs
docs/              PLAN.md (architecture & ticket breakdown)
```

## Trade-offs: what was prioritised, what was left out

**Prioritised**

- **Correctness of state over feature breadth.** The reducer and persistence logic are
  pure, unit-tested, and the real risks (rapid clicks, refresh, async failure) are proven
  in a browser. This is the heart of the brief.
- **Local-first with a clean API seam.** `services/` is the only place that knows where
  data comes from; swapping the mock for a real backend is a localized change. Storage is
  versioned and fault-tolerant (private mode, quota, corruption all handled).
- **Accessibility and consistency.** Semantic radio groups, labelled controls, an aria
  progressbar, a described SVG chart, visible focus rings, reduced-motion support, and a
  small design-token system for consistent styling — no CSS framework dependency.
- **Type safety and automated quality.** Strict TypeScript, ESLint (incl. jsx-a11y),
  Prettier, unit + e2e tests, all enforced in CI.

**Deliberately left out of v1**

- A real backend, user accounts and a global leaderboard — the local-first approach keeps
  scope honest; the service layer marks where a server would go.
- Timed questions and daily/weekly challenges.
- Internationalisation and theming beyond the single dark theme.

## Tech

React 19, TypeScript (strict), Vite, React Router, CSS Modules, Vitest + Testing Library,
Playwright, ESLint + Prettier. See `docs/PLAN.md` for the full plan and the ticket
breakdown that maps to the GitHub issues.
