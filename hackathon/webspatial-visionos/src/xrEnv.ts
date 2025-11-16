const XR_ENV_BASE =
  (typeof globalThis !== "undefined" &&
    (globalThis as typeof globalThis & {
      __XR_ENV_BASE__?: string;
    }).__XR_ENV_BASE__) ??
  import.meta.env.BASE_URL ??
  "/";

export function getXRBaseUrl() {
  return XR_ENV_BASE || "/";
}

export function withXRBasePath(path: string) {
  if (!path || path === "/") {
    return getXRBaseUrl();
  }

  const base = getXRBaseUrl();
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}` || normalizedPath;
}

