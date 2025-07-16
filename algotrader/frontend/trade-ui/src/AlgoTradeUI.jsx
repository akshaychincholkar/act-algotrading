import React, { useState } from "react";
import axios from 'axios';
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

export default function AlgoTradeUI() {
  const [capital, setCapital] = useState(100000);
  const [risk, setRisk] = useState(2);
  const [diversification, setDiversification] = useState(5);
  const [entries, setEntries] = useState([initialEntry]);

  // Calculated fields
  const riskPerTrade = capital * risk / 100;
  const totalRisk = riskPerTrade * diversification;
  const investmentPerTrade = capital / diversification;

  // Add row handler
  const handleAddRow = () => setEntries([...entries, initialEntry]);

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
      alert('Row saved successfully!');
    } catch (error) {
      alert('Failed to save row.');
    }
  };
  // Render
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top summary and input fields in table format */}
        <div className="bg-white rounded-lg shadow p-6">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Total Capital</th>
                <th>Risk</th>
                <th>Total Risk</th>
                <th>Diversification</th>
                <th>Investment/Trade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="number" className="input input-bordered w-full" value={capital} onChange={e => setCapital(Number(e.target.value))} min={0} /></td>
                <td><input type="number" className="input input-bordered w-full" value={risk} onChange={e => setRisk(Number(e.target.value))} min={1} /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={totalRisk.toFixed(2)} readOnly /></td>
                <td><input type="number" className="input input-bordered w-full" value={diversification} onChange={e => setDiversification(Number(e.target.value))} min={1} /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={investmentPerTrade.toFixed(2)} readOnly /></td>
              </tr>
              <tr>
                <th>Risk/Trade</th>
                <th>Invested</th>
                <th>Monthly P/L Total</th>
                <th>Tax P/L (%)</th>
                <th>Donation</th>
              </tr>
              <tr>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={riskPerTrade.toFixed(2)} readOnly /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={investedSum.toFixed(2)} readOnly /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={monthlyPLTotal.toFixed(2)} readOnly /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={taxPL.toFixed(2)} readOnly /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={donation.toFixed(2)} readOnly /></td>
              </tr>
              <tr>
                <th>Monthly Gain</th>
                <th>Monthly Gain (%)</th>
                <th colSpan={3}></th>
              </tr>
              <tr>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={monthlyGain.toFixed(2)} readOnly /></td>
                <td><input type="number" className="input input-bordered w-full bg-gray-100" value={monthlyGainPercent.toFixed(2)} readOnly /></td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Trade Entries</h2>
            <button className="btn btn-primary" onClick={handleAddRow}>Add Trade Entry</button>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-200 text-sm font-semibold">
                  <th>#</th>
                  <th>Stock</th>
                  <th>CMP</th>
                  <th>SLP</th>
                  <th>TGTP</th>
                  <th title="Stop Loss = CMP - SLP">SL</th>
                  <th title="Target = TGTP - CMP">TGT</th>
                  <th title="Stocks to buy based on Stop Loss = Risk/Trade / SL">STB-SL</th>
                  <th title="Stocks to buy based on Investment/Trade = Investment/Trade / CMP">STB-IPT</th>
                  <th title="Stocks to buy = Min(STB-SL, STB-IPT)">STB</th>
                  <th>SB</th>
                  <th title="Invested Amount = CMP * SB">Invested</th>
                  <th>RSI</th>
                  <th>Candle</th>
                  <th>Volume</th>
                  <th title="Profit/Loss?">P/L</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th title="Booked = (CMP + TGT) * SB - Invested (Profit), (CMP - SL) * SB - Invested (Loss)">Booked</th>
                  <th title="Risk to Reward Ratio = (Booked / SB) / SL (if Profit)">r:R</th>
                  <th title="Tenure in days">Tenure</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, idx) => {
                  // Calculated fields
                  const cmp = Number(row.cmp) || 0;
                  const slp = Number(row.slp) || 0;
                  const tgtp = Number(row.tgtp) || 0;
                  const sb = Number(row.sb) || 0;
                  const sl = cmp - slp;
                  const tgt = tgtp - cmp;
                  const stb_sl = sl !== 0 ? Math.floor(riskPerTrade / sl) : 0;
                  const stb_ipt = cmp !== 0 ? Math.floor(investmentPerTrade / cmp) : 0;
                  let stb = '';
                  if (stb_sl > 0 && stb_ipt > 0) stb = Math.min(stb_sl, stb_ipt).toString();
                  else if (stb_sl > 0) stb = stb_sl.toString();
                  else if (stb_ipt > 0) stb = stb_ipt.toString();
                  // SB is editable, Invested updates when SB is entered
                  const invested = cmp * (Number(row.sb) || 0);
                  const pl = row.pl;
                  let booked = "";
                  if (pl === "Profit") booked = ((cmp + tgt) * (Number(row.sb) || 0) - invested).toFixed(2);
                  else if (pl === "Loss") booked = ((cmp - sl) * (Number(row.sb) || 0) - invested).toFixed(2);
                  else booked = "";
                  const rr = (pl === "Profit" && sl !== 0 && (Number(row.sb) || 0) !== 0) ? ((booked / (Number(row.sb) || 0)) / sl).toFixed(2) : "";
                  const tenure = getTenure(row.entry_date, row.exit_date);

                  // Handler to update entry fields
                  const handleEntryChange = (field, value) => {
                    const updatedEntries = entries.map((entry, i) =>
                      i === idx ? { ...entry, [field]: value } : entry
                    );
                    setEntries(updatedEntries);
                  };

                  return (
                    <tr key={idx}>
                      <td className="flex items-center gap-2">
                        {idx + 1}
                      </td>
                      <td><input type="text" className="input input-bordered" value={row.stock} onChange={e => handleEntryChange('stock', e.target.value)} /></td>
                      <td><input type="number" className="input input-bordered" value={row.cmp} onChange={e => handleEntryChange('cmp', e.target.value)} /></td>
                      <td><input type="number" className="input input-bordered" value={row.slp} onChange={e => handleEntryChange('slp', e.target.value)} /></td>
                      <td><input type="number" className="input input-bordered" value={row.tgtp} onChange={e => handleEntryChange('tgtp', e.target.value)} /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={sl.toFixed(2)} readOnly title="Stop Loss = CMP - SLP" /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={tgt.toFixed(2)} readOnly title="Target = TGTP - CMP" /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={stb_sl.toFixed(2)} readOnly title="Stocks to buy based on Stop Loss = Risk/Trade / SL" /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={stb_ipt.toFixed(2)} readOnly title="Stocks to buy based on Investment/Trade = Investment/Trade / CMP" /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={stb} readOnly title="Stocks to buy = Min(STB-SL, STB-IPT)" /></td>
                      <td><input type="number" className="input input-bordered" value={row.sb} onChange={e => handleEntryChange('sb', e.target.value)} /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={row.sb ? invested.toFixed(2) : ""} readOnly title="Invested Amount = CMP * SB" /></td>
                      <td><select className="select select-bordered" value={row.rsi} onChange={e => handleEntryChange('rsi', e.target.value)}><option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option></select></td>
                      <td><select className="select select-bordered" value={row.candle} onChange={e => handleEntryChange('candle', e.target.value)}><option value="">Select</option><option value="Mazibozu">Mazibozu</option><option value="Bullish">Bullish</option><option value="Hammer">Hammer</option><option value="Engulf">Engulf</option><option value="Pin">Pin</option><option value="Tweezer">Tweezer</option><option value="Doji">Doji</option><option value="Bearish">Bearish</option></select></td>
                      <td><select className="select select-bordered" value={row.volume} onChange={e => handleEntryChange('volume', e.target.value)}><option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option></select></td>
                      <td><select className="select select-bordered" value={row.pl} title="Profit/Loss?" onChange={e => handleEntryChange('pl', e.target.value)}><option value="">Select</option><option value="Profit">Profit</option><option value="Loss">Loss</option></select></td>
                      <td><input type="date" className="input input-bordered" value={row.entry_date} onChange={e => handleEntryChange('entry_date', e.target.value)} /></td>
                      <td><input type="date" className="input input-bordered" value={row.exit_date} onChange={e => handleEntryChange('exit_date', e.target.value)} /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={(pl === "Profit" || pl === "Loss") ? booked : ""} readOnly title="Booked = (CMP + TGT) * SB - Invested (Profit), (CMP - SL) * SB - Invested (Loss)" /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={(pl === "Profit" || pl === "Loss") ? rr : ""} readOnly title="Risk to Reward Ratio = (Booked / SB) / SL (if Profit)" /></td>
                      <td><input type="number" className="input input-bordered bg-gray-100" value={tenure} readOnly title="Tenure in days" /></td>
                      <td><input type="text" className="input input-bordered w-48" value={row.remarks} onChange={e => handleEntryChange('remarks', e.target.value)} /></td>
                      <button
                          type="button"
                          className="btn btn-xs btn-success ml-2"
                          title="Save this entry"
                          onClick={() => handleSaveRow(entries[idx], idx)}
                        >
                          Save
                        </button>
                      <button
                          type="button"
                          className="btn btn-xs btn-error ml-2"
                          title="Delete this entry"
                          onClick={() => handleDeleteRow(idx)}
                        >
                          Delete
                        </button>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
