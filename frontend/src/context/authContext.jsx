import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasCheckedAuth = useRef(false);

  // Refresh token
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing) return null;

    try {
      setIsRefreshing(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refreshtoken`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.log("Refresh token failed - response not ok, status:", res.status);
        return null;
      }

      const data = await res.json();
      if (!data.accessToken) return null; // no token returned
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error("Refresh token failed:", err);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to refresh token
        const token = await refreshAccessToken();

        if (token) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user || data);
            setAccessToken(data.accessToken || token);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false); 
      }
    };

    checkAuth();
  }, []);


 
  const login = useCallback((userData) => {
    if (!userData) return;
    setUser(userData?.user);
    if (userData.accessToken) setAccessToken(userData.accessToken);
  }, []);


  const logout = useCallback(async () => {
    try {
      console.log("Logging out...");
      hasCheckedAuth.current = false;

      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { "Authorization": `Bearer ${accessToken}` }),
        },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      window.location.replace("/");
      
    }
  }, [accessToken]);

  const isGuest = !user;
  const isUser = user?.role === "user";
  const isOrganizer = user?.role === "organizer";
  const isAdmin = user?.role === "admin";

  

  // console.log("Auth State:", { user, accessToken, isLoading, isRefreshing });

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading: isLoading || isRefreshing,
        login,
        logout,
        isGuest,
        isUser,
        isOrganizer,
        isAdmin,
        refreshAccessToken,
        isRefreshing,
      }}
    >
      {!(isLoading || isRefreshing) ? (
        children
      ) : (
        <div className="h-screen flex items-center justify-center">
          Loading...
          
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};






















// import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authState, setAuthState] = useState({
//     user: null,
//     accessToken: null,
//     isLoading: true,
//     isRefreshing: false
//   });
  
//   const hasCheckedAuth = useRef(false);

//   // Refresh token
//   const refreshAccessToken = useCallback(async () => {
//     if (authState.isRefreshing) return null;

//     try {
//       setAuthState(prev => ({ ...prev, isRefreshing: true }));
//       console.log("Attempting to refresh token...");

//       const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refreshtoken`, {
//         method: "GET",
//         credentials: "include",
//       });

//       if (!res.ok) {
//         console.log("Refresh token failed - response not ok, status:", res.status);
//         return null;
//       }

//       const data = await res.json();
      
//       // Update state once with both token and refreshing false
//       setAuthState(prev => ({
//         ...prev,
//         accessToken: data.accessToken,
//         isRefreshing: false
//       }));
      
//       return data.accessToken;
//     } catch (err) {
//       console.error("Refresh token failed:", err);
//       setAuthState(prev => ({ ...prev, isRefreshing: false }));
//       return null;
//     }
//   }, [authState.isRefreshing]);

//   useEffect(() => {
//     if (hasCheckedAuth.current) return;
//     hasCheckedAuth.current = true;

//     const checkAuth = async () => {
//       try {
//         const token = await refreshAccessToken();

//         if (token) {
//           const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//             credentials: "include",
//           });

//           if (res.ok) {
//             const data = await res.json();
//             // Single state update for user and token
//             setAuthState(prev => ({
//               ...prev,
//               user: data.user || data,
//               accessToken: data.accessToken || token,
//               isLoading: false
//             }));
//           } else {
//             setAuthState(prev => ({
//               ...prev,
//               accessToken: null,
//               isLoading: false
//             }));
//           }
//         } else {
//           // No token available
//           setAuthState(prev => ({
//             ...prev,
//             isLoading: false
//           }));
//         }
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         setAuthState({
//           user: null,
//           accessToken: null,
//           isLoading: false,
//           isRefreshing: false
//         });
//       }
//     };

//     checkAuth();
//   }, []);

//   // Login - single state update
//   const login = useCallback((userData) => {
//     if (!userData) return;
//     console.log("Logging in user");
//     setAuthState(prev => ({
//       ...prev,
//       user: userData.user || userData,
//       accessToken: userData.accessToken || prev.accessToken
//     }));
//   }, []);

//   // Logout - single state update
//   const logout = useCallback(async () => {
//     try {
//       console.log("Logging out...");
//       hasCheckedAuth.current = false;

//       await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           ...(authState.accessToken && { "Authorization": `Bearer ${authState.accessToken}` }),
//         },
//       });
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       setAuthState({
//         user: null,
//         accessToken: null,
//         isLoading: false,
//         isRefreshing: false
//       });
//     }
//   }, [authState.accessToken]);

//   const { user, accessToken, isLoading, isRefreshing } = authState;
//   const isGuest = !user;
//   const isUser = user?.role === "user";
//   const isOrganizer = user?.role === "organizer";
//   const isAdmin = user?.role === "admin";

//   console.log("Auth State:", { user, accessToken, isLoading, isRefreshing });

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         accessToken,
//         isLoading: isLoading || isRefreshing,
//         login,
//         logout,
//         isGuest,
//         isUser,
//         isOrganizer,
//         isAdmin,
//         refreshAccessToken,
//         isRefreshing,
//       }}
//     >
//       {!(isLoading || isRefreshing) ? (
//         children
//       ) : (
//         <div className="h-screen flex items-center justify-center">
//           Loading...
//         </div>
//       )}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };
