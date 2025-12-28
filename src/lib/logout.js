import { clearSession } from "./session";

export function logout(router) {
  clearSession();
  document.cookie = "session=; path=/; max-age=0";
  router.push("/");
}
