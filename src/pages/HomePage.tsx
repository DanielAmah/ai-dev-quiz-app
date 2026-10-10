import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchQuizzes } from '@/services/quizApi';
import { loadSession, useProfile } from '@/state';
import { useAsync } from '@/hooks/useAsync';
import { describeError } from '@/utils/errorMessages';
import { Button } from '@/components/common/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateMessage';
import { QuizCard } from '@/components/quiz/QuizCard';
import styles from './HomePage.module.css';

const ALL_CATEGORIES = 'All';

export default function HomePage() {
  const { status, data, error, reload } = useAsync(fetchQuizzes, []);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState('');
  const searchId = useId();
  const categoryId = useId();

  // Read once per render; the session only changes when the user leaves this page.
  const resumable = useMemo(() => {
    const session = loadSession();
    return session?.status === 'in-progress' ? session : null;
  }, []);

  const { profile } = useProfile();

  const quizzes = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(quizzes.map((quiz) => quiz.category))).sort((a, b) =>
      a.localeCompare(b),
    );
    return [ALL_CATEGORIES, ...unique];
  }, [quizzes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      if (category !== ALL_CATEGORIES && quiz.category !== category) return false;
      if (!term) return true;
      return (
        quiz.title.toLowerCase().includes(term) ||
        quiz.description.toLowerCase().includes(term) ||
        quiz.category.toLowerCase().includes(term)
      );
    });
  }, [quizzes, category, search]);

  const hasActiveFilters = category !== ALL_CATEGORIES || search.trim() !== '';

  const clearFilters = () => {
    setCategory(ALL_CATEGORIES);
    setSearch('');
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {profile ? `Welcome back, ${profile.username}` : 'AI Development Quizzes'}
        </h1>
        <p className={styles.heroText}>
          Test and reinforce your understanding of AI software development: agent design, prompt
          engineering, workflow automation.
        </p>
      </section>

      {resumable && (
        <div className={styles.resume} role="status">
          <div>
            <strong>Resume your quiz</strong>
            <p className={styles.resumeText}>You have an attempt in progress.</p>
          </div>
          <Link to={`/quiz/${resumable.quizId}`} className={styles.resumeLink}>
            Resume
          </Link>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Loading quizzes…" />}

      {status === 'error' && (
        <ErrorState
          title="Couldn’t load quizzes"
          description={describeError(error)}
          action={
            <Button variant="primary" onClick={reload}>
              Retry
            </Button>
          }
        />
      )}

      {status === 'success' && quizzes.length === 0 && (
        <EmptyState
          icon="📭"
          title="No quizzes yet"
          description="Check back soon — new quizzes are on the way."
        />
      )}

      {status === 'success' && quizzes.length > 0 && (
        <>
          <div className={styles.controls}>
            <div className={styles.field}>
              <label htmlFor={searchId} className={styles.label}>
                Search quizzes
              </label>
              <input
                id={searchId}
                type="search"
                className={styles.search}
                placeholder="Search by title, topic or description"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={categoryId} className={styles.label}>
                Category
              </label>
              <select
                id={categoryId}
                className={styles.select}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No quizzes match"
              description="Try a different search term or category."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className={styles.grid} aria-label="Available quizzes">
              {filtered.map((quiz) => (
                <li key={quiz.id}>
                  <QuizCard quiz={quiz} />
                </li>
              ))}
            </ul>
          )}

          {hasActiveFilters && filtered.length > 0 && (
            <p className={styles.resultCount}>
              Showing {filtered.length} of {quizzes.length} quizzes
            </p>
          )}
        </>
      )}
    </div>
  );
}
