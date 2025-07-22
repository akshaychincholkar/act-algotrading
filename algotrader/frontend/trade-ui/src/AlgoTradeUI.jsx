import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
// import axios from 'axios';
// Import UI components from shadcn/ui, react-hook-form, framer-motion as needed

const initialEntry = {
  stock: "",
  cmp: "",
  slp: "",
  tgtp: "",
  sb: "",
  rsi: "",
  candle: "",
  volume: "",
  pl: "",
  entry_date: "",
  exit_date: "",
  remarks: ""
};

import { useNavigate } from "react-router-dom";

export default function AlgoTradeUI() {
  // Buy handler for Trade Entries
  const handleBuyRow = async (row, idx) => {
    if (!user || !user.user_id || !row.stock) {
      alert('Missing user or stock information');
      return;
    }
    const payload = {
      user_id: user.user_id,
      stock_name: row.stock,
      quantity: row.sb && Number(row.sb) > 0 ? Number(row.sb) : 1
    };
    try {
      const response = await axios.post('http://localhost:8000/api/stock/buy', payload);
      if (response.status === 200) {
        // Simulate DB save: set id to a dummy value to show Save button
        const updated = [...entries];
        updated[idx] = { ...row, id: Date.now() };
        setEntries(updated);
        alert(`Buy order placed for ${row.stock}`);
      } else {
        alert('Failed to place buy order.');
      }
    } catch (error) {
      alert('Error placing buy order: ' + (error?.response?.data?.error || error.message));
    }
  };
  // Screener state (move all state declarations above useEffect hooks)
  const [screeners, setScreeners] = useState([]);
  const [selectedScreener, setSelectedScreener] = useState("");
  const [screenerStocks, setScreenerStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const navigate = useNavigate();
  const [capital, setCapital] = useState(100000);
  const [risk, setRisk] = useState(2);
  const [diversification, setDiversification] = useState(5);
  const [roiLoaded, setRoiLoaded] = useState(false);
  const [entries, setEntries] = useState([initialEntry]);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("kiteUser");
    return stored ? JSON.parse(stored) : null;
  });

  // Fetch stocks when selectedScreener changes
  useEffect(() => {
    if (!selectedScreener) {
      setScreenerStocks([]);
      return;
    }
    setLoadingStocks(true);
    axios.get(`http://localhost:8000/api/stocks?screener_name=${encodeURIComponent(selectedScreener)}`)
      .then(res => {
        if (res.data && Array.isArray(res.data.stocks)) {
          setScreenerStocks(res.data.stocks);
        } else {
          setScreenerStocks([]);
        }
      })
      .catch(() => setScreenerStocks([]))
      .finally(() => setLoadingStocks(false));
  }, [selectedScreener]);

  // Add stock to Trade Entries at the top
  const handleTradeStock = (stockName) => {
    const newEntry = computeRow({
      ...initialEntry,
      stock: stockName
    });
    setEntries(prev => [newEntry, ...prev]);
  };

  // Fetch all screeners on mount
  useEffect(() => {
    axios.get("http://localhost:8000/api/screener/")
      .then(res => {
        if (Array.isArray(res.data)) {
          setScreeners(res.data);
          if (res.data.length > 0) setSelectedScreener(res.data[0].screener_name || "");
        }
      })
      .catch(() => setScreeners([]));
  }, []);

  // On mount, check for request_token in URL and call generate-token API
  // On mount: handle request_token and fetch trades for user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestToken = params.get("request_token");
    if (requestToken) {
      axios.post("http://localhost:8000/api/generate-token/", { request_token: requestToken })
        .then(res => {
          setAccessToken(res.data.access_token);
          localStorage.setItem("accessToken", res.data.access_token);
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("kiteUser", JSON.stringify(res.data.user));
          }
          params.delete("request_token");
          const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState({}, "", newUrl);
          window.location.replace("/trade");
        })
        .catch(err => {
          setAccessToken("Failed to fetch access token");
        });
    } else {
      // If user is already set, fetch trades and ROI for user
      const kiteUser = user || (localStorage.getItem("kiteUser") ? JSON.parse(localStorage.getItem("kiteUser")) : null);
      if (kiteUser && kiteUser.user_id) {
        axios.get(`http://localhost:8000/api/trades/?user_id=${kiteUser.user_id}`)
          .then(res => {
            if (Array.isArray(res.data) && res.data.length > 0) {
              setEntries(res.data);
            }
          })
          .catch(err => {
            window.location.replace('/');
          });
        // Fetch user_roi for this user and update summary fields
        if (!roiLoaded) {
          axios.get(`http://localhost:8000/api/user_roi/?user_id=${kiteUser.user_id}`)
            .then(res => {
              if (res.data && typeof res.data === 'object') {
                // Update all summary fields except user
                if (res.data.total_capital !== undefined) setCapital(Number(res.data.total_capital));
                if (res.data.risk !== undefined) setRisk(Number(res.data.risk));
                if (res.data.diversification !== undefined) setDiversification(Number(res.data.diversification));
                // You can add more fields if you want to sync more
              }
              setRoiLoaded(true);
            })
            .catch(() => setRoiLoaded(true));
        }
      }
    }
  }, [user, roiLoaded]);

  // Calculated fields
  const riskPerTrade = capital * risk / 100;
  const totalRisk = riskPerTrade * diversification;
  const investmentPerTrade = capital / diversification;

  // Add row handler
  // Helper to compute all derived fields for a row
  const computeRow = (row) => {
    const cmp = Number(row.cmp) || 0;
    const slp = Number(row.slp) || 0;
    const tgtp = Number(row.tgtp) || 0;
    const sb = Number(row.sb) || 0;
    const sl = cmp - slp;
    const tgt = tgtp - cmp;
    const invested = cmp * sb;
    let booked = '';
    if (row.pl === 'Profit') booked = ((cmp + tgt) * sb - invested).toFixed(2);
    else if (row.pl === 'Loss') booked = ((cmp - sl) * sb - invested).toFixed(2);
    else booked = '';
    let rr = '';
    if (row.pl === 'Profit' && sl !== 0 && sb !== 0) rr = ((booked / sb) / sl).toFixed(2);
    const stb_sl = sl !== 0 ? Math.floor(riskPerTrade / sl) : 0;
    const stb_ipt = cmp !== 0 ? Math.floor(investmentPerTrade / cmp) : 0;
    let stb = '';
    if (stb_sl > 0 && stb_ipt > 0) stb = Math.min(stb_sl, stb_ipt).toString();
    else if (stb_sl > 0) stb = stb_sl.toString();
    else if (stb_ipt > 0) stb = stb_ipt.toString();
    const percent_pl = invested !== 0 ? ((booked / invested) * 100).toFixed(2) : '';
    return {
      ...row,
      sl: sl.toFixed(2),
      tgt: tgt.toFixed(2),
      stb_sl,
      stb_ipt,
      stb: stb ? Number(stb) : 0,
      invested: invested.toFixed(2),
      booked: booked ? Number(booked) : 0,
      rr: rr ? Number(rr) : 0,
      percent_pl: percent_pl ? Number(percent_pl) : 0,
    };
  };

  // Add row handler (ensure computed fields are set)
  const handleAddRow = () => setEntries(prev => [computeRow(initialEntry), ...prev]);

  // Helper for Tenure calculation
  const getTenure = (entry, exit) => {
    if (!entry) return "";
    const entryDate = new Date(entry);
    const today = new Date();
    if (!exit) {
      // Entry present, exit blank
      return Math.ceil((today - entryDate) / (1000 * 60 * 60 * 24));
    }
    // Both present
    const exitDate = new Date(exit);
    return Math.ceil((exitDate - entryDate) / (1000 * 60 * 60 * 24));
  };

  // Ensure all entries always have computed fields populated
  useEffect(() => {
    setEntries((prev) => prev.map(computeRow));
    // eslint-disable-next-line
  }, []);

  // Summary calculations (must be after all useState hooks and before return)
  let investedSum = 0, monthlyPLTotal = 0, taxPL = 0, donation = 0, monthlyGain = 0, monthlyGainPercent = 0;

  investedSum = entries.reduce((sum, row) => {
    if (row.pl) {
      const cmp = Number(row.cmp) || 0;
      const sb = Number(row.sb) || 0;
      return sum + cmp * sb;
    }
    return sum;
  }, 0);

  monthlyPLTotal = entries.reduce((sum, row) => {
    if (row.pl === "Profit" || row.pl === "Loss") {
      const cmp = Number(row.cmp) || 0;
      const slp = Number(row.slp) || 0;
      const tgtp = Number(row.tgtp) || 0;
      const sb = Number(row.sb) || 0;
      const sl = cmp - slp;
      const tgt = tgtp - cmp;
      const invested = cmp * sb;
      let booked = 0;
      if (row.pl === "Profit") booked = (cmp + tgt) * sb - invested;
      else if (row.pl === "Loss") booked = (cmp - sl) * sb - invested;
      return sum + booked;
    }
    return sum;
  }, 0);

  taxPL = monthlyPLTotal > 0 ? (monthlyPLTotal / capital) * 100 : 0;
  donation = monthlyPLTotal > 0 ? monthlyPLTotal * 0.04 : 0;
  monthlyGain = monthlyPLTotal - taxPL - donation;
  monthlyGainPercent = capital > 0 ? (monthlyGain / capital) * 100 : 0;
  const handleDeleteRow = async (row, index) => {
    // If the row has a database ID, call backend to delete
    if (row.id && typeof row.id === 'number') {
      try {
        await axios.delete('http://localhost:8000/api/trades/' + row.id + '/');
        alert('Row deleted from database!');
      } catch (error) {
        alert('Failed to delete row from database.');
        return;
      }
    }
    // Remove from UI
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const handleSaveRow = async (row, index) => {
    // Get user_id from user state (Kite user_id or map to your backend user)
    const user_id = user && user.user_id ? user.user_id : null;
    // Always use the latest user input from entries[index]
    const latest = entries[index];
    const cmp = Number(latest.cmp) || 0;
    const slp = Number(latest.slp) || 0;
    const tgtp = Number(latest.tgtp) || 0;
    const sb = Number(latest.sb) || 0;
    const sl = cmp - slp;
    const tgt = tgtp - cmp;
    const stb_sl = sl !== 0 ? Math.floor(riskPerTrade / sl) : 0;
    const stb_ipt = cmp !== 0 ? Math.floor(investmentPerTrade / cmp) : 0;
    let stb = '';
    if (stb_sl > 0 && stb_ipt > 0) stb = Math.min(stb_sl, stb_ipt).toString();
    else if (stb_sl > 0) stb = stb_sl.toString();
    else if (stb_ipt > 0) stb = stb_ipt.toString();
    const invested = cmp * sb;
    const pl = latest.pl;
    let booked = "";
    if (pl === "Profit") booked = ((cmp + tgt) * sb - invested).toFixed(2);
    else if (pl === "Loss") booked = ((cmp - sl) * sb - invested).toFixed(2);
    else booked = "";
    const rr = (pl === "Profit" && sl !== 0 && sb !== 0) ? ((booked / sb) / sl).toFixed(2) : "";
    const percent_pl = invested !== 0 ? ((booked / invested) * 100).toFixed(2) : "";
    const tenure = getTenure(latest.entry_date, latest.exit_date);

    // Ensure date fields are always in YYYY-MM-DD format
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    };

    // Build the complete trade object
    const tradeData = {
      stock: latest.stock || '',
      cmp: latest.cmp !== undefined && latest.cmp !== null && latest.cmp !== '' ? Number(latest.cmp) : 0,
      slp: latest.slp !== undefined && latest.slp !== null && latest.slp !== '' ? Number(latest.slp) : 0,
      tgtp: latest.tgtp !== undefined && latest.tgtp !== null && latest.tgtp !== '' ? Number(latest.tgtp) : 0,
      sb: latest.sb !== undefined && latest.sb !== null && latest.sb !== '' ? Number(latest.sb) : 0,
      rsi: latest.rsi || '',
      candle: latest.candle || '',
      volume: latest.volume || '',
      pl: latest.pl || '',
      entry_date: !latest.entry_date ? null : formatDate(latest.entry_date),
      exit_date: !latest.exit_date ? null : formatDate(latest.exit_date),
      remarks: latest.remarks || '',
      sl,
      tgt,
      stb_sl,
      stb_ipt,
      stb: stb ? Number(stb) : 0,
      invested,
      percent_pl: percent_pl ? Number(percent_pl) : 0,
      booked: booked ? Number(booked) : 0,
      rr: rr ? Number(rr) : 0,
      tenure: tenure ? parseInt(tenure) : null,
      user_id: user_id,
    };
    try {
      let response;
      if (row.id && typeof row.id === 'number') {
        response = await axios.put('http://localhost:8000/api/trades/' + row.id + '/', tradeData);
      } else {
        response = await axios.post('http://localhost:8000/api/trades/', tradeData);
      }
      const updated = [...entries];
      updated[index] = { ...row, ...response.data };
      setEntries(updated);
      alert(`Row saved successfully! ${JSON.stringify(response.data)}`);
    } catch (error) {
      alert('Failed to save row.');
    }
  };

  //  #TODO: code to list the all the trade
  // TODO: Rich the UI with scrollbar
  // TODO: Create gitlab for. 


  // Render
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center mb-4">
        {user && user.user_id && (
          <span className="text-lg font-semibold">Hello {user.user_shortname || user.user_id}!</span>
        )}
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Screener section above Trade Entries */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-bold mb-2">Screener</h2>
          <div className="flex items-center mb-4">
            <label htmlFor="screener-dropdown" className="mr-2 font-medium">Select Screener:</label>
            <select
              id="screener-dropdown"
              className="select select-bordered w-full max-w-xs"
              value={selectedScreener}
              onChange={e => setSelectedScreener(e.target.value)}
            >
              {screeners.length === 0 && <option value="">No screeners available</option>}
              {screeners.map((screener) => (
                <option key={screener.id || screener.screener_name} value={screener.screener_name}>
                  {screener.screener_name}
                </option>
              ))}
            </select>
          </div>
          {/* Stocks table for selected screener */}
          <div className="mt-2">
            <h3 className="text-md font-semibold mb-2">Stocks in Screener</h3>
            {loadingStocks ? (
              <div>Loading stocks...</div>
            ) : screenerStocks.length === 0 ? (
              <div className="text-gray-500">No stocks found for this screener.</div>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {screenerStocks.map((stock, idx) => (
                    <tr key={stock + idx}>
                      <td>{stock}</td>
                      <td>
                        <button className="btn btn-primary btn-xs" onClick={() => handleTradeStock(stock)}>
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Top summary and input fields in table format */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* ...existing code... */}
          <table className="table w-full">
            {/* ...existing code... */}
          </table>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Trade Entries</h2>
            <button className="btn btn-primary" onClick={handleAddRow}>Add Trade Entry</button>
          </div>
          <div className="overflow-x-auto" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table min-w-[1200px] w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Stock</th>
                  <th>CMP</th>
                  <th>SLP</th>
                  <th>TGTP</th>
                  <th>SL</th>
                  <th>TGT</th>
                  <th>STB-SL</th>
                  <th>STB-IPT</th>
                  <th>STB</th>
                  <th>SB</th>
                  <th>Invested</th>
                  <th>RSI</th>
                  <th>Candle</th>
                  <th>Volume</th>
                  <th>P/L</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Booked</th>
                  <th>r:R</th>
                  <th>Tenure</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td><input className="input input-bordered w-full" value={row.stock ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, stock: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td><input className="input input-bordered w-full" type="number" value={row.cmp ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, cmp: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td><input className="input input-bordered w-full" type="number" value={row.slp ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, slp: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td><input className="input input-bordered w-full" type="number" value={row.tgtp ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, tgtp: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td>{row.sl}</td>
                    <td>{row.tgt}</td>
                    <td>{row.stb_sl}</td>
                    <td>{row.stb_ipt}</td>
                    <td>{row.stb}</td>
                    <td><input className="input input-bordered w-full" type="number" value={row.sb ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, sb: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td>{row.invested}</td>
                    <td><select className="select select-bordered w-full" value={row.rsi ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, rsi: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select></td>
                    <td><select className="select select-bordered w-full" value={row.candle ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, candle: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Mazibozu">Mazibozu</option>
                      <option value="Bullish">Bullish</option>
                      <option value="Hammer">Hammer</option>
                      <option value="Engulf">Engulf</option>
                      <option value="Pin">Pin</option>
                      <option value="Tweezer">Tweezer</option>
                      <option value="Doji">Doji</option>
                      <option value="Bearish">Bearish</option>
                    </select></td>
                    <td><select className="select select-bordered w-full" value={row.volume ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, volume: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select></td>
                    <td><select className="select select-bordered w-full" value={row.pl ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, pl: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Profit">Profit</option>
                      <option value="Loss">Loss</option>
                    </select></td>
                    <td><input className="input input-bordered w-full" type="date" value={row.entry_date ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, entry_date: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td><input className="input input-bordered w-full" type="date" value={row.exit_date ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, exit_date: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td>{row.booked}</td>
                    <td>{row.rr}</td>
                    <td>{getTenure(row.entry_date, row.exit_date)}</td>
                    <td><input className="input input-bordered w-full" value={row.remarks ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, remarks: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td>
                      {/* FIXME: Check from the database it the entry is present and then only display buy/save */}
                      {row.id && typeof row.id === 'number' ? (
                        <button className="btn btn-success btn-xs mr-2" onClick={() => handleSaveRow(row, idx)}>Save</button>
                      ) : (
                        <button className="btn btn-primary btn-xs mr-2" onClick={() => handleBuyRow(row, idx)}>Buy</button>
                      )}
                      <button className="btn btn-error btn-xs" onClick={() => handleDeleteRow(row, idx)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Settings button at the bottom */}
      <div className="flex justify-center mt-8">
        <button
          className="btn btn-secondary"
          onClick={() => {
            const roiData = {
              user_id: user && user.user_id ? user.user_id : "",
              total_capital: capital,
              risk,
              total_risk: totalRisk,
              diversification,
              ipt: investmentPerTrade,
              rpt: riskPerTrade,
              invested: investedSum,
              monthly_pl: monthlyPLTotal,
              tax_pl: taxPL,
              donation_pl: donation,
              monthly_gain: monthlyGain,
              monthly_percent_gain: monthlyGainPercent,
              // total_gain and total_percert_gain can be set to monthly values or calculated as needed
              total_gain: monthlyGain,
              total_percert_gain: monthlyGainPercent
            };
            navigate('/user-roi', { state: roiData });
          }}
        >
          Settings
        </button>
      </div>
    </div>

  );
}
