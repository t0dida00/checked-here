'use client';

import styles from './index.module.scss';

interface Props {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={onToggle}
      // WCAG 2.1 SC 1.3.1 — communicates state to assistive tech
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span aria-hidden="true" className={styles.icon}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
