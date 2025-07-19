// import React, { useState } from "react";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const initialState = {
  total_capital: "",
  risk: "",
  total_risk: "",
  diversification: "",
  ipt: "",
  rpt: "",
  invested: "",
  monthly_pl: "",
  tax_pl: "",
  donation_pl: "",
  monthly_gain: "",
  monthly_percent_gain: "",
  total_gain: "",
  total_percert_gain: ""
};

export default function UserROI() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Pre-populate form with values from navigation state if present
    if (location.state) {
      const { user_id, ...rest } = location.state;
      setForm(prev => ({ ...prev, ...rest }));
      setUserId(user_id || "");
    } else {
      // Try to get user_id from localStorage
      const kiteUser = localStorage.getItem("kiteUser");
      if (kiteUser) {
        try {
          setUserId(JSON.parse(kiteUser).user_id || "");
        } catch {}
      }
    }
  }, [location.state]);


  // Recalculate all dependent fields using the same formulas as AlgoTradeUI
  const recalculateForm = (changed, value) => {
    // Parse all as float for calculations
    const newForm = { ...form, [changed]: value };
    const capital = parseFloat(newForm.total_capital) || 0;
    const risk = parseFloat(newForm.risk) || 0;
    const diversification = parseFloat(newForm.diversification) || 0;
    const riskPerTrade = capital * risk / 100;
    const totalRisk = riskPerTrade * diversification;
    const investmentPerTrade = diversification !== 0 ? capital / diversification : 0;

    // These are summary fields, not per-trade, so we use the form's own values
    // If user edits a summary field, we let them override, but if they edit an input, we recalc
    if (["total_capital", "risk", "diversification"].includes(changed)) {
      newForm.rpt = riskPerTrade;
      newForm.total_risk = totalRisk;
      newForm.ipt = investmentPerTrade;
    }

    // If user edits monthly_pl, recalc tax, donation, gain, percent
    const monthlyPL = parseFloat(newForm.monthly_pl) || 0;
    let taxPL = monthlyPL > 0 && capital > 0 ? (monthlyPL / capital) * 100 : 0;
    let donation = monthlyPL > 0 ? monthlyPL * 0.04 : 0;
    let monthlyGain = monthlyPL - taxPL - donation;
    let monthlyGainPercent = capital > 0 ? (monthlyGain / capital) * 100 : 0;
    if (["monthly_pl", "total_capital"].includes(changed)) {
      newForm.tax_pl = taxPL;
      newForm.donation_pl = donation;
      newForm.monthly_gain = monthlyGain;
      newForm.monthly_percent_gain = monthlyGainPercent;
      // For now, set total_gain and total_percert_gain to monthly values
      newForm.total_gain = monthlyGain;
      newForm.total_percert_gain = monthlyGainPercent;
    }

    return newForm;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => recalculateForm(name, value));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    // Convert all fields to numbers or null for backend
    const payload = { user_id: userId };
    Object.keys(form).forEach(key => {
      let val = form[key];
      if (val === "" || val === null || typeof val === "undefined") {
        payload[key] = null;
      } else {
        let num = Number(val);
        // Round percent fields to 2 decimal places
        if (["monthly_percent_gain", "total_percert_gain"].includes(key) && !isNaN(num)) {
          num = Math.round(num * 100) / 100;
        }
        payload[key] = isNaN(num) ? null : num;
      }
    });
    try {
      await axios.post("http://localhost:8000/api/user_roi/", payload);
      setMessage("Saved successfully!");
      alert("Saved successfully!");
    } catch (err) {
      setMessage("Error saving data.");
      alert("Error saving data.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">User ROI Entry</h2>
        {Object.keys(initialState).map((key) => (
          <div className="mb-4" key={key}>
            <label className="block mb-1 font-semibold capitalize" htmlFor={key}>{key.replace(/_/g, " ")}</label>
            <input
              className="input input-bordered w-full"
              type="number"
              step="0.01"
              id={key}
              name={key}
              value={form[key]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button className="btn btn-primary w-full" type="submit">Save</button>
        <button className="btn btn-secondary w-full mt-4" type="button" onClick={() => navigate('/trade')}>Back</button>
        {message && <div className="mt-4 text-center font-semibold">{message}</div>}
      </form>
    </div>
  );
}
