import { QueryClient } from "@tanstack/react-query";

/**
 * Handle all API errors consistently.
 * Converts non-OK responses into proper Error objects.
 */
async function throwIfResNotOk(res) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const data = await res.json();
      errorMessage = data?.error || data?.message || JSON.stringify(data);
    } catch {
      // ignore parsing error
    }

    if (res.status === 401) {
      console.warn("Received 401 from API");
    }

    throw new Error(errorMessage);
  }
}

/**
 * Generic API Request helper for CRUD operations.
 * Handles base URL, JSON, and credentials automatically.
 */
export async function apiRequest(method, url, data) {
  const base = import.meta.env.VITE_API_URL || "";
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", 
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Default Query Function for React Query.
 * Fetches data and auto-handles 401 responses if configured.
 */
export function getQueryFn({ on401 = "throw" } = {}) {
  return async ({ queryKey }) => {
    const base = import.meta.env.VITE_API_URL || "";
    const fullUrl = queryKey[0].startsWith("http")
      ? queryKey[0]
      : `${base}${queryKey.join("/")}`;

    const res = await fetch(fullUrl, { credentials: "include" });

    if (on401 === "returnNull" && res.status === 401) {
      console.warn("401 - returning null data");
      return null;
    }

    await throwIfResNotOk(res);
    return res.json();
  };
}

/**
 * Global React Query client.
 * Controls caching, retries, and refresh policies.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // cache data for 5 mins
      gcTime: 1000 * 60 * 10, // garbage collect after 10 mins
    },
    mutations: {
      retry: false,
    },
  },
});
