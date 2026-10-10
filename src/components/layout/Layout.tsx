import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const links = [
  { to: '/', label: 'Quizzes', end: true },
  { to: '/history', label: 'Progress', end: false },
  { to: '/profile', label: 'Profile', end: false },
];

export function Layout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <NavLink to="/" className={styles.brand}>
            <span aria-hidden="true">🧠</span> AI Dev Quiz
          </NavLink>
          <nav aria-label="Primary">
            <ul className={styles.nav}>
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <p>A demo quiz platform for AI software development concepts.</p>
        </div>
      </footer>
    </div>
  );
}
