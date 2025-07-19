import React, { useEffect, useState } from "react";
import axios from "axios";

export default function KiteAuth({ onAuthenticated }) {
  const [apiKey, setApiKey] = useState("");
  const [redirected, setRedirected] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // If already authenticated, skip redirect
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if (accessToken) return;
    // Fetch api_key from globalParameters
    axios.get("http://localhost:8000/api/globalparameters/?key=api_key")
      .then(res => {
        const key = res.data.value || res.data[0]?.value;
        setApiKey(key);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if (accessToken) return;
    if (apiKey && !redirected) {
      setRedirected(true);
      window.location.href = `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;
    }
  }, [apiKey, redirected]);

  // After redirect, handle access_token from URL (assuming redirect_uri is set to your app)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if (accessToken && !done) {
      setDone(true);
      // Save user with dummy info and access_token
      axios.post("http://localhost:8000/api/users/", {
        first_name: "Kite",
        last_name: "User",
        phone_no: "9999999999",
        email_id: "kiteuser@example.com",
        broker_id: "ZERODHA",
        access_token: accessToken
      }).then(() => {
        if (onAuthenticated) onAuthenticated();
        // Reroute to homepage (AlgoTradeUI)
        window.location.replace("/");
      });
    }
  }, [done, onAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-bold">Redirecting to Kite authentication...</div>
    </div>
  );
}
