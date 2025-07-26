import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AlgoTradeUI from "./AlgoTradeUI";
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import KiteAuth from './KiteAuth';
import UserROI from './UserROI';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { getApiUrl, FRONTEND_BASE_URL } from './config/api';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useLocation, useNavigate as useNav } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(getApiUrl("api/register-user"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, user_id: userId })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5faff', position: 'fixed', top: 0, left: 0, zIndex: 10
    }}>
      <div style={{
        border: '3px solid #2563eb', borderRadius: '24px', background: '#fff', padding: '40px 32px', boxShadow: '0 4px 24px rgba(37,99,235,0.08)', maxWidth: '580px', width: '100%', textAlign: 'center', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '2em', fontWeight: 800, color: '#2563eb', marginBottom: 10 }}>Money Multiplier Registration⚡</h1>
        <div style={{ fontSize: '1.1em', fontWeight: 500, color: '#222', marginBottom: 24, textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: 10 }}>
            Visit: <a href="https://developers.kite.trade" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>👉 https://developers.kite.trade</a>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Log In</strong><br />
            Click on "Login" (top-right)
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Log in with your Zerodha client ID & password</strong><br />
            (same as kite.zerodha.com)
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Click on "Create New App"</strong><br />
            Once logged in, you'll be redirected to the dashboard.<br />
            Click “+ Create new app” or “Create app” button.
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Fill App Details</strong><br />
            Redirect URL: <span style={{ color: '#2563eb', fontWeight: 700 }}>{FRONTEND_BASE_URL}/trade</span><br />
            Description and your Zerodha Client ID
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Enter your API Key, API Secret and Zerodha User ID below</strong>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: '32%',
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid #e3f0ff',
                fontSize: '1.1em',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                background: '#fff',
                color: '#2563eb',
                fontWeight: 300,
              }}
              required
            />
            <input
              type="text"
              placeholder="API Secret"
              value={apiSecret}
              onChange={e => setApiSecret(e.target.value)}
              style={{
                width: '32%',
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid #e3f0ff',
                fontSize: '1.1em',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                background: '#fff',
                color: '#2563eb',
                fontWeight: 300,
              }}
              required
            />
            <input
              type="text"
              placeholder="Kite User ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              style={{
                width: '32%',
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid #e3f0ff',
                fontSize: '1.1em',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                background: '#fff',
                color: '#2563eb',
                fontWeight: 300,
              }}
              required
            />
          </div>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error === 'Registration failed.' || error === 'An error occurred. Please try again.'
                ? 'User Registration Failed! Please check your API Key, API Secret, and User ID.'
                : error}
            </Alert>
          )}
          {success && (
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" sx={{ mb: 2 }}>
              User Registration is Successful! You can now login to the app.
            </Alert>
          )}
          <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', marginTop: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#e3f0ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '1.15em',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 0',
                width: '50%',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: '#e3f0ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '1.15em',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 0',
                width: '50%',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
    );
  
  }

// Main App component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KiteAuth />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/trade" element={<AlgoTradeUI />} />
        <Route path="/user-roi" element={<UserROI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
