import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Flame, Globe, SearchX } from 'lucide-react';
import './StocksPage.css';

const API = 'http://localhost:3000/api';

const TRENDING = [
  { sym: 'RELIANCE', chg: '+1.85%', up: true },
  { sym: 'TCS',      chg: '-0.45%', up: false },
  { sym: 'INFY',     chg: '+0.92%', up: true },
  { sym: 'HDFC',     chg: '+2.30%', up: true },
  { sym: 'ICICIBANK',chg: '-0.78%', up: false },
  { sym: 'WIPRO',    chg: '+1.12%', up: true },
];

const EXCHANGES = ['All', 'NSE', 'BSE'];

// Deterministic price from symbol string
function seedPrice(sym) {
  let n = 0;
  for (let i = 0; i < sym.length; i++) n += sym.charCodeAt(i);
  return ((n * 137) % 3800) + 80;
}

function seedChange(sym) {
  let n = 0;
  for (let i = 0; i < sym.length; i++) n += sym.charCodeAt(i);
  const raw = ((n * 31) % 800) / 100 - 4;
  return raw;
}

export default function StocksPage() {
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [exchange, setExchange] = useState('All');
  const [stocks, setStocks]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const limit = 24;

  const fetchStocks = useCallback(async (q, exch, pg) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      params.set('limit', limit * pg);
      const res  = await fetch(`${API}/stocks?${params}`);
      let data = await res.json();
      if (exch !== 'All') data = data.filter(s => s.exchange === exch);
      setStocks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchStocks(query, exchange, 1); }, 250);
    return () => clearTimeout(t);
  }, [query, exchange, fetchStocks]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchStocks(query, exchange, next);
  };

  return (
    <div className="stocks-page">
      <div className="container">

        {/* Page header */}
        <div className="stocks-page-header anim-fade-up">
          <h1><Globe size={32} strokeWidth={1.8} className="page-title-icon" /> Indian Stock Markets</h1>
          <p>Search from 6,200+ NSE and BSE equities. Click any stock to run an AI-powered prediction report.</p>
        </div>

        {/* Search + Filters */}
        <div className="stocks-search-section">
          <div className="search-container">
            <div className="search-input-wrap">
              <span className="search-icon"><Search size={18} strokeWidth={2} /></span>
              <input
                type="text"
                placeholder="Search by symbol or company name…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button className="clear-search" onClick={() => setQuery('')}>
                  <X size={18} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-chips">
            {EXCHANGES.map(ex => (
              <button
                key={ex}
                className={`filter-chip ${exchange === ex ? 'active' : ''}`}
                onClick={() => setExchange(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Trending quick-select (only when not searching) */}
        {!query && (
          <div className="trending-row anim-fade-up">
            <div className="trending-row-label">
              <Flame size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Trending Today
            </div>
            <div className="trending-pills">
              {TRENDING.map(t => (
                <button
                  key={t.sym}
                  className="trending-pill"
                  onClick={() => navigate(`/stocks/${t.sym}`)}
                >
                  <span className="trending-pill-sym">{t.sym}</span>
                  <span className={`trending-pill-chg ${t.up ? 'up' : 'down'}`}>{t.chg}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results meta */}
        {!loading && (
          <div className="results-meta">
            <p className="results-count">
              Showing <strong>{stocks.length}</strong> stocks
              {query ? ` matching "${query}"` : ''}
              {exchange !== 'All' ? ` on ${exchange}` : ''}
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="stocks-grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="stock-card-skeleton">
                  <div className="skeleton" style={{ height: 18, width: '60%' }} />
                  <div className="skeleton" style={{ height: 13, width: '80%' }} />
                  <div className="skeleton" style={{ height: 24, width: '45%', marginTop: 8 }} />
                </div>
              ))
            : stocks.length === 0
            ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><SearchX size={48} strokeWidth={1.2} /></div>
                  <h3>No stocks found</h3>
                  <p>Try a different search term or remove the exchange filter.</p>
                </div>
              )
            : stocks.map((s, idx) => {
                const price  = seedPrice(s.symbol);
                const chgNum = seedChange(s.symbol);
                const chgStr = (chgNum >= 0 ? '+' : '') + chgNum.toFixed(2) + '%';
                const up     = chgNum >= 0;
                return (
                  <div
                    key={s.id}
                    className="stock-card anim-fade-up"
                    style={{ animationDelay: `${(idx % 12) * 0.04}s` }}
                    onClick={() => navigate(`/stocks/${s.symbol}`, { state: { stock: s, price, chgNum } })}
                  >
                    <div className="stock-card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="stock-card-sym">{s.symbol}</span>
                      </div>
                      <span className="stock-card-exchange">{s.exchange}</span>
                    </div>
                    <div className="stock-card-name">{s.name}</div>
                    <div className="stock-card-bottom">
                      <div>
                        <div className="stock-card-price">₹{price.toFixed(2)}</div>
                        <div className="stock-card-sub">Today's Est. Price</div>
                      </div>
                      <div className="stock-card-chg">
                        <span className={`chg-pill ${up ? 'up' : 'down'}`}>{chgStr}</span>
                        <span className="analyze-hint">Click to analyze →</span>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>

        {/* Load more */}
        {!loading && stocks.length >= limit * page && (
          <div className="load-more-wrap">
            <button className="btn btn-secondary" onClick={handleLoadMore}>
              Load More Stocks
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
