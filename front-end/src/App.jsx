import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StocksPage from './pages/StocksPage';
import AnalysisPage from './pages/AnalysisPage';
import HowItWorksPage from './pages/HowItWorksPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />
        <main className="page-content">
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/stocks"        element={<StocksPage />} />
            <Route path="/stocks/:symbol" element={<AnalysisPage />} />
            <Route path="/how-it-works"  element={<HowItWorksPage />} />
            <Route path="*"              element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
