'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  analyzeCoordinates,
  createCheckin,
  type CurrentLocationAnalysis,
  type ManualLocationSuggestion,
  searchLocations,
} from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import { locationsQueryKey } from '@/hooks/useLocations';

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
  onCurrentLocationDetected?: (location: CurrentLocationAnalysis) => void;
}

export default function BottomControls({
  rotating,
  theme,
  onRotateToggle,
  onReset,
  onThemeToggle,
  onCurrentLocationDetected,
}: Props) {
  const queryClient = useQueryClient();
  const [showCheckinMenu, setShowCheckinMenu] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingManual, setIsSearchingManual] = useState(false);
  const [showManualLocationModal, setShowManualLocationModal] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [manualSuggestions, setManualSuggestions] = useState<ManualLocationSuggestion[]>([]);
  const [locationError, setLocationError] = useState('');
  const [locationAnalysis, setLocationAnalysis] =
    useState<CurrentLocationAnalysis | null>(null);

  const closeCheckinUi = () => {
    setShowCheckinMenu(false);
    setShowManualLocationModal(false);
    setLocationAnalysis(null);
    setLocationError('');
    setIsLocating(false);
    setIsSearchingManual(false);
    setManualQuery('');
    setManualSuggestions([]);
  };

  useEffect(() => {
    if (!showManualLocationModal) return;

    const trimmedQuery = manualQuery.trim();
    if (trimmedQuery.length < 2) {
      setManualSuggestions([]);
      setIsSearchingManual(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearchingManual(true);
      setLocationError('');

      void searchLocations(trimmedQuery)
        .then((results) => {
          setManualSuggestions(results);
        })
        .catch(() => {
          setLocationError('Unable to search locations right now.');
          setManualSuggestions([]);
        })
        .finally(() => {
          setIsSearchingManual(false);
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [manualQuery, showManualLocationModal]);

  const handleCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await analyzeCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });

          setShowCheckinMenu(false);
          setLocationAnalysis(result);
        } catch {
          setLocationError('Unable to analyze your current coordinates right now.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const handleConfirmCheckin = () => {
    if (!locationAnalysis) return;
    setIsSaving(true);
    setLocationError('');

    void createCheckin(locationAnalysis)
      .then((updatedLocations) => {
        queryClient.setQueryData(locationsQueryKey, updatedLocations);
        closeCheckinUi();
      })
      .catch(() => {
        setLocationError('Unable to save this checkin right now.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleManualLocationSelect = (suggestion: ManualLocationSuggestion) => {
    setShowManualLocationModal(false);
    setLocationError('');
    setLocationAnalysis({
      coordinate: suggestion.coordinate,
      city: suggestion.city,
      locality: suggestion.city,
      country: suggestion.country,
      countryCode: '',
      continent: suggestion.continent,
    });
  };

  return (
    <>
      {(showCheckinMenu || showManualLocationModal || locationAnalysis) && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={closeCheckinUi}
          aria-label="Close checkin dialog"
        />
      )}

      {showManualLocationModal && (
        <div
          className={styles.analysisModal}
          role="dialog"
          aria-modal="true"
          aria-label="Search location manually"
        >
          <div className={styles.manualSearchPanel}>
            <div className={styles.analysisTitle}>Enter location manually</div>
            <input
              type="text"
              value={manualQuery}
              onChange={(event) => setManualQuery(event.target.value)}
              placeholder="Search city, address, or country"
              className={styles.manualSearchInput}
              autoFocus
            />

            <div className={styles.manualSearchResults}>
              {isSearchingManual ? (
                <div className={styles.manualSearchHint}>Searching locations...</div>
              ) : null}

              {!isSearchingManual && manualQuery.trim().length < 2 ? (
                <div className={styles.manualSearchHint}>
                  Type at least 2 characters to see suggestions.
                </div>
              ) : null}

              {!isSearchingManual && manualQuery.trim().length >= 2 && manualSuggestions.length === 0 ? (
                <div className={styles.manualSearchHint}>No matching locations found.</div>
              ) : null}

              {manualSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={styles.manualSearchItem}
                  onClick={() => handleManualLocationSelect(suggestion)}
                >
                  <span className={styles.manualSearchPrimary}>{suggestion.city}</span>
                  <span className={styles.manualSearchSecondary}>{suggestion.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.modalSecondaryBtn} onClick={closeCheckinUi}>
              Cancel
            </button>
          </div>

          {locationError ? (
            <div className={styles.locationFeedback} role="status">
              {locationError}
            </div>
          ) : null}
        </div>
      )}

      {locationAnalysis && (
        <div
          className={styles.analysisModal}
          role="dialog"
          aria-modal="true"
          aria-label="Current location analysis"
        >
          <div className={styles.locationAnalysis}>
            <div className={styles.analysisTitle}>Current location analysis</div>
            <div className={styles.analysisRow}>
              <span>Coordinates</span>
              <strong>
                {locationAnalysis.coordinate.lat.toFixed(5)},{' '}
                {locationAnalysis.coordinate.lng.toFixed(5)}
              </strong>
            </div>
            <div className={styles.analysisRow}>
              <span>City</span>
              <strong>{locationAnalysis.city}</strong>
            </div>
            <div className={styles.analysisRow}>
              <span>Country</span>
              <strong>{locationAnalysis.country}</strong>
            </div>
            <div className={styles.analysisRow}>
              <span>Continent</span>
              <strong>{locationAnalysis.continent}</strong>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.modalPrimaryBtn}
              onClick={handleConfirmCheckin}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Checkin now'}
            </button>
            <button
              className={styles.modalSecondaryBtn}
              onClick={closeCheckinUi}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>

          {locationError ? (
            <div className={styles.locationFeedback} role="status">
              {locationError}
            </div>
          ) : null}
        </div>
      )}

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
            onClick={() => {
              setLocationError('');
              setLocationAnalysis(null);
              setShowCheckinMenu(!showCheckinMenu);
            }}
            aria-label="Checkin new location"
          >
            <span className={styles.btnIcon}>
              <IconCamera />
            </span>
            Checkin
          </button>

          {showCheckinMenu && (
            <div className={styles.popupMenu}>
              <button
                className={styles.popupItem}
                onClick={handleCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? 'Detecting current location...' : 'Use current location'}
              </button>
              <button
                className={styles.popupItem}
                onClick={() => {
                  setShowCheckinMenu(false);
                  setShowManualLocationModal(true);
                  setLocationError('');
                  setManualQuery('');
                  setManualSuggestions([]);
                }}
              >
                Enter location manually
              </button>
              <button className={styles.popupItem}>With the sights</button>

              {locationError ? (
                <div className={styles.locationFeedback} role="status">
                  {locationError}
                </div>
              ) : null}
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
    </>
  );
}
