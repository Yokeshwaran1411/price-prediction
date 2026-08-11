import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, RefreshCw, Radio, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import './AnalysisPage.css';

const API = 'http://localhost:3000/api';

/* ── Lightweight markdown renderer ── */
function renderMd(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i}>{inlineMd(line.slice(4))}</h3>;
    if (line.startsWith('## '))  return <h2 key={i}>{inlineMd(line.slice(3))}</h2>;
    if (line.startsWith('# '))   return <h1 key={i}>{inlineMd(line.slice(2))}</h1>;
    if (line.startsWith('- ') || line.startsWith('* '))
      return <ul key={i}><li>{inlineMd(line.slice(2))}</li></ul>;
    const num = line.match(/^(\d+)\.\s(.*)/);
    if (num) return <ol key={i} start={+num[1]}><li>{inlineMd(num[2])}</li></ol>;
    if (!line.trim()) return <div key={i} className="md-gap" />;
    return <p key={i}>{inlineMd(line)}</p>;
  });
}

function inlineMd(text) {
  const parts = [];
  let i = 0;
  const re = /\*\*(.*?)\*\*/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) parts.push(text.slice(i, m.index));
    parts.push(<strong key={m.index}>{m[1]}</strong>);
    i = re.lastIndex;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts.length ? parts : text;
}

/* ── Deterministic helpers ── */
function seedNum(sym, mult, mod, offset = 0) {
  let n = 0;
  for (let i = 0; i < sym.length; i++) n += sym.charCodeAt(i);
  return ((n * mult) % mod) + offset;
}

function buildChartData(sym, basePrice, daysCount) {
  const pts = [];
  let p = basePrice;
  for (let d = daysCount; d >= 0; d--) {
    const s = sym + d;
    let h = 0;
    for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
    const delta = (((h * 73) % 200) / 100 - 1) * 0.015 * p;
    p += delta;
    pts.push({ day: d, price: parseFloat(p.toFixed(2)) });
  }
  return pts.reverse();
}

/* ── Interactive SVG chart with mouse tracking & tooltip ── */
function SparkChart({ data, color = '#7c3aed' }) {
  const svgRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const W = 580, H = 160, PAD = { t: 15, r: 15, b: 30, l: 15 };
  const prices = data.map(d => d.price);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;

  const toX = (i) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const toY = (p) => PAD.t + (1 - (p - minP) / rangeP) * (H - PAD.t - PAD.b);

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.price)}`).join(' ');
  const areaPath = linePath + ` L ${toX(data.length - 1)} ${H - PAD.b} L ${toX(0)} ${H - PAD.b} Z`;

  const lastX = toX(data.length - 1), lastY = toY(prices[prices.length - 1]);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    
    // Find closest index
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < data.length; i++) {
      const diff = Math.abs(toX(i) - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    
    setHoveredIdx(closestIdx);
    setHoverPos({
      x: toX(closestIdx),
      y: toY(data[closestIdx].price)
    });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className="chart-svg-container" style={{ position: 'relative' }}>
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`} 
        className="chart-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.15, 0.5, 0.85].map(r => (
          <line key={r}
            x1={PAD.l} y1={PAD.t + r * (H - PAD.t - PAD.b)}
            x2={W - PAD.r} y2={PAD.t + r * (H - PAD.t - PAD.b)}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#cg)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover vertical line */}
        {hoveredIdx !== null && (
          <line
            x1={hoverPos.x}
            y1={PAD.t}
            x2={hoverPos.x}
            y2={H - PAD.b}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}

        {/* Hover dot */}
        {hoveredIdx !== null && (
          <g>
            <circle cx={hoverPos.x} cy={hoverPos.y} r={6} fill={color} />
            <circle cx={hoverPos.x} cy={hoverPos.y} r={10} fill={color} opacity={0.3} />
          </g>
        )}

        {/* Current price dot (only if not hovering or if hovering on last index) */}
        {(hoveredIdx === null || hoveredIdx === data.length - 1) && (
          <g>
            <circle cx={lastX} cy={lastY} r={5} fill={color} />
            <circle cx={lastX} cy={lastY} r={9} fill={color} opacity={0.25} />
          </g>
        )}

        {/* X-Axis labels (start and end labels) */}
        <text x={PAD.l} y={H - 10} fill="var(--text-muted)" fontSize={10} textAnchor="start">
          {data.length} days ago
        </text>
        <text x={W - PAD.r} y={H - 10} fill="var(--text-muted)" fontSize={10} textAnchor="end">
          Today
        </text>
      </svg>

      {/* Tooltip Box */}
      {hoveredIdx !== null && (
        <div 
          className="chart-tooltip"
          style={{
            position: 'absolute',
            left: `${(hoverPos.x / W) * 100}%`,
            top: `${(hoverPos.y / H) * 100 - 32}%`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            padding: '6px 10px',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-card)',
            fontSize: '11px',
            color: 'var(--text-primary)'
          }}
        >
          <span style={{ fontWeight: 'bold' }}>₹{data[hoveredIdx].price.toFixed(2)}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
            {data[hoveredIdx].day === 0 ? 'Today' : `${data[hoveredIdx].day}d ago`}
          </span>
        </div>
      )}
    </div>
  );
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
  const [rangeTab,  setRangeTab]  = useState('2W');

  // Convert tab range into day count
  const daysCount = useMemo(() => {
    if (rangeTab === '1W') return 7;
    if (rangeTab === '2W') return 14;
    return 30; // '1M'
  }, [rangeTab]);

  // Generate historical data
  const baseHistory = useMemo(() => {
    return buildChartData(symbol, initialBasePrice, daysCount);
  }, [symbol, initialBasePrice, daysCount]);

  // Append live price update to the final element of chartData
  const chartData = useMemo(() => {
    const nextData = [...baseHistory];
    if (nextData.length > 0) {
      nextData[nextData.length - 1] = {
        ...nextData[nextData.length - 1],
        price: livePrice
      };
    }
    return nextData;
  }, [baseHistory, livePrice]);

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
          <div className="stock-hero-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div className="stock-exch-badge">{stock.exchange || 'NSE / BSE'}</div>
              <div className="stock-hero-sym">{symbol}</div>
              <div className="stock-hero-name">{stock.name}</div>
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

        {/* Two-column layout */}
        <div className="analysis-layout">

          {/* ── LEFT COLUMN ── */}
          <div className="left-col">

            {/* Chart */}
            <div className="chart-panel anim-fade-up">
              <div className="chart-panel-header">
                <span className="chart-panel-title">Price Trend</span>
                <div className="chart-range-tabs">
                  {['1W', '2W', '1M'].map(r => (
                    <button
                      key={r}
                      className={`chart-tab ${rangeTab === r ? 'active' : ''}`}
                      onClick={() => setRangeTab(r)}
                    >{r}</button>
                  ))}
                </div>
              </div>
              <div className="chart-svg-wrap">
                <SparkChart
                  data={chartData}
                  color={isUp ? '#10b981' : '#f43f5e'}
                />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-panel anim-fade-up">
              <div className="metrics-panel-title">Key Metrics</div>
              <div className="metrics-grid">
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
                  <div key={m.label} className="metric-item">
                    <span className="metric-label">{m.label}</span>
                    <span className="metric-value">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="right-col">

            {/* Trigger Card */}
            {!result && !analyzing && (
              <div className="trigger-card anim-fade-up">
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

            {/* AI Report Panel */}
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

                {/* Re-run button after result */}
                {result && !analyzing && (
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={runAnalysis}>
                      <RefreshCw size={13} strokeWidth={2} />
                      Re-run Analysis
                    </button>
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
            </div>

            {/* Re-trigger if result is shown */}
            {result && !analyzing && (
              <div className="trigger-card" style={{ textAlign: 'center', padding: '20px' }}>
                <button className="trigger-btn" onClick={runAnalysis}>
                  <Sparkles size={16} strokeWidth={2} />
                  Re-Generate Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
