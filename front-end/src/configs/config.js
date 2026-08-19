import { Brain, BarChart2, Target } from 'lucide-react';

const Configs = {
    HERO_STOCKS: [
        {
            sym: 'RELIANCE',
            name: 'Reliance Industries Ltd.',
            price: '₹2,450.40',
            chg: '+1.85%',
            up: true
        },
        {
            sym: 'TCS',
            name: 'Tata Consultancy Services',
            price: '₹3,820.15',
            chg: '-0.45%',
            up: false
        },
        {
            sym: 'INFY',
            name: 'Infosys Limited',
            price: '₹1,485.60',
            chg: '+0.92%',
            up: true
        },
        {
            sym: 'HDFC',
            name: 'HDFC Bank Ltd.',
            price: '₹1,740.00',
            chg: '+2.30%',
            up: true
        }
    ],

    FEATURES: [
        {
            icon: Brain,
            color: 'violet',
            title: 'AI-Powered Analysis',
            desc: 'Every stock is analyzed using state-of-the-art language models, giving you institutional-grade insights in seconds, not hours.'
        },
        {
            icon: BarChart2,
            color: 'cyan',
            title: 'Live Market Data',
            desc: 'Access 6,000+ NSE and BSE listed equities with real-time price simulations, volume data, and technical indicators.'
        },
        {
            icon: Target,
            color: 'green',
            title: 'Price Prediction Engine',
            desc: 'Get short-term directional forecasts with a clear bullish/bearish/neutral sentiment rating and key risk factors to watch.'
        }
    ],

    STATS: [
        {
            num: '6,200+',
            label: 'Indian Equities Covered'
        },
        {
            num: 'NSE + BSE',
            label: 'Exchanges Tracked'
        },
        {
            num: 'AI Engine',
            label: 'Prediction Engine'
        },
        {
            num: '< 5s',
            label: 'Analysis Time'
        }
    ]
};

export default Configs;