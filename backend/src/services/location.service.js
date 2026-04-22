const { env } = require('../config/env');
const locationModel = require('../models/location.model');

const defaultLogo = '/locations/new-york.svg';
const sightAnalysisPrompt = [
  'You are a geolocation expert. Look at this image and identify the most likely real-world location.',
  'If you recognize a landmark, city, or region, return its GPS coordinates.',
  'Respond with ONLY a raw JSON object — no markdown, no code blocks, no explanation:',
  '{"latitude":number,"longitude":number,"confidence":number}',
  'Use null for latitude and longitude only if you truly cannot determine the location.',
  'confidence should be between 0 and 1.',
].join(' ');
const continentByCountryCode = {
  AD: 'Europe',
  AE: 'Asia',
  AF: 'Asia',
  AG: 'North America',
  AI: 'North America',
  AL: 'Europe',
  AM: 'Asia',
  AO: 'Africa',
  AQ: 'Antarctica',
  AR: 'South America',
  AS: 'Oceania',
  AT: 'Europe',
  AU: 'Oceania',
  AW: 'North America',
  AX: 'Europe',
  AZ: 'Asia',
  BA: 'Europe',
  BB: 'North America',
  BD: 'Asia',
  BE: 'Europe',
  BF: 'Africa',
  BG: 'Europe',
  BH: 'Asia',
  BI: 'Africa',
  BJ: 'Africa',
  BL: 'North America',
  BM: 'North America',
  BN: 'Asia',
  BO: 'South America',
  BQ: 'North America',
  BR: 'South America',
  BS: 'North America',
  BT: 'Asia',
  BV: 'Antarctica',
  BW: 'Africa',
  BY: 'Europe',
  BZ: 'North America',
  CA: 'North America',
  CC: 'Asia',
  CD: 'Africa',
  CF: 'Africa',
  CG: 'Africa',
  CH: 'Europe',
  CI: 'Africa',
  CK: 'Oceania',
  CL: 'South America',
  CM: 'Africa',
  CN: 'Asia',
  CO: 'South America',
  CR: 'North America',
  CU: 'North America',
  CV: 'Africa',
  CW: 'North America',
  CX: 'Asia',
  CY: 'Asia',
  CZ: 'Europe',
  DE: 'Europe',
  DJ: 'Africa',
  DK: 'Europe',
  DM: 'North America',
  DO: 'North America',
  DZ: 'Africa',
  EC: 'South America',
  EE: 'Europe',
  EG: 'Africa',
  EH: 'Africa',
  ER: 'Africa',
  ES: 'Europe',
  ET: 'Africa',
  EU: 'Europe',
  FI: 'Europe',
  FJ: 'Oceania',
  FK: 'South America',
  FM: 'Oceania',
  FO: 'Europe',
  FR: 'Europe',
  GA: 'Africa',
  GB: 'Europe',
  GD: 'North America',
  GE: 'Asia',
  GF: 'South America',
  GG: 'Europe',
  GH: 'Africa',
  GI: 'Europe',
  GL: 'North America',
  GM: 'Africa',
  GN: 'Africa',
  GP: 'North America',
  GQ: 'Africa',
  GR: 'Europe',
  GS: 'Antarctica',
  GT: 'North America',
  GU: 'Oceania',
  GW: 'Africa',
  GY: 'South America',
  HK: 'Asia',
  HM: 'Antarctica',
  HN: 'North America',
  HR: 'Europe',
  HT: 'North America',
  HU: 'Europe',
  ID: 'Asia',
  IE: 'Europe',
  IL: 'Asia',
  IM: 'Europe',
  IN: 'Asia',
  IO: 'Asia',
  IQ: 'Asia',
  IR: 'Asia',
  IS: 'Europe',
  IT: 'Europe',
  JE: 'Europe',
  JM: 'North America',
  JO: 'Asia',
  JP: 'Asia',
  KE: 'Africa',
  KG: 'Asia',
  KH: 'Asia',
  KI: 'Oceania',
  KM: 'Africa',
  KN: 'North America',
  KP: 'Asia',
  KR: 'Asia',
  KW: 'Asia',
  KY: 'North America',
  KZ: 'Asia',
  LA: 'Asia',
  LB: 'Asia',
  LC: 'North America',
  LI: 'Europe',
  LK: 'Asia',
  LR: 'Africa',
  LS: 'Africa',
  LT: 'Europe',
  LU: 'Europe',
  LV: 'Europe',
  LY: 'Africa',
  MA: 'Africa',
  MC: 'Europe',
  MD: 'Europe',
  ME: 'Europe',
  MF: 'North America',
  MG: 'Africa',
  MH: 'Oceania',
  MK: 'Europe',
  ML: 'Africa',
  MM: 'Asia',
  MN: 'Asia',
  MO: 'Asia',
  MP: 'Oceania',
  MQ: 'North America',
  MR: 'Africa',
  MS: 'North America',
  MT: 'Europe',
  MU: 'Africa',
  MV: 'Asia',
  MW: 'Africa',
  MX: 'North America',
  MY: 'Asia',
  MZ: 'Africa',
  NA: 'Africa',
  NC: 'Oceania',
  NE: 'Africa',
  NF: 'Oceania',
  NG: 'Africa',
  NI: 'North America',
  NL: 'Europe',
  NO: 'Europe',
  NP: 'Asia',
  NR: 'Oceania',
  NU: 'Oceania',
  NZ: 'Oceania',
  OM: 'Asia',
  PA: 'North America',
  PE: 'South America',
  PF: 'Oceania',
  PG: 'Oceania',
  PH: 'Asia',
  PK: 'Asia',
  PL: 'Europe',
  PM: 'North America',
  PN: 'Oceania',
  PR: 'North America',
  PS: 'Asia',
  PT: 'Europe',
  PW: 'Oceania',
  PY: 'South America',
  QA: 'Asia',
  RE: 'Africa',
  RO: 'Europe',
  RS: 'Europe',
  RU: 'Europe',
  RW: 'Africa',
  SA: 'Asia',
  SB: 'Oceania',
  SC: 'Africa',
  SD: 'Africa',
  SE: 'Europe',
  SH: 'Africa',
  SI: 'Europe',
  SJ: 'Europe',
  SK: 'Europe',
  SL: 'Africa',
  SM: 'Europe',
  SN: 'Africa',
  SO: 'Africa',
  SR: 'South America',
  SS: 'Africa',
  ST: 'Africa',
  SV: 'North America',
  SX: 'North America',
  SY: 'Asia',
  SZ: 'Africa',
  TC: 'North America',
  TD: 'Africa',
  TF: 'Antarctica',
  TG: 'Africa',
  TH: 'Asia',
  TJ: 'Asia',
  TK: 'Oceania',
  TL: 'Asia',
  TM: 'Asia',
  TN: 'Africa',
  TO: 'Oceania',
  TR: 'Asia',
  TT: 'North America',
  TV: 'Oceania',
  TW: 'Asia',
  TZ: 'Africa',
  UA: 'Europe',
  UG: 'Africa',
  UM: 'Oceania',
  US: 'North America',
  UY: 'South America',
  UZ: 'Asia',
  VA: 'Europe',
  VC: 'North America',
  VE: 'South America',
  VG: 'North America',
  VI: 'North America',
  VN: 'Asia',
  VU: 'Oceania',
  WF: 'Oceania',
  WS: 'Oceania',
  XK: 'Europe',
  YE: 'Asia',
  YT: 'Africa',
  ZA: 'Africa',
  ZM: 'Africa',
  ZW: 'Africa',
};

function buildBadRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function resolveContinent(countryCode) {
  return continentByCountryCode[String(countryCode || '').toUpperCase()] || 'Unknown continent';
}

function buildFlagUrl(countryCode) {
  const normalizedCode = String(countryCode || '').trim().toLowerCase();
  if (!normalizedCode) return '';

  return `https://flagcdn.com/${normalizedCode}.svg`;
}

function extractJsonObject(content) {
  if (!content) {
    throw buildBadRequest('Image analysis returned an empty response.');
  }

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const stripped = String(content)
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(stripped);
  } catch (_error) {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) {
      throw buildBadRequest('Image analysis did not return valid JSON.');
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      throw buildBadRequest('Image analysis did not return valid JSON.');
    }
  }
}

function createSafePreview(value, maxLength = 500) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}...`
    : normalized;
}

function logHfDebug(message, details = {}) {
  console.log('[hf-image-analyze]', message, details);
}

async function getLocations() {
  return locationModel.readLocations();
}

async function reverseGeocodeCoordinate(coordinate) {
  if (
    !coordinate ||
    typeof coordinate.lat !== 'number' ||
    typeof coordinate.lng !== 'number'
  ) {
    throw buildBadRequest('A valid coordinate with numeric lat and lng is required.');
  }

  if (!env.mapboxAccessToken) {
    const error = new Error('Missing MAPBOX_ACCESS_TOKEN in environment.');
    error.statusCode = 500;
    throw error;
  }

  const url = new URL('https://api.mapbox.com/search/geocode/v6/reverse');
  url.searchParams.set('longitude', String(coordinate.lng));
  url.searchParams.set('latitude', String(coordinate.lat));
  url.searchParams.set('access_token', env.mapboxAccessToken);
  url.searchParams.set('language', 'en');
  url.searchParams.set('limit', '1');

  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Mapbox reverse geocoding failed with status ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  const [feature] = Array.isArray(data.features) ? data.features : [];
  const context = feature?.properties?.context || {};
  const countryCode = context.country?.country_code || '';
  const city =
    context.place?.name ||
    context.locality?.name ||
    context.neighborhood?.name ||
    feature?.properties?.name ||
    'Unknown location';

  return {
    coordinate,
    city,
    locality: context.locality?.name || city,
    country: context.country?.name || 'Unknown country',
    countryCode,
    flag: buildFlagUrl(countryCode),
    continent: resolveContinent(countryCode),
    continentCode: '',
    principalSubdivision: context.region?.name || '',
    postcode: context.postcode?.name || '',
    plusCode: '',
  };
}

async function analyzeCoordinates(coordinate) {
  return reverseGeocodeCoordinate(coordinate);
}

async function analyzeSightImage(imageDataUrl) {
  const normalizedImageDataUrl = String(imageDataUrl || '').trim();
  if (!normalizedImageDataUrl.startsWith('data:image/')) {
    throw buildBadRequest('A valid image data URL is required.');
  }

  if (!env.hfToken) {
    const error = new Error('Missing HF_TOKEN in environment.');
    error.statusCode = 500;
    throw error;
  }

  logHfDebug('request:start', {
    model: env.hfVisionModel,
    imageBytesApprox: normalizedImageDataUrl.length,
    promptPreview: createSafePreview(sightAnalysisPrompt, 180),
  });

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.hfVisionModel,
      temperature: 0,
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: sightAnalysisPrompt },
            {
              type: 'image_url',
              image_url: {
                url: normalizedImageDataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    logHfDebug('response:error', {
      model: env.hfVisionModel,
      status: response.status,
      statusText: response.statusText,
      bodyPreview: createSafePreview(details),
    });
    const error = new Error(`Hugging Face image analysis failed with status ${response.status}: ${details}`);
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  logHfDebug('response:success', {
    model: env.hfVisionModel,
    status: response.status,
    choiceCount: Array.isArray(data.choices) ? data.choices.length : 0,
    contentPreview: createSafePreview(data.choices?.[0]?.message?.content),
  });
  const content = data.choices?.[0]?.message?.content;
  const parsed = extractJsonObject(content);
  logHfDebug('response:parsed', {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    confidence: parsed.confidence,
  });
  const latitude = parsed.latitude;
  const longitude = parsed.longitude;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    latitude === null ||
    longitude === null
  ) {
    const error = new Error(
      'Could not detect a recognizable location in this image. Try a photo with a visible landmark, street sign, or distinctive scenery.',
    );
    error.statusCode = 422;
    throw error;
  }

  const coordinate = { lat: latitude, lng: longitude };
  return analyzeCoordinates(coordinate);
}

async function createCheckin(analysis) {
  if (
    !analysis ||
    !analysis.coordinate ||
    typeof analysis.coordinate.lat !== 'number' ||
    typeof analysis.coordinate.lng !== 'number'
  ) {
    throw buildBadRequest('A valid analysis payload is required.');
  }

  const current = await locationModel.readLocations();
  const timestamp = new Date().toISOString();
  const newLocation = {
    coordinate: analysis.coordinate,
    logo: analysis.logo || defaultLogo,
    countryCode: analysis.countryCode || '',
    flag: analysis.flag || buildFlagUrl(analysis.countryCode),
    createdAt: timestamp,
    city: analysis.city || 'Unknown location',
    country: analysis.country || 'Unknown country',
    continent: analysis.continent || 'Unknown continent',
  };

  current.lastVisited = timestamp;
  current.locations.push(newLocation);

  await locationModel.writeLocations(current);
  return newLocation;
}

module.exports = {
  getLocations,
  analyzeCoordinates,
  analyzeSightImage,
  createCheckin,
};
