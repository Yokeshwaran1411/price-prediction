import { TrendingUp, AlertTriangle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-ticker-strip">
        <div className="ticker-track">
          {[
            { sym: 'RELIANCE', price: '₹2,450', chg: '+1.85%', up: true },
            { sym: 'TCS',      price: '₹3,820', chg: '-0.45%', up: false },
            { sym: 'INFY',     price: '₹1,485', chg: '+0.92%', up: true },
            { sym: 'HDFC',     price: '₹1,740', chg: '+2.30%', up: true },
            { sym: 'ICICIBANK',price: '₹1,092', chg: '-0.78%', up: false },
            { sym: 'WIPRO',    price: '₹523',   chg: '+1.12%', up: true },
            { sym: 'BHARTIARTL',price:'₹1,820', chg: '+0.63%', up: true },
            { sym: 'HCLTECH',  price: '₹1,670', chg: '-0.34%', up: false },
            /* duplicate for infinite scroll */
            { sym: 'RELIANCE', price: '₹2,450', chg: '+1.85%', up: true },
            { sym: 'TCS',      price: '₹3,820', chg: '-0.45%', up: false },
            { sym: 'INFY',     price: '₹1,485', chg: '+0.92%', up: true },
            { sym: 'HDFC',     price: '₹1,740', chg: '+2.30%', up: true },
            { sym: 'ICICIBANK',price: '₹1,092', chg: '-0.78%', up: false },
            { sym: 'WIPRO',    price: '₹523',   chg: '+1.12%', up: true },
            { sym: 'BHARTIARTL',price:'₹1,820', chg: '+0.63%', up: true },
            { sym: 'HCLTECH',  price: '₹1,670', chg: '-0.34%', up: false },
          ].map((s, i) => (
            <div key={i} className="ticker-item">
              <span className="ticker-sym">{s.sym}</span>
              <span className="ticker-price">{s.price}</span>
              <span className={`ticker-chg ${s.up ? 'up' : 'down'}`}>{s.chg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <TrendingUp size={20} strokeWidth={2.5} />
            StockGPT
          </div>
          <p className="footer-tagline">
            Predicting the future of Indian markets with StockGPT intelligence.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h5>Platform</h5>
            <a href="/">Home</a>
            <a href="/stocks">Markets</a>
            <a href="/how-it-works">How It Works</a>
          </div>
          <div className="footer-col">
            <h5>Info</h5>
            <a href="#">Disclaimer</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 StockGPT. All rights reserved.</span>
        <span className="footer-disclaimer">
          <AlertTriangle size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          AI predictions are not financial advice. Trade responsibly.
        </span>
      </div>
    </footer>
  );
}
