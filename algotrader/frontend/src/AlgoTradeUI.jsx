// Main AlgoTradeUI component for the trading dashboard
import React, { useState, useEffect } from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
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
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { PieChart } from '@mui/x-charts/PieChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getApiUrl } from './config/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from "axios";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
// import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import SaveIconSvg from './assets/save-icon.svg';
import DeleteIconSvg from './assets/delete-icon.svg';
// Responsive MUI AppBar component
const pages = [
  { label: 'INDIA', comingSoon: false },
  { label: 'US', comingSoon: true },
  { label: 'F&O', comingSoon: true }
];
const settings = ['Settings', 'Logout'];

// Template for a new trade entry row
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
  // --- UI and utility helpers ---
  // Styled Paper for grid items
  // Helper to determine contrast color (black/white) based on background
  function getContrastColor(bgColor) {
    // Remove hash if present
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // Perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180 ? '#222' : '#fff';
  }

  // Use a slightly off-white background for grid items
  const gridBg = '#f8fafc';
  const gridColor = getContrastColor(gridBg);
  const Item = styled(Paper)(() => ({
    backgroundColor: gridBg,
    padding: 8,
    textAlign: 'center',
    color: gridColor,
    fontWeight: 'bold',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    borderRadius: 8,
  }));

  // ResponsiveAppBar component inside AlgoTradeUI to access state variables
  const ResponsiveAppBar = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };

    const handleMenuItemClick = (setting) => {
      if (setting === 'Logout') {
        // Clear local storage and redirect to home
        localStorage.removeItem("accessToken");
        localStorage.removeItem("kiteUser");
        window.location.href = '/';
      } else if (setting === 'Settings') {
        // Route to user-roi page with ROI data
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
          total_gain: monthlyGain,
          total_percert_gain: monthlyGainPercent
        };
        navigate('/user-roi', { state: roiData });
      }
      setAnchorElUser(null);
    };

    return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Money Multiplier⚡
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  page.comingSoon ? (
                    <Tooltip key={page.label} title="Coming soon" arrow>
                      <span>
                        <MenuItem disabled>
                          <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                        </MenuItem>
                      </span>
                    </Tooltip>
                  ) : (
                    <MenuItem key={page.label} onClick={handleCloseNavMenu}>
                      <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                    </MenuItem>
                  )
                ))}
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Money Multiplier ⚡
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                page.comingSoon ? (
                  <Tooltip key={page.label} title="Coming soon" arrow>
                    <span>
                      <Button
                        onClick={handleCloseNavMenu}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                        disabled
                      >
                        {page.label}
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Button
                    key={page.label}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.label}
                  </Button>
                )
              ))}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Settings" sx={{ bgcolor: '#061a0ae1', color: 'white', fontSize: '1.2em' }}>⚡</Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={() => handleMenuItemClick(setting)}>
                    <Typography textAlign="center" sx={{ fontSize: '1.15em' }}>{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  };
  // --- Trade action handlers ---
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
      const response = await axios.post(getApiUrl('api/stock/buy'), payload);
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
  // --- Screener and stock state ---
  const [screeners, setScreeners] = useState([]);
  const [selectedScreener, setSelectedScreener] = useState("");
  const [screenerStocks, setScreenerStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  // Pagination for stocks table
  const [stocksPage, setStocksPage] = useState(1);
  const stocksPerPage = 5;
  const paginatedStocks = screenerStocks.slice((stocksPage - 1) * stocksPerPage, stocksPage * stocksPerPage);
  const totalPages = Math.ceil(screenerStocks.length / stocksPerPage);
  const navigate = useNavigate();
  // --- User, capital, and trade state ---
  // Capital, risk, diversification, and trade entries
  const [capital, setCapital] = useState(0);
  const [risk, setRisk] = useState(0);
  const [diversification, setDiversification] = useState(0);
  const [roiLoaded, setRoiLoaded] = useState(false);
  // Main trade entries array
  const [entries, setEntries] = useState([initialEntry]);
  // User authentication and info
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("kiteUser");
    return stored ? JSON.parse(stored) : null;
  });

  // --- Data fetching hooks ---
  // Fetch stocks when selectedScreener changes
  useEffect(() => {
    if (!selectedScreener) {
      setScreenerStocks([]);
      return;
    }
    setLoadingStocks(true);
    axios.get(getApiUrl(`api/stocks?screener_name=${encodeURIComponent(selectedScreener)}`))
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

  // Add stock to Trade Entries at the top (from screener)
  const handleTradeStock = (stockName) => {
    const newEntry = computeRow({
      ...initialEntry,
      stock: stockName
    });
    setEntries(prev => [newEntry, ...prev]);
  };

  // Fetch all screeners on mount
  useEffect(() => {
    axios.get(getApiUrl("api/screener/"))
      .then(res => {
        if (Array.isArray(res.data)) {
          setScreeners(res.data);
          // Do not auto-select any screener, keep blank by default
          // setSelectedScreener("");
        }
      })
      .catch(() => setScreeners([]));
  }, []);

  // On mount: handle request_token and fetch trades for user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestToken = params.get("request_token");
    if (requestToken) {
      axios.post(getApiUrl("api/generate-token/"), { request_token: requestToken })
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
        axios.get(getApiUrl(`api/trades/?user_id=${kiteUser.user_id}`))
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
          axios.get(getApiUrl(`api/user_roi/?user_id=${kiteUser.user_id}`))
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

  // --- Calculated fields for summary stats ---
  const riskPerTrade = capital * risk / 100;
  const totalRisk = riskPerTrade * diversification;
  const investmentPerTrade = capital / diversification;

  // --- Trade row calculation logic ---
  // Helper to compute all derived fields for a row
  const computeRow = (row) => {
    const cmp = Number(row.cmp) || 0;
    const slp = Number(row.slp) || 0;
    const tgtp = Number(row.tgtp) || 0;
    const sb = Number(row.sb) || 0;
    const sl = cmp - slp;
    const tgt = tgtp - cmp;
    // Invested logic: CMP * SB only when P/L is not selected
    let invested;
    if (!row.pl) {
      invested = cmp * sb;
    } else {
      invested = cmp * sb; // fallback to previous logic, can be customized if needed
    }
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

  // Helper for Tenure calculation (days between entry and exit)
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

  // Ensure all entries always have computed fields populated (on mount)
  useEffect(() => {
    setEntries((prev) => prev.map(computeRow));
    // eslint-disable-next-line
  }, []);

  // --- Summary calculations for dashboard KPIs ---
  // (must be after all useState hooks and before return)

let investedSum = 0, monthlyPLTotal = 0, taxPL = 0, donation = 0, monthlyGain = 0, monthlyGainPercent = 0;

// Only sum Invested for rows where P/L is not selected
investedSum = entries.reduce((sum, row) => {
  if (!row.pl) {
    // Use the computed invested value for the row
    return sum + (Number(row.invested) || 0);
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

taxPL = monthlyPLTotal > 0 ? monthlyPLTotal  * 0.2 : 0;
donation = monthlyPLTotal > 0 ? monthlyPLTotal * 0.04 : 0;
monthlyGain = monthlyPLTotal - taxPL - donation;
monthlyGainPercent = capital > 0 ? (monthlyGain / capital) * 100 : 0;

// Pie chart data: sum of Booked < 0 and > 0
const bookedPositive = entries.reduce((sum, row) => sum + (row.booked > 0 ? row.booked : 0), 0);
const bookedNegative = entries.reduce((sum, row) => sum + (row.booked < 0 ? Math.abs(row.booked) : 0), 0);
const pieData = [
  { id: 0, value: bookedPositive, label: 'Profit', color: '#38a169' },
  { id: 1, value: bookedNegative, label: 'Loss', color: '#dc2626' },
];
  // --- Row action handlers for Trade table ---
  // Delete a trade row (and from backend if saved)
  const handleDeleteRow = async (row, index) => {
    // If the row has a database ID, call backend to delete
    if (row.id && typeof row.id === 'number') {
      try {
        await axios.delete(getApiUrl('api/trades/' + row.id + '/'));
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

  // Save a trade row (create or update in backend)
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
        response = await axios.put(getApiUrl('api/trades/' + row.id + '/'), tradeData);
      } else {
        response = await axios.post(getApiUrl('api/trades/'), tradeData);
      }
      const updated = [...entries];
      updated[index] = { ...row, ...response.data };
      setEntries(updated);
      alert(`Trade saved successfully! `);
    } catch (error) {
      alert('Failed to save row.');
    }
  };

  //  #TODO: code to list the all the trade
  // TODO: Rich the UI with scrollbar
  // TODO: Create gitlab for. 


  // --- Main Render ---
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Show AppBar on all screens except '/' route */}
      {window.location.pathname !== '/' && <ResponsiveAppBar />}
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', minHeight: '100vh', width: '100vw', padding: '32px 0' }}>
      {/* Upper section divided into two parts: ROI grid and Screener/Stocks */}
      <div className="flex flex-row gap-8 mb-8" style={{ justifyContent: 'flex-start', marginLeft: '10%', width: '100%' }}>
        {/* Part 1: ROI Grid in Box (summary KPIs) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
          {/* Centered Heading above KPI Box */}
          <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '18px' }}>
            {user?.user_shortname ? `${user.user_shortname}'s Risk Management & ROI Portfolio` : 'Risk Management & ROI Portfolio'}
          </h1>
          <Box sx={{ flexGrow: 1, width: '100%', border: '2px solid #222', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#fff', padding: '24px 6px', marginBottom: '0px', paddingRight: '-30%' }}>
            <Grid container spacing={2} columns={4}>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Total Capital<br />{capital}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Risk (%)<br />{risk}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Total Risk<br />{totalRisk.toFixed(2)}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Diversification<br />{diversification}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Investment/Trade<br />{investmentPerTrade.toFixed(2)}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Risk/Trade<br />{riskPerTrade.toFixed(2)}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}><Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>Invested<br />{investedSum.toFixed(2)}</Item></Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 }}>
                <Item sx={{ height: '50%', minWidth: 0 , fontSize: '1.3rem'}}>
                  Monthly P/L<br />
                  <span style={{ color: monthlyPLTotal > 0 ? '#38a169' : monthlyPLTotal < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {monthlyPLTotal.toFixed(2)}
                  </span>
                </Item>
              </Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 , fontSize: '1.3rem'}}>
                <Item sx={{ height: '50%', minWidth: 0 }}>
                  Tax P/L<br />
                  <span style={{ color: taxPL > 0 ? '#38a169' : taxPL < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {taxPL.toFixed(2)}
                  </span>
                </Item>
              </Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 , fontSize: '1.3rem'}}>
                <Item sx={{ height: '50%', minWidth: 0 }}>
                  Donation<br />
                  <span style={{ color: donation > 0 ? '#38a169' : donation < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {donation.toFixed(2)}
                  </span>
                </Item>
              </Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 , fontSize: '1.3rem'}}>
                <Item sx={{ height: '50%', minWidth: 0 }}>
                  Monthly Gain<br />
                  <span style={{ color: monthlyGain > 0 ? '#38a169' : monthlyGain < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {monthlyGain.toFixed(2)}
                  </span>
                </Item>
              </Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 , fontSize: '1.3rem'}}>
                <Item sx={{ height: '50%', minWidth: 0 }}>
                  Monthly % Gain<br />
                  <span style={{ color: monthlyGainPercent > 0 ? '#38a169' : monthlyGainPercent < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {monthlyGainPercent.toFixed(2)}
                  </span>
                </Item>
              </Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 , fontSize: '1.3rem'}}>
                <Item sx={{ height: '50%', minWidth: 0 }}>
                  Total Gain<br />
                  <span style={{ color: monthlyGainPercent > 0 ? '#38a169' : monthlyGainPercent < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {monthlyGainPercent.toFixed(2)}
                  </span>
                </Item>
              </Grid>
              <Grid item xs={1} sx={{ minWidth: 0, width: '20%', height: 120 , fontSize: '1.3rem'}}>
                <Item sx={{ height: '50%', minWidth: 0 }}>
                  Total % Gain<br />
                  <span style={{ color: monthlyGainPercent > 0 ? '#38a169' : monthlyGainPercent < 0 ? 'red' : undefined, fontWeight: 'bold' }}>
                    {monthlyGainPercent.toFixed(2)}
                  </span>
                </Item>
              </Grid>
            </Grid>
          </Box>
          {/* Pie charts below the Box and grids (side by side) */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '12px' }}>Monthly P/L</h2>
              <PieChart
                series={[{
                  data: pieData,
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                  startAngle: -90,
                  endAngle: 90,
                  cx: 150,
                  cy: 150,
                  // Custom label rendering for bold and colored labels
                  label: ({ data }) => (
                    <text
                      x={data.cx}
                      y={data.cy - 110 + data.id * 30}
                      textAnchor="middle"
                      fontWeight="bold"
                      fontSize="16"
                      fill={data.label === 'Profit' ? '#38a169' : '#dc2626'}
                    >
                      {data.label}
                    </text>
                  ),
                }]}
                width={300}
                height={300}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '12px' }}>Total P/L</h2>
              <PieChart
                series={[{
                  data: pieData,
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                  startAngle: -90,
                  endAngle: 90,
                  cx: 150,
                  cy: 150,
                  // Custom label rendering for bold and colored labels
                  label: ({ data }) => (
                    <text
                      x={data.cx}
                      y={data.cy - 110 + data.id * 30}
                      textAnchor="middle"
                      fontWeight="bold"
                      fontSize="16"
                      fill={data.label === 'Profit' ? '#38a169' : '#dc2626'}
                    >
                      {data.label}
                    </text>
                  ),
                }]}
                width={300}
                height={300}
              />
            </div>
          </div>
        </div>
        {/* Part 2: Screener dropdown at top, Stocks in Screener below */}
        <div className="bg-white rounded-lg shadow p-6 min-w-[408px] max-w-[520px] flex flex-col items-center" style={{ color: '#2563eb', fontSize: '1.1em', border: '2px solid #222', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginTop : '10px',marginLeft: '90px', marginBottom: '10px'  }}>
          <h2 className="text-lg font-bold mb-2 text-center" style={{ color: '#2563eb', fontSize: '2em' }}>Screener</h2>
          <div className="w-full flex flex-col items-center mb-4" style={{ fontSize: '1.1em' }}>
            <label htmlFor="screener-dropdown" className="font-medium mb-2 text-center" style={{ fontSize: '1.1em' }}>Select Screener:</label>
            <select
              id="screener-dropdown"
              className="select select-bordered w-full max-w-[220px]"
              style={{ fontSize: '1.1em', backgroundColor: 'white', color: '#2563eb' }}
              value={selectedScreener}
              onChange={e => { setSelectedScreener(e.target.value); setStocksPage(1); }}
            >
              <option value="" style={{ fontSize: '1.1em' }}>Select Screener</option>
              {screeners.length === 0 && <option value="" disabled style={{ fontSize: '1.1em' }}>No screeners available</option>}
              {screeners.map((screener) => (
                <option key={screener.id || screener.screener_name} value={screener.screener_name} style={{ fontSize: '1.1em' }}>
                  {screener.screener_name}
                </option>
              ))}
            </select>
          </div>
          <h3 className="text-md font-semibold mb-2 text-center" style={{ fontSize: '1.8em' , marginBottom: '-1%'}}>Stocks in Screener</h3>
          {loadingStocks ? (
            <div className="text-center" style={{ fontSize: '1.1em' }}>Loading stocks...</div>
          ) : screenerStocks.length === 0 ? (
            <div className="text-gray-500 text-center" style={{ fontSize: '1.1em' }}>No stocks found for this screener.</div>
          ) : (
            <>
          <div className="flex justify-center" style={{ fontSize: '1.1em' }}>
            <table className="table" style={{
              marginLeft: '15px', marginRight: '15px', minWidth: '340px', maxWidth: '520px', marginTop: '15px', marginBottom: '15px',
              background: '#fff',
              border: '2px solid #222',
              borderRadius: 'px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontSize: '1.1em'
            }}>
              <thead>
                <tr style={{ background: '#fff', fontSize: '1.1em' }}>
                  <th style={{ width: '160px', padding: '8px 16px', fontSize: '1.15em', textAlign: 'center', borderBottom: '2px solid #222', borderTopLeftRadius: '12px' }}>Stock</th>
                  <th style={{ width: '120px', padding: '8px 16px', fontSize: '1.15em', textAlign: 'center', borderBottom: '2px solid #222', borderTopRightRadius: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.map((stock, idx) => (
                  <tr key={stock + idx} style={{ height: '40px', background: '#fff', borderBottom: '1px solid #222', fontSize: '1.1em' }}>
                    <td style={{ padding: '8px 16px', fontSize: '1.1em', textAlign: 'center', borderRight: '1px solid #222' }}>{stock}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'center', fontSize: '1.1em' }}>
                      <button className="btn btn-primary btn-sm" style={{ minWidth: '60px', fontSize: '1.1em', padding: '6px 12px',  backgroundColor: 'white', color: '#2563eb',  borderColor: '#2563eb'}} onClick={() => handleTradeStock(stock)}>
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div >
              {/* Pagination controls */}
              <div className="flex flex-col items-center mt-2" style={{ fontSize: '1.1em' }}>
                <div className="flex justify-center items-center mb-1" style={{ fontSize: '1.1em' }}>
                  <button className="btn btn-xs mr-2" style={{ fontSize: '1.1em', backgroundColor: 'white', color: '#2563eb', borderColor: '#2563eb' }} disabled={stocksPage === 1} onClick={() => setStocksPage(stocksPage - 1)}>Prev</button>
                  <span style={{ fontSize: '1.1em' , marginLeft: '2px'}}>Page {stocksPage} of {totalPages}</span>
                  <button className="btn btn-xs ml-2" style={{ fontSize: '1.1em', backgroundColor: 'white', color: '#2563eb', borderColor: '#2563eb' }} disabled={stocksPage === totalPages} onClick={() => setStocksPage(stocksPage + 1)}>Next</button>
                </div>
                <div className="text-sm text-gray-600" style={{ fontSize: '1.1em' }}>Total stocks: {screenerStocks.length}</div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-full max-w-full mx-auto space-y-8" style={{ maxWidth: 'calc(100vw - 40px)' }}>
        {/* --- Trade Table Section --- */}
        <div className="bg-white rounded-lg shadow p-6" style={{ color: '#2563eb', border: '2px solid #222', borderRadius: '12px', marginLeft: '21px', maxWidth: 'calc(100vw - 60px)', overflow: 'hidden' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#2563eb' }}>Trade Entries</h2>
            <button 
              className="btn" 
              onClick={handleAddRow}
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
              Add Trade Entry
            </button>
          </div>
          {/* Main trade entries table */}
          <div className="overflow-x-auto" style={{ maxWidth: '100%', overflowX: 'auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch', marginLeft: '10px', marginRight: '10px', marginBottom: '15px', maxHeight: '480px', border: '1px solid #e5e7eb', scrollbarWidth: 'thin', scrollbarColor: '#2563eb #e5e7eb' }}>
            <table className="table min-w-[1200px] w-full" style={{ background: '#fff', border: '2px solid #222', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontSize: '1.1em' }}>
              <thead>
                <tr style={{ background: '#fff' }}>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>#</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Stock</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>CMP</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>SLP</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>TGTP</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>SL</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>TGT</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>STB-SL</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>STB-IPT</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>STB</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>SB</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Invested</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>RSI</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Candle</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Volume</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>P/L</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Entry</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Exit</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Booked</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>r:R</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Tenure</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Remarks</th>
                  <th style={{ borderBottom: '2px solid #222', fontSize: '1.16em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, idx) => (
                  <tr key={idx} style={{ background: '#fff', borderBottom: '1px solid #222', fontSize: '1.1em', margin: '5px', textAlign: 'center' }}>
                    {/* Trade row fields and actions */}
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{idx + 1}</td>
                  <td><input className="input input-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em', minWidth: '100px' }} value={row.stock ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, stock: e.target.value });
                      setEntries(updated);
                    }} /></td>
                  <td><input className="input input-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em' , minWidth: '50px'}} type="number" value={row.cmp ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, cmp: e.target.value });
                      setEntries(updated);
                    }} /></td>
                  <td><input className="input input-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em' , minWidth: '50px' }} type="number" value={row.slp ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, slp: e.target.value });
                      setEntries(updated);
                    }} /></td>
                  <td><input className="input input-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em' , minWidth: '50px'}} type="number" value={row.tgtp ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, tgtp: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.sl}</td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.tgt}</td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.stb_sl}</td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.stb_ipt}</td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.stb}</td>
                  <td><input className="input input-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em' , minWidth: '50px'}} type="number" value={row.sb ?? ""} onChange={e => {
                      let val = Number(e.target.value);
                      if (val > row.stb) {
                        alert('SB cannot be greater than STB. Value will be reset to 0.');
                        val = 0;
                      }
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, sb: val });
                      setEntries(updated);
                    }} /></td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.invested}</td>
                  <td><select className="select select-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em', minWidth: '100px' }} value={row.rsi ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, rsi: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select></td>
                  <td><select className="select select-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em', minWidth: '140px' }} value={row.candle ?? ""} onChange={e => {
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
                  <td><select className="select select-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em', minWidth: '100px' }} value={row.volume ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, volume: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select></td>
                  <td><select className="select select-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em', minWidth: '110px' }} value={row.pl ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, pl: e.target.value });
                      setEntries(updated);
                    }}>
                      <option value="">Select</option>
                      <option value="Profit">Profit</option>
                      <option value="Loss">Loss</option>
                    </select></td>
                  <td>
                    <DatePicker
                      value={row.entry_date ? dayjs(row.entry_date) : null}
                      onChange={(newValue) => {
                        const updated = [...entries];
                        updated[idx] = computeRow({ ...row, entry_date: newValue ? newValue.format('YYYY-MM-DD') : '' });
                        setEntries(updated);
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          style: { 
                            background: '#fff', 
                            border: '1px solid #222', 
                            borderRadius: '8px',
                            minWidth: '100px'
                          },
                          InputProps: {
                            style: {
                              color: '#2563eb',
                              fontSize: '1.089em',
                              padding: '1px 1px',
                              marginRight: '2px',
                              marginLeft: '5px'
                            }
                          }
                        }
                      }}
                    />
                  </td>
                  <td>
                    <DatePicker
                      value={row.exit_date ? dayjs(row.exit_date) : null}
                      onChange={(newValue) => {
                        const updated = [...entries];
                        updated[idx] = computeRow({ ...row, exit_date: newValue ? newValue.format('YYYY-MM-DD') : '' });
                        setEntries(updated);
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          style: { 
                            background: '#fff', 
                            border: '1px solid #222', 
                            borderRadius: '8px',
                            minWidth: '100px'
                          },
                          InputProps: {
                            style: {
                              color: '#2563eb',
                              fontSize: '1.089em',
                              padding: '1px 1px',
                              marginRight: '2px',
                              marginLeft: '5px'
                            }
                          }
                        }
                      }}
                    />
                  </td>
                    <td style={{ color: Number(row.booked) > 0 ? '#38a169' : Number(row.booked) < 0 ? 'red' : undefined , fontSize: '1.13em', alignItems: 'center', minWidth: '50px'}}>
                      {row.booked}
                    </td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{row.rr}</td>
                    <td style={{ color: '#2563eb', fontSize: '1.13em', alignItems: 'center', minWidth: '50px' }}>{getTenure(row.entry_date, row.exit_date)}</td>
                  <td><input className="input input-bordered w-full" style={{ background: '#fff', border: '1px solid #222', color: '#2563eb', fontSize: '1.13em' }} value={row.remarks ?? ""} onChange={e => {
                      const updated = [...entries];
                      updated[idx] = computeRow({ ...row, remarks: e.target.value });
                      setEntries(updated);
                    }} /></td>
                    <td>
                      {/* Arrange Save/Buy and Delete icons horizontally using flex */}
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        {/* {(row.id && typeof row.id === 'number') ?  */}
                        {(!row.id && typeof row.id !== 'number') ? 
                        (
                          <button 
                            className="btn btn-xs" 
                            onClick={() => handleBuyRow(row, idx)}
                            style={{
                              background: '#e3f0ff',
                              color: '#2563eb',
                              fontWeight: 700,
                              fontSize: '0.85em',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '6px 12px',
                              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                          >
                            Buy
                          </button>
                        )
                        : (<></>)
                        // (
                        //   <button 
                        //     className="btn btn-xs" 
                        //     onClick={() => handleBuyRow(row, idx)}
                        //     style={{
                        //       background: '#e3f0ff',
                        //       color: '#2563eb',
                        //       fontWeight: 700,
                        //       fontSize: '0.85em',
                        //       border: 'none',
                        //       borderRadius: '12px',
                        //       padding: '6px 12px',
                        //       boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                        //       cursor: 'pointer',
                        //       transition: 'background 0.2s',
                        //     }}
                        //   >
                        //     Buy
                        //   </button>
                        // )
                        }
                                                  <button 
                            className="btn btn-xs" 
                            onClick={() => handleSaveRow(row, idx)}
                            style={{
                              background: '#e3f0ff',
                              color: '#2563eb',
                              fontWeight: 700,
                              border: 'none',
                              borderRadius: '12px',
                              padding: '6px 8px',
                              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#e0f2fe" />
                              <path d="M6 3v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
                              <line x1="9" y1="15" x2="15" y2="15" />
                              <line x1="9" y1="19" x2="15" y2="19" />
                            </svg>
                          </button>
                        <button 
                          className="btn btn-xs" 
                          onClick={() => handleDeleteRow(row, idx)}
                          style={{
                            background: '#e3f0ff',
                            color: '#2563eb',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: '12px',
                            padding: '6px 8px',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                            <rect x="3" y="6" width="18" height="15" rx="2" fill="#e0f2fe" />
                            <path d="M9 10v6M15 10v6" stroke="#2563eb" />
                            <path d="M4 6h16" stroke="#2563eb" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#2563eb" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </LocalizationProvider>
  );
}
