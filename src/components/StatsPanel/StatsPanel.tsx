import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, ShoppingCart } from 'lucide-react';
import './StatsPanel.css';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, change, icon, color, bgColor }: StatCardProps) {
  const getChangeIndicator = () => {
    if (change > 0.1) {
      return (
        <span className="flex items-center gap-1 text-emerald-400 animate-pulse">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">+{change.toFixed(2)}%</span>
        </span>
      );
    } else if (change < -0.1) {
      return (
        <span className="flex items-center gap-1 text-rose-400 animate-pulse">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm">{change.toFixed(2)}%</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-gray-400">
        <Minus className="w-4 h-4" />
        <span className="text-sm">0.00%</span>
      </span>
    );
  };

  return (
    <div 
      className={`stat-card relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${bgColor} ${color}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('-400', '-500/20')}`}>
          {icon}
        </span>
        {getChangeIndicator()}
      </div>
      
      <h3 className="text-xs text-gray-400 mb-1 font-medium">{title}</h3>
      <p 
        className="text-2xl font-bold text-white tabular-nums"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        {value}
      </p>
      
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      </div>
    </div>
  );
}

export function StatsPanel() {
  const state = useGameStore(state => state.state);
  const stats = state?.stats;

  const formattedStats = useMemo(() => {
    if (!stats) return null;

    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(2)}M`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toFixed(0);
    };

    return [
      {
        title: 'GDP 总值',
        value: `¥${formatNumber(stats.gdp)}`,
        change: stats.gdpChange,
        icon: <DollarSign className="w-5 h-5 text-amber-400" />,
        color: 'text-amber-400',
        bgColor: 'bg-slate-800/50 border-amber-500/30',
      },
      {
        title: '失业率',
        value: `${(stats.unemploymentRate * 100).toFixed(1)}%`,
        change: stats.unemploymentChange,
        icon: <Users className="w-5 h-5 text-rose-400" />,
        color: 'text-rose-400',
        bgColor: 'bg-slate-800/50 border-rose-500/30',
      },
      {
        title: '物价指数',
        value: stats.priceIndex.toFixed(1),
        change: stats.priceChange,
        icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />,
        color: 'text-cyan-400',
        bgColor: 'bg-slate-800/50 border-cyan-500/30',
      },
    ];
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <div className="grid grid-cols-3 gap-4">
        {formattedStats?.map((stat, index) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="text-xs text-gray-400 mb-1">人口总数</div>
          <div 
            className="text-lg font-bold text-white tabular-nums"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            {stats.totalPopulation} 人
          </div>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="text-xs text-gray-400 mb-1">就业人数</div>
          <div 
            className="text-lg font-bold text-emerald-400 tabular-nums"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            {stats.employedPopulation} 人
          </div>
        </div>
      </div>
    </div>
  );
}
