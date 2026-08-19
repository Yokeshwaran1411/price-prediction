import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, RefreshCw, Radio, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import './AnalysisPage.css';

const API = 'http://localhost:3000/api';

/* ── Lightweight markdown renderer ── */
function isTableRow(line) {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function isSeparatorRow(line) {
  return /^\|[\s\-:|]+\|/.test(line.trim());
}

function parseTableRow(line) {
  return line.trim().slice(1, -1).split('|').map(cell => cell.trim());
}

function renderMd(text) {
  if (!text) return null;

  // Pre-group lines into blocks so tables can span multiple lines
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    if (isTableRow(lines[i])) {
      const tableLines = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
    } else {
      blocks.push({ type: 'line', value: lines[i] });
      i++;
    }
  }

  return blocks.map((block, bi) => {
    if (block.type === 'table') {
      const rows = block.lines.filter(l => !isSeparatorRow(l));
      const [headerRow, ...bodyRows] = rows;
      const headers = parseTableRow(headerRow);
      return (
        <div key={bi} className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi}>{inlineMd(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {parseTableRow(row).map((cell, ci) => (
                    <td key={ci}>{inlineMd(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Regular line rendering
    const line = block.value;
    const trimmed = line.trim();
    if (trimmed === '---' || trimmed === '***')
      return <hr key={bi} className="md-hr" />;

    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const Tag = `h${level}`;
      return <Tag key={bi}>{inlineMd(headerMatch[2])}</Tag>;
    }

    if (line.startsWith('- ') || line.startsWith('* '))
      return <ul key={bi}><li>{inlineMd(line.slice(2))}</li></ul>;

    const num = line.match(/^(\d+)\.\s(.*)/);
    if (num) return <ol key={bi} start={+num[1]}><li>{inlineMd(num[2])}</li></ol>;
    if (!trimmed) return <div key={bi} className="md-gap" />;
    return <p key={bi}>{inlineMd(line)}</p>;
  });
}

function inlineMd(text) {
  if (!text) return '';
  let parts = [text];
  
  // Parse bold **
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part;
    const subParts = [];
    const re = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;
    while ((match = re.exec(part)) !== null) {
      if (match.index > lastIndex) {
        subParts.push(part.slice(lastIndex, match.index));
      }
      subParts.push(<strong key={`b-${match.index}`}>{match[1]}</strong>);
      lastIndex = re.lastIndex;
    }
    if (lastIndex < part.length) {
      subParts.push(part.slice(lastIndex));
    }
    return subParts;
  });

  // Parse italic *
  parts = parts.flatMap((part, idx) => {
    if (typeof part !== 'string') return part;
    const subParts = [];
    const re = /\*(.*?)\*/g;
    let match;
    let lastIndex = 0;
    while ((match = re.exec(part)) !== null) {
      if (match.index > lastIndex) {
        subParts.push(part.slice(lastIndex, match.index));
      }
      subParts.push(<em key={`i-${idx}-${match.index}`}>{match[1]}</em>);
      lastIndex = re.lastIndex;
    }
    if (lastIndex < part.length) {
      subParts.push(part.slice(lastIndex));
    }
    return subParts;
  });

  return parts;
}

/* ── Deterministic helpers ── */
function seedNum(sym, mult, mod, offset = 0) {
  let n = 0;
  for (let i = 0; i < sym.length; i++) n += sym.charCodeAt(i);
  return ((n * mult) % mod) + offset;
}

export default function AnalysisPage() {
  const { symbol } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const passed   = location.state || {};
  const initialBasePrice = passed.price || seedNum(symbol, 137, 3800, 80);
  const initialChgNum    = passed.chgNum != null ? passed.chgNum : (seedNum(symbol, 31, 800, 0) / 100 - 4);
  const stock     = passed.stock || { symbol, name: symbol, exchange: 'NSE' };

  const [livePrice, setLivePrice] = useState(initialBasePrice);
  const [liveChg, setLiveChg] = useState(initialChgNum);
  const [prevPrice, setPrevPrice] = useState(initialBasePrice);
  const [flash, setFlash] = useState(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  const chgStr    = (liveChg >= 0 ? '+' : '') + liveChg.toFixed(2) + '%';
  const isUp      = liveChg >= 0;

  const volume    = seedNum(symbol, 311, 8000000, 400000);
  const high      = (livePrice * 1.015).toFixed(2);
  const low       = (livePrice * 0.985).toFixed(2);
  const pe        = seedNum(symbol, 53, 3000, 1000) / 100;
  const wkHigh    = (livePrice * 1.25).toFixed(2);
  const wkLow     = (livePrice * 0.75).toFixed(2);

  // Live ticking simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const changePercent = (Math.random() - 0.5) * 0.002; // +/- 0.1%
      setLivePrice(prev => {
        const nextPrice = Math.max(10, prev * (1 + changePercent));
        setPrevPrice(prev);
        setFlash(nextPrice > prev ? 'up' : 'down');
        return nextPrice;
      });
      setLiveChg(prev => prev + (changePercent * 100));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`${API}/stocks/${symbol}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         stock.name,
          currentPrice: livePrice.toFixed(2),
          change:       chgStr,
          volume,
        }),
      });
      if (!r.ok) throw new Error('API returned ' + r.status);
      const data = await r.json();
      setResult(data.analysis);
    } catch (e) {
      setError('Could not connect to the AI engine. Please ensure the backend server is running on port 3000.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="analysis-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-link" onClick={() => navigate('/stocks')}>Markets</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{symbol}</span>
        </div>

        {/* Stock hero */}
        <div className="stock-hero anim-fade-up">
          <div className="stock-hero-left">
            <div>
              <div className="stock-exch-badge">{stock.exchange || 'NSE / BSE'}</div>
              <div className="stock-hero-sym">{symbol}</div>
              <div className="stock-hero-name">{stock.name}</div>
            </div>

            {/* Key Metrics Row */}
            <div className="hero-metrics-grid">
              {[
                { label: "Today's High",    value: `₹${high}` },
                { label: "Today's Low",     value: `₹${low}` },
                { label: '52W High',        value: `₹${wkHigh}` },
                { label: '52W Low',         value: `₹${wkLow}` },
                { label: 'Volume',          value: `${(volume / 100000).toFixed(1)}L` },
                { label: 'P/E Ratio',       value: pe.toFixed(1) },
                { label: 'Market Cap',      value: `₹${(livePrice * seedNum(symbol,17,100,10) * 1e4 / 1e9).toFixed(0)}B` },
                { label: 'Avg Volume',      value: `${((volume * 0.9) / 100000).toFixed(1)}L` },
              ].map(m => (
                <div key={m.label} className="hero-metric-item">
                  <span className="hero-metric-label">{m.label}</span>
                  <span className="hero-metric-value">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stock-hero-right">
            <div className={`stock-hero-price ${flash ? `flash-${flash}` : ''}`} key={livePrice}>
              ₹{livePrice.toFixed(2)}
            </div>
            <div className="stock-hero-chg-row">
              <span className={`stock-hero-chg ${isUp ? 'up' : 'down'}`}>{chgStr}</span>
              <span className="stock-hero-arrow">
                {isUp
                  ? <TrendingUp size={16} strokeWidth={2} />
                  : <TrendingDown size={16} strokeWidth={2} />
                }
              </span>
            </div>
          </div>
        </div>

        {/* Full-width analysis layout */}
        <div className="analysis-layout-full">

          {/* AI Panel */}
          <div className="analysis-panel anim-fade-up">
            <div className="analysis-panel-header">
              <h3>
                <Bot size={18} strokeWidth={2} />
                StockGPT Analysis Report
              </h3>
              <span className="badge badge-violet">AI</span>
            </div>

            <div className="analysis-panel-body">
              {/* Analyzing */}
              {analyzing && (
                <div className="ai-loading">
                  <div className="ai-loading-orb" />
                  <h4>Consulting AI Engine…</h4>
                  <p>Analyzing market sentiment, technical indicators, and predictive signals for {symbol}.</p>
                </div>
              )}

              {/* Error */}
              {error && !analyzing && (
                <div className="ai-error">
                  <span className="ai-error-icon"><AlertTriangle size={20} strokeWidth={2} /></span>
                  <p>{error}</p>
                </div>
              )}

              {/* Placeholder */}
              {!analyzing && !result && !error && (
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon"><Radio size={48} strokeWidth={1.2} /></div>
                  <h4>AI Engine Ready</h4>
                  <p>Click "Generate AI Prediction Report" to start your analysis.</p>
                </div>
              )}

              {/* Result */}
              {result && !analyzing && (
                <div className="analysis-output">
                  {renderMd(result)}
                </div>
              )}
            </div>

            {/* Close & Re-Generate Buttons at the Bottom */}
            {result && !analyzing && (
              <div className="analysis-panel-footer">
                <button className="btn-close" onClick={() => setResult(null)}>
                  Close
                </button>
                <button className="btn-regenerate" onClick={runAnalysis}>
                  <RefreshCw size={14} />
                  Re-Generate
                </button>
              </div>
            )}
          </div>

          {/* Trigger Card (Shown when not generated yet) */}
          {!result && !analyzing && (
            <div className="trigger-card anim-fade-up" style={{ marginTop: '20px' }}>
              <div className="trigger-card-icon">
                <Bot size={36} strokeWidth={1.5} />
              </div>
              <h3>StockGPT AI Prediction</h3>
              <p>
                Get an institutional-grade analysis report for <strong>{symbol}</strong> — including market sentiment, price direction forecast, technical indicators, and risk factors.
              </p>
              <button className="trigger-btn" onClick={runAnalysis}>
                <Sparkles size={16} strokeWidth={2} />
                Generate AI Prediction Report
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
