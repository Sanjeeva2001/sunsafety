export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)

  const query = url.searchParams.get('query')

  if (!query) {
    return Response.json(
      { message: 'Location query is required.' },
      { status: 400 }
    )
  }

  const apiKey = env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return Response.json(
      { message: 'Missing OpenWeather API key.' },
      { status: 500 }
    )
  }

  try {
    const trimmedQuery = query.trim()
    const isPostcode = /^\d{4}$/.test(trimmedQuery)

    const geocodeUrl = isPostcode
      ? `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(trimmedQuery)},AU&appid=${apiKey}`
      : `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(trimmedQuery)},AU&limit=1&appid=${apiKey}`

    const response = await fetch(geocodeUrl)

    if (!response.ok) {
      const details = await response.text()
      return Response.json(
        { message: 'OpenWeather geocoding request failed.', details },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (isPostcode) {
      return Response.json({
        name: data?.name || trimmedQuery,
        latitude: data?.lat,
        longitude: data?.lon,
        country: data?.country || 'AU',
      })
    }

    const firstResult = data?.[0]

    if (!firstResult) {
      return Response.json(
        { message: 'No matching location found.' },
        { status: 404 }
      )
    }

    return Response.json({
      name: firstResult.name,
      latitude: firstResult.lat,
      longitude: firstResult.lon,
      country: firstResult.country,
      state: firstResult.state || null,
    })
  } catch (error) {
    return Response.json(
      { message: 'Failed to search location.' },
      { status: 500 }
    )
  }
}