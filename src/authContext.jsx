import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function getExpiryFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Refresh access token function (must be outside useEffect)
  const refreshAccessToken = async (refresh_token, userObj) => {
    try {
      const res = await fetch("http://localhost:5000/api/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refresh_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = {
          ...userObj,
          access_token: data.access_token,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  // Set up auto-refresh for access token
  useEffect(() => {
    if (!user || !user.refresh_token) return;
    let timeoutId;
    const scheduleRefresh = () => {
      if (!user.access_token) return;
      const exp = getExpiryFromToken(user.access_token);
      if (!exp) return;
      const now = Date.now();
      // Refresh 1 minute before expiry
      const delay = Math.max(exp - now - 60 * 1000, 5000);
      timeoutId = setTimeout(() => refreshAccessToken(user.refresh_token, user), delay);
    };
    scheduleRefresh();
    return () => clearTimeout(timeoutId);
  }, [user]);

  const login = (loginResponse) => {
    // loginResponse: { access_token, refresh_token, email }
    const userData = {
      email: loginResponse.email,
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      username: loginResponse.username,
    };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
