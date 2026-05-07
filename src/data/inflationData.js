const STATIC_DATA_PATHS = {
  ito: '/data/ito_simple_inflation.json',
  tuik: '/data/tuik_inflation.json',
  enag: '/data/enag_inflation.json'
};

const MONTHS = [
  { short: 'Oca', full: 'Ocak', aliases: ['oca', 'ocak', 'jan', 'january', '01', '1'] },
  { short: 'Şub', full: 'Şubat', aliases: ['şub', 'sub', 'şubat', 'subat', 'feb', 'february', '02', '2'] },
  { short: 'Mar', full: 'Mart', aliases: ['mar', 'mart', 'march', '03', '3'] },
  { short: 'Nis', full: 'Nisan', aliases: ['nis', 'nisan', 'apr', 'april', '04', '4'] },
  { short: 'May', full: 'Mayıs', aliases: ['may', 'mayıs', 'mayis', '05', '5'] },
  { short: 'Haz', full: 'Haziran', aliases: ['haz', 'haziran', 'jun', 'june', '06', '6'] },
  { short: 'Tem', full: 'Temmuz', aliases: ['tem', 'temmuz', 'jul', 'july', '07', '7'] },
  { short: 'Ağu', full: 'Ağustos', aliases: ['ağu', 'agu', 'ağustos', 'agustos', 'aug', 'august', '08', '8'] },
  { short: 'Eyl', full: 'Eylül', aliases: ['eyl', 'eylül', 'eylul', 'sep', 'september', '09', '9'] },
  { short: 'Eki', full: 'Ekim', aliases: ['eki', 'ekim', 'oct', 'october', '10'] },
  { short: 'Kas', full: 'Kasım', aliases: ['kas', 'kasım', 'kasim', 'nov', 'november', '11'] },
  { short: 'Ara', full: 'Aralık', aliases: ['ara', 'aralık', 'aralik', 'dec', 'december', '12'] }
];

const HEADER_ALIASES = {
  date: ['date', 'tarih', 'ay yıl', 'ay-yıl', 'month year', 'period'],
  year: ['year', 'yıl', 'yil'],
  month: ['month', 'ay'],
  tuikMonthly: ['tuik monthly', 'tüik monthly', 'tuik aylık', 'tüik aylık (%)', 'tuik_monthly', 'tuikmonthly', 'tüik monthly (%)', 'tüik aylik'],
  tuikAnnual: ['tuik annual', 'tüik annual', 'tuik yıllık', 'tüik yıllık (%)', 'tuik_annual', 'tuikannual', 'tüik annualized (%)', 'tüik annualized', 'tüik yillik'],
  enagMonthly: ['enag monthly', 'enag aylık', 'enag aylık (%)', 'enag_monthly', 'enagmonthly', 'enag monthly (%)', 'enag aylik'],
  enagAnnual: ['enag annual', 'enag yıllık', 'enag yıllık (%)', 'enag_annual', 'enagannual', 'enag annualized (%)', 'enag annualized', 'enag yillik'],
  itoMonthly: ['ito monthly', 'ito aylık', 'ito aylık (%)', 'ito_monthly', 'itomonthly', 'ito monthly (%)', 'İTO monthly (%)', 'ito aylik'],
  itoAnnual: ['ito annual', 'ito yıllık', 'ito yıllık (%)', 'ito_annual', 'itoannual', 'ito annualized (%)', 'ito annualized', 'İTO annualized (%)', 'ito yillik']
};

export async function fetchInflationData() {
  const googleSheetsCsvUrl = import.meta.env.VITE_GOOGLE_SHEETS_CSV_URL?.trim();

  if (googleSheetsCsvUrl) {
    try {
      return {
        ...(await fetchGoogleSheetsInflationData(googleSheetsCsvUrl)),
        source: 'google-sheets'
      };
    } catch (error) {
      console.warn('Google Sheets data could not be loaded. Falling back to bundled JSON.', error);
    }
  }

  return {
    ...(await fetchStaticInflationData()),
    source: 'static-json'
  };
}

async function fetchStaticInflationData() {
  const [itoResponse, tuikResponse, enagResponse] = await Promise.all([
    fetch(STATIC_DATA_PATHS.ito),
    fetch(STATIC_DATA_PATHS.tuik),
    fetch(STATIC_DATA_PATHS.enag)
  ]);

  if (!itoResponse.ok || !tuikResponse.ok || !enagResponse.ok) {
    throw new Error('Failed to fetch data files');
  }

  const [itoData, tuikData, enagData] = await Promise.all([
    itoResponse.json(),
    tuikResponse.json(),
    enagResponse.json()
  ]);

  return { itoData, tuikData, enagData };
}

async function fetchGoogleSheetsInflationData(rawUrl) {
  const response = await fetch(toCsvUrl(rawUrl), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheets data: ${response.status}`);
  }

  const csv = await response.text();
  return rowsToInflationData(parseCsv(csv));
}

function toCsvUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const spreadsheetMatch = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);

    if (!spreadsheetMatch) return rawUrl;
    if (url.pathname.includes('/export') || url.pathname.includes('/gviz/') || url.searchParams.get('output') === 'csv') return rawUrl;

    const gid = url.searchParams.get('gid') || url.hash.match(/gid=([^&]+)/)?.[1];
    const exportUrl = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetMatch[1]}/gviz/tq`);
    exportUrl.searchParams.set('tqx', 'out:csv');
    if (gid) exportUrl.searchParams.set('gid', gid);
    return exportUrl.toString();
  } catch {
    return rawUrl;
  }
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && nextChar === '"' && inQuotes) {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);

  if (rows.length < 2) {
    throw new Error('Google Sheets CSV must include a header row and at least one data row');
  }

  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((cells) => {
    return headers.reduce((record, header, index) => {
      if (header) record[header] = cells[index] ?? '';
      return record;
    }, {});
  });
}

function normalizeHeader(header) {
  const normalized = normalizeText(header);
  return Object.entries(HEADER_ALIASES).find(([, aliases]) => aliases.some((alias) => normalizeText(alias) === normalized))?.[0];
}

function rowsToInflationData(rows) {
  const normalizedRows = rows
    .map(normalizeSheetRow)
    .filter(Boolean)
    .sort((left, right) => left.timestamp - right.timestamp);

  if (!normalizedRows.length) {
    throw new Error('Google Sheets CSV did not contain any usable inflation rows');
  }

  return {
    tuikData: {
      description: 'TÜİK Inflation Data loaded from Google Sheets',
      data: normalizedRows.map((row) => ({
        Date: row.date,
        'TÜİK Monthly (%)': row.tuikMonthly,
        'TÜİK Annualized (%)': row.tuikAnnual
      }))
    },
    enagData: {
      description: 'ENAG Inflation Data loaded from Google Sheets',
      data: normalizedRows.map((row) => ({
        Date: row.date,
        'ENAG Monthly (%)': row.enagMonthly,
        'ENAG Annualized (%)': row.enagAnnual
      }))
    },
    itoData: normalizedRows.map((row) => ({
      year: row.year,
      month: row.monthFull,
      release_date: null,
      cpi_wage_earners: {
        mom_change_pct: row.itoMonthly,
        ytd_change_pct: null,
        yoy_change_pct: row.itoAnnual
      }
    }))
  };
}

function normalizeSheetRow(row) {
  const period = parsePeriod(row);
  if (!period) return null;

  return {
    ...period,
    date: `${period.monthShort} ${period.year}`,
    tuikMonthly: parseNumber(row.tuikMonthly),
    tuikAnnual: parseNumber(row.tuikAnnual),
    enagMonthly: parseNumber(row.enagMonthly),
    enagAnnual: parseNumber(row.enagAnnual),
    itoMonthly: parseNumber(row.itoMonthly),
    itoAnnual: parseNumber(row.itoAnnual)
  };
}

function parsePeriod(row) {
  const dateValue = row.date?.trim();
  const yearValue = row.year?.trim();
  const monthValue = row.month?.trim();

  if (yearValue && monthValue) {
    const monthIndex = monthIndexFromValue(monthValue);
    const year = parseInt(yearValue, 10);
    if (!Number.isNaN(year) && monthIndex !== -1) return periodParts(year, monthIndex);
  }

  if (!dateValue) return null;

  const parsedDate = new Date(dateValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return periodParts(parsedDate.getFullYear(), parsedDate.getMonth());
  }

  const [monthPart, yearPart] = dateValue.split(/\s+|-|\//).filter(Boolean);
  const monthIndex = monthIndexFromValue(monthPart);
  const year = parseInt(yearPart, 10);

  if (Number.isNaN(year) || monthIndex === -1) return null;
  return periodParts(year, monthIndex);
}

function periodParts(year, monthIndex) {
  return {
    year,
    monthIndex,
    monthShort: MONTHS[monthIndex].short,
    monthFull: MONTHS[monthIndex].full,
    timestamp: new Date(year, monthIndex, 1).getTime()
  };
}

function monthIndexFromValue(value) {
  const normalized = normalizeText(value);
  return MONTHS.findIndex((month) => month.aliases.some((alias) => normalizeText(alias) === normalized));
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;

  const normalized = String(value)
    .replace('%', '')
    .replace(/\s/g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeText(value) {
  return String(value)
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*\(%\)\s*/g, '')
    .replace(/[^a-z0-9ığüşöçİĞÜŞÖÇ]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
