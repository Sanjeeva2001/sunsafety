export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)

  const lat = url.searchParams.get('lat')
  const lng = url.searchParams.get('lng')

  if (!lat || !lng) {
    return Response.json(
      { message: 'Latitude and longitude are required.' },
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
    const oneCallUrl =
      `https://api.openweathermap.org/data/3.0/onecall` +
      `?lat=${lat}` +
      `&lon=${lng}` +
      `&exclude=minutely,hourly,daily,alerts` +
      `&appid=${apiKey}`

    const reverseGeoUrl =
      `https://api.openweathermap.org/geo/1.0/reverse` +
      `?lat=${lat}` +
      `&lon=${lng}` +
      `&limit=1` +
      `&appid=${apiKey}`

    const [weatherResponse, reverseGeoResponse] = await Promise.all([
      fetch(oneCallUrl),
      fetch(reverseGeoUrl),
    ])

    if (!weatherResponse.ok) {
      const details = await weatherResponse.text()
      return Response.json(
        { message: 'OpenWeather One Call request failed.', details },
        { status: weatherResponse.status }
      )
    }

    if (!reverseGeoResponse.ok) {
      const details = await reverseGeoResponse.text()
      return Response.json(
        { message: 'OpenWeather reverse geocoding failed.', details },
        { status: reverseGeoResponse.status }
      )
    }

    const weatherData = await weatherResponse.json()
    const reverseGeoData = await reverseGeoResponse.json()

    const firstLocation = reverseGeoData?.[0] || {}

    return Response.json({
      uvIndex: weatherData?.current?.uvi ?? 0,
      locationName: firstLocation.name || 'Current location',
      latitude: Number(lat),
      longitude: Number(lng),
      timezone: weatherData?.timezone ?? null,
      sunrise: weatherData?.current?.sunrise ?? null,
      sunset: weatherData?.current?.sunset ?? null,
      time: weatherData?.current?.dt ?? null,
    })
  } catch (error) {
    return Response.json(
      { message: 'Failed to fetch live UV data from OpenWeather.' },
      { status: 500 }
    )
  }
}