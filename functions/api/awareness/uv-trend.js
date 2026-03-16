const JSON_HEADERS = {
  "Content-Type": "application/json"
};

const TREND_WINDOW_DAYS = 365;
const DEFAULT_DATA_LAG_DAYS = 28;
const RETRY_STEP_DAYS = 7;
const MAX_ATTEMPTS = 6;

const CITY_COORDINATES = {
  melbourne: {
    latitude: -37.8136,
    longitude: 144.9631
  },
  sydney: {
    latitude: -33.8688,
    longitude: 151.2093
  },
  brisbane: {
    latitude: -27.4698,
    longitude: 153.0251
  }
};

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildDateRange(endDate) {
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (TREND_WINDOW_DAYS - 1));

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

function buildUrl(startDate, endDate) {
  const latitudes = Object.values(CITY_COORDINATES)
    .map((city) => city.latitude)
    .join(",");
  const longitudes = Object.values(CITY_COORDINATES)
    .map((city) => city.longitude)
    .join(",");

  return (
    `https://historical-forecast-api.open-meteo.com/v1/forecast` +
    `?latitude=${latitudes}` +
    `&longitude=${longitudes}` +
    `&daily=uv_index_max` +
    `&start_date=${startDate}` +
    `&end_date=${endDate}` +
    `&timezone=auto`
  );
}

async function fetchUvTrendRange(startDate, endDate) {
  const response = await fetch(buildUrl(startDate, endDate));

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Open-Meteo request failed with status ${response.status}: ${details.slice(0, 200)}`
    );
  }

  const data = await response.json();
  const locations = Array.isArray(data) ? data : [data];

  if (locations.length < 3) {
    throw new Error("Open-Meteo did not return all requested locations");
  }

  const [melbourne, sydney, brisbane] = locations;
  const allLocations = [melbourne, sydney, brisbane];
  const hasDailySeries = allLocations.every(
    (location) =>
      Array.isArray(location?.daily?.time) && Array.isArray(location?.daily?.uv_index_max)
  );

  if (!hasDailySeries) {
    throw new Error("Open-Meteo response is missing UV trend series data");
  }

  const dates = melbourne.daily.time;
  const hasAlignedSeries = allLocations.every(
    (location) =>
      location.daily.time.length === dates.length &&
      location.daily.uv_index_max.length === dates.length
  );

  if (!hasAlignedSeries) {
    throw new Error("Open-Meteo returned misaligned UV trend series");
  }

  return {
    dates,
    melbourne: melbourne.daily.uv_index_max,
    sydney: sydney.daily.uv_index_max,
    brisbane: brisbane.daily.uv_index_max,
    rangeStart: startDate,
    rangeEnd: endDate
  };
}

export async function onRequestGet() {
  try {
    const baseEndDate = getUtcDayStart();
    baseEndDate.setUTCDate(baseEndDate.getUTCDate() - DEFAULT_DATA_LAG_DAYS);

    let lastError = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const endDate = new Date(baseEndDate);
      endDate.setUTCDate(endDate.getUTCDate() - attempt * RETRY_STEP_DAYS);

      const { startDate, endDate: endDateString } = buildDateRange(endDate);

      try {
        const result = await fetchUvTrendRange(startDate, endDateString);

        return new Response(JSON.stringify(result), {
          headers: JSON_HEADERS,
          status: 200
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("No supported UV trend date range is currently available");
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch UV trend data",
        details: e.message
      }),
      {
        headers: JSON_HEADERS,
        status: 500
      }
    );
  }
}
