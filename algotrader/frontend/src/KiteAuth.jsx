import React, { useEffect, useState } from "react";
import Alert from '@mui/material/Alert';
import { getApiUrl, REDIRECT_URL } from './config/api';

// const KITE_API_KEY = "j1z0yebn5wxfo74p"; //Akshay
const KITE_API_KEY = "fjv1pqiea13qoapa"; //Nita

function KiteAuth() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch(getApiUrl("api/users"))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      })
      .catch(() => setUsers([]));
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [showSelectUserAlert, setShowSelectUserAlert] = useState(false);

  // Step 1: If request_token is present in URL, exchange it for access_token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken = urlParams.get("request_token");

    if (requestToken) {
      setLoading(true);
      fetch("/api/generate_token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_token: requestToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            setAccessToken(data.access_token);
            // Optionally store user info in localStorage/session
            localStorage.setItem("username", data.user.user_name || "");
            // Redirect to /trade or wherever you want
            window.location.href = "/trade";
          } else {
            setError(data.error || "Failed to get access token");
          }
        })
        .catch((err) => setError("Network error"))
        .finally(() => setLoading(false));
    }
  }, []);

  // Step 2: If not authenticated, show login button
  const handleLogin = async () => {
    if (!selectedUser || !selectedUser.api_key) {
      setShowSelectUserAlert(true);
      return;
    }
    setShowSelectUserAlert(false);
    
    try {
      setLoading(true);
      // First, call the set-active-user API
      const response = await fetch(getApiUrl("api/set-active-user/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: selectedUser.user_id, 
          isActive: true 
        }),
      });

      if (response.ok) {
        // If successful, redirect to Kite
        window.location.href = `https://kite.zerodha.com/connect/login?api_key=${selectedUser.api_key}`;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to set active user");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error while setting active user");
      setLoading(false);
    }
  };

  if (loading) return <div>Authenticating with Kite...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (accessToken) return <div>Authenticated! Redirecting...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5faff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 10,
    }}>
      <div style={{
        border: '3px solid #2563eb',
        borderRadius: '24px',
        background: '#fff',
        padding: '48px 36px',
        boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{ fontSize: '2.2em', fontWeight: 800, color: '#2563eb', marginBottom: 12, letterSpacing: '0.02em' }}>
          Money Multiplier ⚡
        </h1>
        <div style={{ fontSize: '1.15em', fontWeight: 500, color: '#222', marginBottom: 32 }}>
          Your Trading Powerhouse – Built for Bold Moves and Big Wins!
        </div>
        {showSelectUserAlert && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please select the user first to login.
          </Alert>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', width: '100%' }}>
          <select
            value={selectedUser ? selectedUser.user_id : ""}
            onChange={e => {
              const userObj = users.find(u => u.user_id === e.target.value);
              setSelectedUser(userObj || null);
            }}
            style={{
              background: '#e3f0ff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '1.15em',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 0',
              textAlign: 'center',
              width: '80%',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: '18px',
            }}
          >
            <option value="" disabled>Select User</option>
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>{user.user_id}</option>
            ))}
          </select>
          <button
            onClick={handleLogin}
            style={{
              background: '#e3f0ff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '1.15em',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 0',
              width: '80%',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Login
          </button>
          <button
            onClick={() => window.location.href = '/register'}
            style={{
              background: '#e3f0ff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '1.15em',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 0',
              width: '80%',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Not User? Register here
          </button>
        </div>
      </div>
    </div>
  );
}

export default KiteAuth;
