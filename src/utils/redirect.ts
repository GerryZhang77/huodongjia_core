export function sanitizeRedirectPath(value?: string | null): string {
  const redirect = value?.trim();
  if (!redirect) return "";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return "";
  return redirect;
}

export function getCurrentRedirectPath(location: Location = window.location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function buildLoginPathWithRedirect(redirect?: string | null) {
  const safeRedirect = sanitizeRedirectPath(redirect);
  if (!safeRedirect) return "/login";
  return `/login?redirect=${encodeURIComponent(safeRedirect)}`;
}
