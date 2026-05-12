export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Auth is now handled by independent username/password + JWT
// Redirect to /login instead of Manus OAuth
export const getLoginUrl = () => "/login";
