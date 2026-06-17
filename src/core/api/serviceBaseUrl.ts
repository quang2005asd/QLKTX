function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

const machineIp = '192.168.24.194'

function isLocalRuntimeHost() {
  if (typeof window === 'undefined') return true

  const { hostname } = window.location
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === machineIp ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  )
}

export function resolveServiceBaseUrl(
  envUrl: string | undefined,
  defaultPort: number,
  publicEnvUrl?: string | undefined,
) {
  const localUrl = envUrl?.trim()
  const publicUrl = publicEnvUrl?.trim()

  if (isLocalRuntimeHost() && localUrl) {
    return trimTrailingSlash(localUrl)
  }

  if (publicUrl) {
    return trimTrailingSlash(publicUrl)
  }

  if (localUrl) {
    return trimTrailingSlash(localUrl)
  }

  return `http://${machineIp}:${defaultPort}`
}
