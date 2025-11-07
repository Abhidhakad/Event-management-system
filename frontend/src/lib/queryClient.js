// import { QueryClient } from "@tanstack/react-query";

// async function throwIfResNotOk(res) {
//   if (!res.ok) {
//     let errorMessage = res.statusText;

//     try {
//       const data = await res.json();
//       // try common keys
//       errorMessage = data.error || data.message || JSON.stringify(data);
//     } catch {
//       // fallback to statusText
//     }

//     // Optional: handle 401 differently
//     if (res.status === 401) {
//       // e.g., trigger refresh token logic
//     }

//     throw new Error(errorMessage);
//   }
// }


// export async function apiRequest(method, url, data) {
//   const res = await fetch(url, {
//     method,
//     headers: data ? { "Content-Type": "application/json" } : {},
//     body: data ? JSON.stringify(data) : undefined,
//     credentials: "include",
//   });

//   console.log("res: ",res);
//   await throwIfResNotOk(res);
//   return res;
// }



// /**
//  * Factory to generate a query function for React Query.
//  * Handles 401 cases gracefully (either throw or return null).
//  *
//  * @param {"throw"|"returnNull"} on401 - Unauthorized handling behavior
//  * @returns {Function} Query function for React Query
//  */

// export function getQueryFn({ on401 }) {
//   return async ({ queryKey }) => {
//     const res = await fetch(queryKey.join("/"), {
//       credentials: "include",
//     });

//     if (on401 === "returnNull" && res.status === 401) {
//       return null;
//     }

//     await throwIfResNotOk(res);
//     return res.json();
//   };
// }

// /**
//  * Global QueryClient for the entire app.
//  * Centralizes React Query configuration.
//  */
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       queryFn: getQueryFn({ on401: "throw" }),
//       refetchInterval: false,
//       refetchOnWindowFocus: false,
//       staleTime: Infinity,
//       retry: false,
//     },
//     mutations: {
//       retry: false,
//     },
//   },
// });
