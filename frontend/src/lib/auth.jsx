// import { createContext, useContext, useState, useEffect } from 'react';

// // Create the AuthContext (used to store user info globally)
// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [accessToken, setAccessToken] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Function to check if user is already logged in (session)
//     const checkAuth = async () => {
//       try {
//         const response = await fetch('/api/auth/me', {
//           credentials: 'include',
//         });
//         if (response.ok) {
//           const data = await response.json();
//           console.log("data in refresh: ", data)
//           setUser(data); // save user in state
//           setAccessToken(data.accessToken);
//         } else {
//           const refreshRes = await fetch("/api/auth/refresh", { credentials: "include" });
//           if (refreshRes.ok) {
//             const data = await refreshRes.json();
//             setAccessToken(data.accessToken);

//             const meRes = await fetch("/api/auth/me", {
//               credentials: "include",
//               headers: { Authorization: `Bearer ${data.accessToken}` }
//             });
//             if (meRes.ok) {
//               const userData = await meRes.json();
//               setUser(userData);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Auth check failed:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // Login function — used after successful login
//   const login = (userData) => {
//     setUser(userData);
//     setAccessToken(userData.accessToken);
//   };

//   // Logout function — removes user session
//   const logout = async () => {
//     try {
//       await fetch('/api/auth/logout', {
//         method: 'POST',
//         credentials: 'include',
//       });
//       setUser(null);
//       setAccessToken(null);
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//     setUser(null);
//   };

//   // Role-based access helpers
//   const isGuest = !user;
//   const isUser = user?.role === 'user';
//   const isOrganizer = user?.role === 'organizer';
//   const isAdmin = user?.role === 'admin';

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         login,
//         logout,
//         isGuest,
//         isUser,
//         isOrganizer,
//         isAdmin,
//         accessToken
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // Custom hook — easy access to AuthContext anywhere in your app
// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
