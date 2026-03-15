export async function onRequestGet() {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 364);

    const formatDate = (date) => date.toISOString().slice(0, 10);

    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // Melbourne, Sydney, Brisbane
    const latitudes = "-37.8136,-33.8688,-27.4698";
    const longitudes = "144.9631,151.2093,153.0251";

    const url =
      `https://historical-forecast-api.open-meteo.com/v1/forecast` +
      `?latitude=${latitudes}` +
      `&longitude=${longitudes}` +
      `&daily=uv_index_max` +
      `&start_date=${startDate}` +
      `&end_date=${endDate}` +
      `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with status ${response.status}`);
    }

    const data = await response.json();

    const locations = Array.isArray(data) ? data : [data];

    if (locations.length < 3) {
      throw new Error("Open-Meteo did not return all requested locations");
    }

    const result = {
      dates: locations[0].daily.time,
      melbourne: locations[0].daily.uv_index_max,
      sydney: locations[1].daily.uv_index_max,
      brisbane: locations[2].daily.uv_index_max
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch UV trend data",
        details: e.message
      }),
      {
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
}