export function sanitizeRedirectPath(value?: string | null): string {
  const redirect = value?.trim();
  if (!redirect) return "";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return "";
  return redirect;
}

const PENDING_REDIRECT_KEY = "eventclub:pending-login-redirect";

export function savePendingRedirectPath(value?: string | null) {
  const redirect = sanitizeRedirectPath(value);
  if (!redirect) return;
  try {
    sessionStorage.setItem(PENDING_REDIRECT_KEY, redirect);
  } catch {
    // sessionStorage may be unavailable in restricted embedded browsers.
  }
}

export function consumePendingRedirectPath(): string {
  try {
    const redirect = sanitizeRedirectPath(
      sessionStorage.getItem(PENDING_REDIRECT_KEY),
    );
    sessionStorage.removeItem(PENDING_REDIRECT_KEY);
    return redirect;
  } catch {
    return "";
  }
}

export function getCurrentRedirectPath(location: Location = window.location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function buildLoginPathWithRedirect(redirect?: string | null) {
  const safeRedirect = sanitizeRedirectPath(redirect);
  if (!safeRedirect) return "/login";
  return `/login?redirect=${encodeURIComponent(safeRedirect)}`;
}
