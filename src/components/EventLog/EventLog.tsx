import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { EventType, EconomicEvent } from '@shared/index';
import { ScrollText, TrendingUp, TrendingDown, Briefcase, CreditCard, Home, Smile, Frown, AlertTriangle, Zap, DollarSign, BarChart3, Filter } from 'lucide-react';
import './EventLog.css';

const eventTypeConfig: Record<EventType, { icon: React.ReactNode; label: string }> = {
  income_change: { icon: <DollarSign className="w-3.5 h-3.5" />, label: '收入变动' },
  job_change: { icon: <Briefcase className="w-3.5 h-3.5" />, label: '就业变动' },
  debt_change: { icon: <CreditCard className="w-3.5 h-3.5" />, label: '债务变动' },
  asset_purchase: { icon: <Home className="w-3.5 h-3.5" />, label: '资产购买' },
  asset_sale: { icon: <Home className="w-3.5 h-3.5" />, label: '资产出售' },
  mood_change: { icon: <Smile className="w-3.5 h-3.5" />, label: '情绪变动' },
  bankruptcy: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: '债务违约' },
  investment_gain: { icon: <TrendingUp className="w-3.5 h-3.5" />, label: '投资获利' },
  investment_loss: { icon: <TrendingDown className="w-3.5 h-3.5" />, label: '投资亏损' },
  economic_boom: { icon: <Zap className="w-3.5 h-3.5" />, label: '经济繁荣' },
  economic_recession: { icon: <TrendingDown className="w-3.5 h-3.5" />, label: '经济衰退' },
  policy_change: { icon: <BarChart3 className="w-3.5 h-3.5" />, label: '政策变动' },
  inflation_warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: '通胀预警' },
  deflation_warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: '通缩预警' },
};

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'positive', label: '正面' },
  { value: 'negative', label: '负面' },
  { value: 'neutral', label: '中性' },
] as const;

export function EventLog() {
  const events = useGameStore(state => state.events);
  const setSelectedEntity = useGameStore(state => state.setSelectedEntity);
  const state = useGameStore(state => state.state);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(e => e.impact === filter);
  }, [events, filter]);

  const handleEventClick = (event: EconomicEvent) => {
    if (event.entityId && state) {
      const entity = state.entities.find(e => e.id === event.entityId);
      if (entity) {
        setSelectedEntity(entity);
      }
    }
  };

  const getImpactColor = (impact?: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-emerald-400';
      case 'negative': return 'text-rose-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactBorder = (impact?: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'impact-positive';
      case 'negative': return 'impact-negative';
      default: return 'impact-neutral';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="event-log h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-orange-400" />
          <h2 
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
          >
            📜 经济事件
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-800 text-xs text-gray-400 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-orange-500"
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2 flex-shrink-0">
        共 {filteredEvents.length} 条事件记录
      </div>

      <div className="event-list flex-1 min-h-0 space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">暂无经济事件</p>
              <p className="text-xs mt-1">开始模拟后将显示事件日志</p>
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const config = eventTypeConfig[event.type];
            return (
              <div
                key={event.id}
                className={`event-item p-2 rounded-lg border-l-2 ${getImpactBorder(event.impact)} bg-slate-800/30 cursor-pointer transition-all`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className={`flex-shrink-0 mt-0.5 ${getImpactColor(event.impact)}`}>
                      {config.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white truncate">
                          {event.title}
                        </span>
                        <span className="text-xs text-gray-600 flex-shrink-0">
                          D{event.day}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {event.description}
                      </p>
                      {event.entityName && (
                        <p className="text-xs text-orange-400/70 mt-1">
                          涉及: {event.entityName}
                        </p>
                      )}
                      {event.amount !== undefined && (
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          金额: ¥{event.amount.toFixed(0).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
