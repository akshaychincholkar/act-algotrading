import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AlgoTradeUI from "./AlgoTradeUI";
import KiteAuth from './KiteAuth';
import UserROI from './UserROI';

function Home() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  // When authenticated, redirect to /trade
  if (authenticated) {
    navigate('/trade');
    return null;
  }
  return <KiteAuth onAuthenticated={() => setAuthenticated(true)} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trade" element={<AlgoTradeUI />} />
        <Route path="/user-roi" element={<UserROI />} />
      </Routes>
    </BrowserRouter>
  );
}
