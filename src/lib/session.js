export function getSession() {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("session");
  return session ? JSON.parse(session) : null;
}

export function clearSession() {
  localStorage.removeItem("session");
}
