'use client';

import ThemeToggle from '@/components/ThemeToggle';

import styles from './index.module.scss';

function IconRotate() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false">
      <path d="M13.5 7.5A6 6 0 1 1 7.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 1.5v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false">
      <path d="M2 7.5A5.5 5.5 0 1 1 3.38 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 11.5v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  rotating: boolean;
  theme: 'dark' | 'light';
  onRotateToggle: () => void;
  onReset: () => void;
  onThemeToggle: () => void;
}

export default function BottomControls({
  rotating,
  theme,
  onRotateToggle,
  onReset,
  onThemeToggle,
}: Props) {
  return (
    <nav className={styles.menu} role="toolbar" aria-label="Globe controls">
      <button
        className={`${styles.btn} ${rotating ? styles.active : ''}`}
        onClick={onRotateToggle}
        aria-pressed={rotating}
        aria-label={rotating ? 'Stop rotation' : 'Start rotation'}
      >
        <span className={styles.btnIcon}>
          <IconRotate />
        </span>
        {rotating ? 'Stop' : 'Rotate'}
      </button>

      <div className={styles.sep} role="separator" aria-orientation="vertical" />

      <button
        className={styles.btn}
        onClick={onReset}
        aria-label="Reset globe to default view"
      >
        <span className={styles.btnIcon}>
          <IconReset />
        </span>
        Reset
      </button>

      <div className={styles.sep} role="separator" aria-orientation="vertical" />

      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </nav>
  );
}
