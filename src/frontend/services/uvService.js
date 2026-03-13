export async function getCurrentUvByCoords(latitude, longitude) {
  const response = await fetch(
    `/api/uv/current?lat=${latitude}&lng=${longitude}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch UV data')
  }

  return response.json()
}

export async function searchLocation(query) {
  const response = await fetch(
    `/api/location/search?query=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error('Failed to search location')
  }

  return response.json()
}