function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

const machineIp = 'localhost'

export function resolveServiceBaseUrl(envUrl: string | undefined, defaultPort: number) {
  if (envUrl && envUrl.trim()) {
    return trimTrailingSlash(envUrl.trim())
  }

  return `http://${machineIp}:${defaultPort}`
}
