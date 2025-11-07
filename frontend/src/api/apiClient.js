import { queryClient } from "./queryClient";

let refreshingPromise = null;

async function parseError(res) {
  let message = res.statusText || "Request failed";
  try {
    const data = await res.json();
    message = data?.error || data?.message || JSON.stringify(data);
  } catch {
    // fallback to default
  }
  return message;
}



export async function apiFetch(url, options = {}, accessToken, refreshFn) {
  const base = import.meta.env.VITE_API_URL || "";
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;

  // helper function to make the request

  const makeRequest = async (token) => {
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    };

    return fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  // first attempt
  let res = await makeRequest(accessToken);

  // if successful, return directly
  if (res.status !== 401) {
    if (!res.ok) throw new Error(await parseError(res));
    return res;
  }

  // handle 401 Unauthorized -> try to refresh the token
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      try {
        const newToken = await refreshFn();
        return newToken;
      } catch (err) {
        console.error("Token refresh failed:", err);
        return null;
      } finally {
        refreshingPromise = null;
      }
    })();
  }

  const newToken = await refreshingPromise;

  // if no new token, clear cache and reject
  if (!newToken) {
    try {
      await queryClient.clear();
    } catch (err) {
      console.warn("Failed to clear query cache:", err);
    }
    throw new Error("Unauthorized — session expired. Please log in again.");
  }

  // retry with new token
  res = await makeRequest(newToken);

  if (!res.ok) throw new Error(await parseError(res));
  return res;
}
 