import { useNavigate } from 'react-router-dom';
import { Brain, BarChart2, Target, Rocket, ArrowRight, ChevronDown } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import './HomePage.css';

const HERO_STOCKS = [
  { sym: 'RELIANCE', name: 'Reliance Industries Ltd.', price: '₹2,450.40', chg: '+1.85%', up: true },
  { sym: 'TCS',      name: 'Tata Consultancy Services', price: '₹3,820.15', chg: '-0.45%', up: false },
  { sym: 'INFY',     name: 'Infosys Limited',           price: '₹1,485.60', chg: '+0.92%', up: true },
  { sym: 'HDFC',     name: 'HDFC Bank Ltd.',            price: '₹1,740.00', chg: '+2.30%', up: true },
];

const FEATURES = [
  {
    icon: Brain, color: 'violet',
    title: 'AI-Powered Analysis',
    desc: 'Every stock is analyzed using state-of-the-art language models, giving you institutional-grade insights in seconds, not hours.',
  },
  {
    icon: BarChart2, color: 'cyan',
    title: 'Live Market Data',
    desc: 'Access 6,000+ NSE and BSE listed equities with real-time price simulations, volume data, and technical indicators.',
  },
  {
    icon: Target, color: 'green',
    title: 'Price Prediction Engine',
    desc: 'Get short-term directional forecasts with a clear bullish/bearish/neutral sentiment rating and key risk factors to watch.',
  },
];

const STATS = [
  { num: '6,200+', label: 'Indian Equities Covered' },
  { num: 'NSE + BSE', label: 'Exchanges Tracked' },
  { num: 'AI Engine', label: 'Prediction Engine' },
  { num: '< 5s', label: 'Analysis Time' },
];

function StatItem({ num, label, delay }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`stat-item${inView ? ' is-visible' : ''}`} style={{ transitionDelay: delay }}>
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FeatureCard({ feature, delay }) {
  const [ref, inView] = useInView();
  const Icon = feature.icon;
  return (
    <div ref={ref} className={`feature-card${inView ? ' is-visible' : ''}`} style={{ transitionDelay: delay }}>
      <div className={`feature-icon ${feature.color}`}>
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-desc">{feature.desc}</p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [featRef, featInView] = useInView();

  return (
    <div>
      <section className="home-hero">
        <div className="hero-grid-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', width: '100%' }}>
          <div className="hero-content anim-fade-up">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered Stock Intelligence
            </div>
            <h1 className="hero-title">
              <span className="hero-title-grad">Predict the</span>
              <br />
              <span className="hero-title-grad">Future of</span>
              <br />
              <span className="hero-title-grad">Indian Markets</span>
            </h1>
            <p className="hero-sub">
              StockGPT combines real-time market data with advanced machine learning intelligence to deliver professional-grade stock analysis and price predictions at the click of a button.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/stocks')}>
                <Rocket size={16} strokeWidth={2} />
                Explore Markets
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/how-it-works')}>
                Learn How It Works
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card-stack">
              {HERO_STOCKS.map((s, i) => (
                <div
                  key={s.sym}
                  className="hero-stock-card anim-slide-right"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                  onClick={() => navigate(`/stocks/${s.sym}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="hero-stock-info">
                      <span className="hero-stock-sym">{s.sym}</span>
                      <span className="hero-stock-name">{s.name}</span>
                    </div>
                  </div>
                  <div className="hero-stock-right">
                    <div className="hero-stock-price">{s.price}</div>
                    <span className={`hero-stock-chg ${s.up ? 'up' : 'down'}`}>{s.chg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <div className="scroll-arrow"><ChevronDown size={14} /></div>
          scroll
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="container">
        <div className="stats-row">
          {STATS.map((s, i) => (
            <StatItem key={s.label} num={s.num} label={s.label} delay={`${i * 0.08}s`} />
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="container">
          <div ref={featRef} className={`features-header${featInView ? ' is-visible' : ''}`}>
            <div className="section-label">Why StockGPT</div>
            <h2 className="features-title">Everything you need to predict smarter</h2>
            <p className="features-sub">From raw data to AI synthesis — all the tools you need in one clean platform.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={`${i * 0.1}s`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to predict the market?</h2>
            <p className="cta-sub">Select any stock from 6,200+ Indian equities and get instant AI analysis.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/stocks')}>
              <Target size={16} strokeWidth={2} />
              Browse All Stocks
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
