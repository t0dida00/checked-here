'use client';

import { useState } from 'react';
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

function IconCamera() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
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
  const [showCheckinMenu, setShowCheckinMenu] = useState(false);

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

      <div className={styles.checkinWrapper}>
        <button
          className={`${styles.btn} ${showCheckinMenu ? styles.active : ''}`}
          onClick={() => setShowCheckinMenu(!showCheckinMenu)}
          aria-label="Checkin new location"
        >
          <span className={styles.btnIcon}>
            <IconCamera />
          </span>
          Checkin
        </button>

        {showCheckinMenu && (
          <div className={styles.popupMenu}>
            <button className={styles.popupItem}>Current your location</button>
            <button className={styles.popupItem}>Enter location manually</button>
            <button className={styles.popupItem}>With the sights</button>
          </div>
        )}
      </div>

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
