'use client';

import React, { useMemo, useState } from 'react';
import { useLocations, type LocationItem } from '@/hooks/useLocations';
import styles from './index.module.scss';

// Icons
const ChevronIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,19.93C7.05,19.43 4,16.05 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16C9,17.1 9.9,18 11,18V19.93M17.9,17.39C17.64,16.58 16.9,16 16,16H15V13C15,12.45 14.55,12 14,12H8V10H10C10.55,10 11,9.55 11,9V7H13C14.1,7 15,6.1 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39Z" />
  </svg>
);

const FlagIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z" />
  </svg>
);

const PinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z" />
  </svg>
);

const SidebarRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M13,12L8,7V17L13,12M15,5H17V19H15V5Z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
  </svg>
);

const LocationSmallIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12,2C15.86,2 19,5.13 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9C5,5.13 8.13,2 12,2M12,4C9.24,4 7,6.24 7,9C7,11.5 9.56,15.9 12,19.34C14.44,15.9 17,11.5 17,9C17,6.24 14.76,4 12,4M12,7A2,2 0 0,1 14,9A2,2 0 0,1 12,11A2,2 0 0,1 10,9A2,2 0 0,1 12,7Z" />
  </svg>
);

interface TreeCountry {
  name: string;
  cities: LocationItem[];
  flag: string;
}

interface TreeContinent {
  name: string;
  countries: Record<string, TreeCountry>;
}

interface LocationsPanelProps {
  onLocationClick?: (locations: LocationItem[]) => void;
}

export default function LocationsPanel({ onLocationClick }: LocationsPanelProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'North America': true,
    'Europe': true,
    'Asia': true
  });

  const { data, isLoading, isError } = useLocations();
  const locations: LocationItem[] = data?.locations ?? [];

  const { rootData, stats } = useMemo(() => {
    const data: Record<string, TreeContinent> = {};
    const uniqueCountries = new Set<string>();
    
    locations.forEach((loc) => {
      if (!data[loc.continent]) {
        data[loc.continent] = { name: loc.continent, countries: {} };
      }
      if (!data[loc.continent].countries[loc.country]) {
        data[loc.continent].countries[loc.country] = {
          name: loc.country,
          cities: [],
          flag: loc.flag,
        };
      }
      data[loc.continent].countries[loc.country].cities.push(loc);
      uniqueCountries.add(loc.country);
    });

    return {
      rootData: data,
      stats: {
        continents: Object.keys(data).length,
        countries: uniqueCountries.size,
        cities: locations.length,
      }
    };
  }, [locations]);

  const filteredData = useMemo(() => {
    if (!filterQuery) return rootData;
    const lowerQuery = filterQuery.toLowerCase();
    
    const result: Record<string, TreeContinent> = {};
    
    Object.values(rootData).forEach(continent => {
      let matchesCont = continent.name.toLowerCase().includes(lowerQuery);
      let matchedCountries: Record<string, TreeCountry> = {};
      
      Object.values(continent.countries).forEach(country => {
        let matchesCtry = country.name.toLowerCase().includes(lowerQuery);
        let matchedCities = country.cities.filter(city => city.city.toLowerCase().includes(lowerQuery));
        
        if (matchesCont || matchesCtry || matchedCities.length > 0) {
          matchedCountries[country.name] = {
            ...country,
            cities: (matchesCont || matchesCtry) ? country.cities : matchedCities
          };
        }
      });
      
      if (matchesCont || Object.keys(matchedCountries).length > 0) {
        result[continent.name] = {
          ...continent,
          countries: matchedCountries
        };
      }
    });
    
    return result;
  }, [rootData, filterQuery]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsedPanel : ''}`}>
      <header className={styles.header}>
        <div className={styles.title}>
          <GlobeIcon />
          <span>My World</span>
        </div>
        <div className={styles.tags}>
          <div className={`${styles.tag} ${styles.tagCont}`}>CONT <span>{stats.continents}</span></div>
          <div className={`${styles.tag} ${styles.tagCtry}`}>CTRY <span>{stats.countries}</span></div>
          <div className={`${styles.tag} ${styles.tagCity}`}>CITY <span>{stats.cities}</span></div>
        </div>
        <button className={styles.closeBtn} onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand panel" : "Collapse panel"}>
          <SidebarRightIcon />
        </button>
      </header>

      {!collapsed && (
        <>
          <div className={styles.filterContainer}>
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search locations..." 
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)} 
              className={styles.filterInput}
            />
          </div>

          {isLoading && <div className={styles.treeList}>Loading…</div>}
          {isError && <div className={styles.treeList}>Failed to load locations.</div>}
          <div className={styles.treeList}>
            {Object.values(filteredData).map((continent) => {
              const isContExpanded = filterQuery ? true : expandedNodes[continent.name];
              const countryCount = Object.keys(continent.countries).length;

              return (
                <div key={continent.name} className={styles.treeNodeContainer}>
                  <div 
                    className={`${styles.treeNode} ${styles.level0}`} 
                    onClick={() => {
                      toggleNode(continent.name);
                    }}
                  >
                    <ChevronIcon className={`${styles.chevron} ${isContExpanded ? styles.expanded : ''}`} />
                    <GlobeIcon className={styles.icon} />
                    <span className={styles.nodeName}>{continent.name}</span>
                    <span className={styles.badge}>{countryCount}</span>
                  </div>
                  
                  {isContExpanded && (
                    <div className={styles.children}>
                      {Object.values(continent.countries).map((country) => {
                        const countryId = `${continent.name}-${country.name}`;
                        const isCtryExpanded = filterQuery ? true : expandedNodes[countryId];
                        const cityCount = country.cities.length;

                        return (
                          <div key={country.name} className={styles.treeNodeContainer}>
                            <div 
                              className={`${styles.treeNode} ${styles.level1}`} 
                              onClick={() => {
                                toggleNode(countryId);
                              }}
                            >
                              <ChevronIcon className={`${styles.chevron} ${isCtryExpanded ? styles.expanded : ''}`} />
                              {country.flag ? (
                                <img
                                  src={country.flag}
                                  alt={`${country.name} flag`}
                                  className={styles.countryFlag}
                                />
                              ) : (
                                <FlagIcon className={styles.icon} />
                              )}
                              <span className={styles.nodeName}>{country.name}</span>
                              <span className={styles.badge}>{cityCount}</span>
                            </div>
                            
                            {isCtryExpanded && (
                              <div className={styles.children}>
                                {country.cities.map((city, idx) => (
                                  <div 
                                    key={`${city.city}-${idx}`} 
                                    className={`${styles.treeNode} ${styles.level2}`}
                                    onClick={() => {
                                      if (onLocationClick) {
                                        onLocationClick([city]);
                                      }
                                    }}
                                  >
                                    <ChevronIcon className={`${styles.chevron} ${styles.placeholder}`} />
                                    {city.logo ? (
                                      <img src={city.logo} alt="" className={styles.cityLogo} />
                                    ) : (
                                      <PinIcon className={styles.icon} />
                                    )}
                                    <span className={styles.nodeName}>{city.city}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
{/* 
 */}
        </>
      )}
    </div>
  );
}
