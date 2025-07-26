// import React, { useState } from "react";

import React, { useState, useEffect } from "react";
import { getApiUrl } from './config/api';
const screenerTableColumns = [
  "screener_name",
  "created_by",
  "created_at",
  "updated_at",
  "last_run"
];
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
  const [screeners, setScreeners] = useState([]);

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

  // Fetch all screener entries on mount
  useEffect(() => {
    axios.get(getApiUrl("api/screener/"))
      .then(res => setScreeners(res.data))
      .catch(() => setScreeners([]));
  }, []);


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
      await axios.post(getApiUrl("api/user_roi/"), payload);
      setMessage("Saved successfully!");
      alert("Saved successfully!");
    } catch (err) {
      setMessage("Error saving data.");
      alert("Error saving data.");
    }
  };

  // Add Screener Modal state and logic
  const [showAddModal, setShowAddModal] = useState(false);
  const [screenerName, setScreenerName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const handleAddScreener = async () => {
    if (!screenerName) return;
    setAddLoading(true);
    setAddError("");
    try {
      const payload = { user_id: userId , screener_name: screenerName};
      // const res = await axios.post(
      //   `http://localhost:8000/screener/`,
      //    { screener_name: screenerName, user_id: userId }
      // );
      // const res = await axios.post("http://localhost:8000/api/screener/", { user_id: userId, screener_name: screenerName });
      const res = await axios.post(getApiUrl("api/screener/"), payload);
      if (res.data.success) {
        // Refresh screener list
        const listRes = await axios.get(getApiUrl("api/screener/"));
        setScreeners(listRes.data);
        setScreenerName("");
        setShowAddModal(false);
      } else {
        setAddError(res.data.error || "Unknown error");
      }
    } catch (e) {
      setAddError(e.response?.data?.error || "Failed to add screener");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
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
        maxWidth: '900px',
        width: '90%',
        textAlign: 'center',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxHeight: '90vh',
        overflowY: 'auto',
        paddingTop: '60px',
      }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2563eb', textAlign: 'center', fontSize: '2.2em', fontWeight: 800, letterSpacing: '0.02em', marginBottom: '32px', marginTop: '0px' }}>Investment Plan</h2>
        
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', marginBottom: '32px' }}>
            {Object.keys(initialState).map((key) => (
              <div className="mb-4" key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label className="block mb-1 font-semibold capitalize" style={{ color: '#2563eb', fontSize: '1.1em', marginBottom: '8px' }} htmlFor={key}>{key.replace(/_/g, " ")}</label>
                <input
                  className="input input-bordered w-full"
                  style={{ 
                    background: '#fff', 
                    border: '2px solid #2563eb', 
                    color: '#2563eb', 
                    fontSize: '1.13em',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    maxWidth: '250px',
                    fontWeight: 600
                  }}
                  type="number"
                  step="0.01"
                  id={key}
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
            <button 
              className="btn btn-primary w-full" 
              type="submit"
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
              Save
            </button>
          </div>
          {message && <div className="mt-4 text-center font-semibold" style={{ color: '#2563eb', fontSize: '1.1em', marginTop: '20px' }}>{message}</div>}
        </form>

        {/* Screener Table */}
        <div className="mt-8" style={{ width: '100%', marginTop: '40px' }}>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#2563eb', fontSize: '1.8em', textAlign: 'center', marginBottom: '24px', fontWeight: 700 }}>Screeners</h3>
          <div className="overflow-x-auto" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table w-full" style={{ background: '#fff', border: '2px solid #2563eb', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <thead>
                <tr style={{ background: '#e3f0ff' }}>
                  {screenerTableColumns.map(col => (
                    <th key={col} className="capitalize" style={{ color: '#2563eb', fontSize: '1.1em', padding: '12px', borderBottom: '2px solid #2563eb', fontWeight: 700 }}>{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {screeners.length === 0 ? (
                  <tr><td colSpan={screenerTableColumns.length} className="text-center" style={{ color: '#2563eb', fontSize: '1.1em', padding: '20px' }}>No screeners found</td></tr>
                ) : (
                  screeners.map((screener, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e3f0ff' }}>
                      {screenerTableColumns.map(col => (
                        <td key={col} style={{ color: '#2563eb', fontSize: '1.05em', padding: '12px', textAlign: 'center' }}>{screener[col]?.toString() || ""}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '24px' }}>
            <button 
              className="btn btn-accent" 
              type="button" 
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#e3f0ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '1.15em',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 24px',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Add Screener
            </button>
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => navigate('/trade')}
              style={{
                background: '#e3f0ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '1.15em',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 24px',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Add Screener Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div style={{
            border: '3px solid #2563eb',
            borderRadius: '24px',
            background: '#fff',
            padding: '36px 28px',
            boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2563eb', fontSize: '1.8em', fontWeight: 800, letterSpacing: '0.02em', marginBottom: '24px' }}>Add Screener</h3>
            <input
              className="input input-bordered w-full mb-2"
              style={{ 
                background: '#fff', 
                border: '2px solid #2563eb', 
                color: '#2563eb', 
                fontSize: '1.13em',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                marginBottom: '20px',
                fontWeight: 600,
                width: '80%'
              }}
              type="text"
              placeholder="Screener Name"
              value={screenerName}
              onChange={e => setScreenerName(e.target.value)}
              disabled={addLoading}
            />
            {addError && <div className="text-red-500 mb-2" style={{ fontSize: '1.05em', marginBottom: '16px' }}>{addError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
              <button 
                className="btn btn-primary flex-1" 
                onClick={handleAddScreener} 
                disabled={addLoading || !screenerName}
                style={{
                  background: '#e3f0ff',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '1.1em',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 0',
                  width: '80%',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {addLoading ? "Verifying..." : "Verify & Add"}
              </button>
              <button 
                className="btn btn-secondary flex-1" 
                onClick={() => setShowAddModal(false)} 
                disabled={addLoading}
                style={{
                  background: '#e3f0ff',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '1.1em',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 0',
                  width: '80%',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
