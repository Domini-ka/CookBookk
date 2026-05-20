const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function authFetch(path, options = {}) {
  const token = localStorage.getItem("cookbook_token");
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers, credentials: "include" });
  const data = await res.json();

  if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login" && path !== "/auth/register") {
    // try to refresh
    const refreshRes = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
    const refreshData = await refreshRes.json();
    if (!refreshData.ok) throw new Error(refreshData.error || "Brak autoryzacji");
    localStorage.setItem("cookbook_token", refreshData.data.token);
    localStorage.setItem("cookbook_user", JSON.stringify(refreshData.data.user));

    // retry original request with new token
    headers["Authorization"] = `Bearer ${refreshData.data.token}`;
    const retry = await fetch(`${API}${path}`, { ...options, headers, credentials: "include" });
    const retryData = await retry.json();
    if (!retryData.ok) throw new Error(retryData.error || "Błąd serwera");
    return retryData.data;
  }

  if (!data.ok) throw new Error(data.error || "Błąd serwera");
  return data.data;
}

export default authFetch;
