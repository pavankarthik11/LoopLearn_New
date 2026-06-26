import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUsers } from "../assets/assets";

export const AppContext = createContext();

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Default timeout for all API calls (15 seconds)
const API_TIMEOUT = 15000;

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [user, setUser] = useState(null);
  // Initialize isSignedIn from localStorage so user doesn't flash to logged-out state
  const [isSignedIn, setIsSignedIn] = useState(!!localStorage.getItem("token"));
  const [authLoading, setAuthLoading] = useState(!!localStorage.getItem("token")); // loading state for initial auth check
  const [loading, setLoading] = useState(false); // loading state for user-initiated actions (login/register)
  const [error, setError] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState('unknown'); // 'unknown' | 'online' | 'offline' | 'waking'

  // Helper to get token
  const getToken = () => localStorage.getItem("token");

  // Helper: create an AbortController with a timeout
  const createTimeoutController = (timeoutMs = API_TIMEOUT, existingSignal = null) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    // If an existing signal is provided, abort when it aborts too
    if (existingSignal) {
      existingSignal.addEventListener('abort', () => controller.abort());
    }
    return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
  };

  // Helper: fetch with retry for Render cold starts (up to 2 retries)
  // Every fetch has a built-in timeout so it NEVER hangs
  const fetchWithRetry = async (url, options = {}, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        // Add timeout if no signal provided
        let fetchOptions = { ...options };
        let clearFn = null;
        if (!fetchOptions.signal) {
          const { signal, clear } = createTimeoutController();
          fetchOptions.signal = signal;
          clearFn = clear;
        }
        const res = await fetch(url, fetchOptions);
        if (clearFn) clearFn();
        setBackendStatus('online');
        return res;
      } catch (err) {
        // Don't retry on intentional abort (timeout)
        if (err.name === 'AbortError') throw err;
        if (i === retries) {
          setBackendStatus('offline');
          throw err;
        }
        // Wait before retrying (Render cold start can take 30s+)
        setBackendStatus('waking');
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  };

  // Fetch all users from backend
  const fetchAllUsers = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetchWithRetry(`${BACKEND_URL}/api/users`, { headers });
      const data = await res.json();
      setAllUsers((data.data && data.data.length > 0) ? data.data : dummyUsers);
    } catch (err) {
      console.warn("Failed to fetch users, using fallback data");
      setAllUsers(dummyUsers);
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetchWithRetry(`${BACKEND_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
        setUser(data.data.user);
        setIsSignedIn(true);
        return true;
      } else {
        const errorMsg = data.message || "Login failed";
        setError(errorMsg);
        setIsSignedIn(false);
        return errorMsg; // Return the error message so Login.jsx can use it directly
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        const errorMsg = "Login is taking too long. The server may be starting up — please try again in a moment.";
        setError(errorMsg);
        return errorMsg;
      }
      const errorMsg = "Login failed. Please check your connection and try again.";
      setError(errorMsg);
      setIsSignedIn(false);
      return errorMsg;
    } finally {
      setLoading(false);
    }
  };

  // Register — sends JSON with pre-uploaded avatar URL (no file upload to backend)
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (res.ok) {
        return true;
      } else {
        setError(data.message || "Registration failed");
        return false;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Registration is taking too long. The server may be starting up — please try again in a moment.");
      } else {
        setError("Registration failed. Please check your connection and try again.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    console.log("Logout function started");
    try {
      await fetch(`${BACKEND_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        credentials: "include",
      });
      console.log("Backend logout called");
    } catch (err) {
      console.warn("Logout request failed", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsSignedIn(false);
    console.log("Frontend logout done");
    navigate('/'); // Redirect to landing page
  };

  // Try to refresh the access token using the refresh token
  const tryRefreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        localStorage.setItem("token", data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
        return true;
      }
    } catch (err) {
      console.warn("Token refresh failed", err);
    }
    return false;
  };

  // Fetch current user — only log out on explicit auth failure (401), NOT on network errors
  const fetchCurrentUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsSignedIn(false);
      setAuthLoading(false);
      return;
    }
    setAuthLoading(true);
    try {
      const { signal, clear } = createTimeoutController(20000); // 20s for initial auth
      const res = await fetchWithRetry(`${BACKEND_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      clear();
      const data = await res.json();
      if (res.ok) {
        setUser(data.data);
        setIsSignedIn(true);
      } else if (res.status === 401) {
        // Token expired — try refreshing
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // Retry with new token
          const { signal: retrySignal, clear: retryClear } = createTimeoutController();
          const retryRes = await fetch(`${BACKEND_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
            signal: retrySignal,
          });
          retryClear();
          const retryData = await retryRes.json();
          if (retryRes.ok) {
            setUser(retryData.data);
            setIsSignedIn(true);
          } else {
            // Refresh didn't help — actually log out
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            setUser(null);
            setIsSignedIn(false);
          }
        } else {
          // No refresh token or refresh failed — log out
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setUser(null);
          setIsSignedIn(false);
        }
      } else {
        // Other server error (500, 503 etc.) — don't log out, keep current state
        console.warn("Server error fetching user, keeping session:", res.status);
      }
    } catch (err) {
      // Network error or timeout — DON'T log the user out
      // The user's token is still valid, the server is just unreachable
      console.warn("Network error fetching user, keeping session:", err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch pending requests count
  const fetchPendingRequestsCount = async () => {
    if (!localStorage.getItem('token')) return setPendingRequestsCount(0);
    try {
      const res = await fetchWithRetry(`${BACKEND_URL}/api/match-requests/received`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        const pending = data.data.filter(r => r.status === 'Pending');
        setPendingRequestsCount(pending.length);
      } else {
        setPendingRequestsCount(0);
      }
    } catch {
      setPendingRequestsCount(0);
    }
  };

  // Only fetch pending requests when user is actually logged in
  useEffect(() => {
    if (user) {
      fetchPendingRequestsCount();
    } else {
      setPendingRequestsCount(0);
    }
  }, [user]);

  // Calculate rating (unchanged)
  const calculateRating = (course) => {
    if (!course || !course.courseRatings || course.courseRatings.length === 0) {
            return 0;
        }
        let totalRatings = 0;
    course.courseRatings.forEach((rating) => {
      totalRatings += rating.rating;
    });
    return totalRatings / course.courseRatings.length;
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAllUsers();
  }, []);

    const value = {
    currency,
    navigate,
    calculateRating,
    allUsers,
    user,
    isSignedIn,
    loading,
    authLoading,
    error,
    backendStatus,
    login,
    logout,
    register,
    fetchAllUsers,
    fetchCurrentUser,
    pendingRequestsCount,
    setPendingRequestsCount,
    fetchPendingRequestsCount,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};