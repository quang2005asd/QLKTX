function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

const machineIp = '192.168.24.194'
const renderHostPattern = /\.onrender\.com$/i
const ngrokHostPattern = /ngrok(-free)?\.(app|dev)/i

function isRenderHost() {
  if (typeof window === 'undefined') return false
  return renderHostPattern.test(window.location.hostname)
}

function shouldUseProductionFallback(envUrl: string | undefined) {
  if (!isRenderHost()) return false
  if (!envUrl) return true

  return ngrokHostPattern.test(envUrl) || envUrl.includes('localhost') || envUrl.includes(machineIp)
}

export function resolveServiceBaseUrl(envUrl: string | undefined, defaultPort: number) {
  const localUrl = envUrl?.trim()

  if (localUrl) {
    return trimTrailingSlash(localUrl)
  }

  return `http://${machineIp}:${defaultPort}`
}

export function resolveServiceBaseUrlWithProductionFallback(
  envUrl: string | undefined,
  defaultPort: number,
  productionUrl: string,
) {
  const localUrl = envUrl?.trim()

  if (shouldUseProductionFallback(localUrl)) {
    return trimTrailingSlash(productionUrl)
  }

  return resolveServiceBaseUrl(localUrl, defaultPort)
}
