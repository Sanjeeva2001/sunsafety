const unknownDisplay = {
  level: 'Unknown',
  color: '#6B7280',
  textColor: '#FFFFFF',
  message: 'UV data is currently unavailable.',
}

export function getUvDisplayInfo(uvIndex) {
  if (uvIndex === '' || uvIndex === null || uvIndex === undefined) {
    return unknownDisplay
  }

  const value = Number(uvIndex)

  if (!Number.isFinite(value) || value < 0) {
    return unknownDisplay
  }

  if (value <= 2) {
    return {
      level: 'Low',
      color: '#2E7D32',
      textColor: '#FFFFFF',
      message: 'Sun protection is usually not required unless near reflective surfaces.',
    }
  }

  if (value <= 5) {
    return {
      level: 'Moderate',
      color: '#F9A825',
      textColor: '#111827',
      message: 'Sun protection recommended.',
    }
  }

  if (value <= 7) {
    return {
      level: 'High',
      color: '#EF6C00',
      textColor: '#FFFFFF',
      message: 'Sun protection recommended.',
    }
  }

  if (value <= 10) {
    return {
      level: 'Very High',
      color: '#C62828',
      textColor: '#FFFFFF',
      message: 'Sun protection recommended.',
    }
  }

  return {
    level: 'Extreme',
    color: '#6A1B9A',
    textColor: '#FFFFFF',
    message: 'Sun protection recommended.',
  }
}
