import { useGameStore } from '@/store/gameStore';
import type { ResidentHistoryEntry } from '@shared/index';
import { X, Building2, ShoppingBag, User, Briefcase, Wallet, TrendingUp, Users, Heart, PiggyBank, CreditCard, Home, Smile, Frown, Meh, Activity, Building } from 'lucide-react';
import './EntityDetail.css';

export function EntityDetail() {
  const selectedEntity = useGameStore(state => state.selectedEntity);
  const setSelectedEntity = useGameStore(state => state.setSelectedEntity);

  if (!selectedEntity) {
    return (
      <div className="entity-detail h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">👆</div>
          <p className="text-sm">点击城市中的实体查看详情</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = () => {
    if (selectedEntity.type === 'enterprise') {
      return <Building2 className="w-6 h-6 text-purple-400" />;
    }
    if (selectedEntity.type === 'shop') {
      return <ShoppingBag className="w-6 h-6 text-amber-400" />;
    }
    if (selectedEntity.type === 'house') {
      return <Home className="w-6 h-6 text-violet-400" />;
    }
    return <User className="w-6 h-6 text-emerald-400" />;
  };

  const getTypeLabel = () => {
    if (selectedEntity.type === 'enterprise') return '企业';
    if (selectedEntity.type === 'shop') return '商店';
    if (selectedEntity.type === 'house') return '房屋';
    return '居民';
  };

  const getTypeColor = () => {
    if (selectedEntity.type === 'enterprise') return 'text-purple-400 border-purple-500/30';
    if (selectedEntity.type === 'shop') return 'text-amber-400 border-amber-500/30';
    if (selectedEntity.type === 'house') return 'text-violet-400 border-violet-500/30';
    return selectedEntity.employed ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30';
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 70) return <Smile className="w-4 h-4 text-emerald-400" />;
    if (mood >= 40) return <Meh className="w-4 h-4 text-amber-400" />;
    return <Frown className="w-4 h-4 text-rose-400" />;
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 80) return '非常开心';
    if (mood >= 60) return '心情不错';
    if (mood >= 40) return '一般般';
    if (mood >= 20) return '有点低落';
    return '非常沮丧';
  };

  const getHistoryChartData = (history: ResidentHistoryEntry[], key: keyof ResidentHistoryEntry) => {
    if (history.length === 0) return [];
    const values = history.map(h => h[key] as number);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    return values.map(v => ({
      value: v,
      height: ((v - min) / range) * 60 + 10,
    }));
  };

  const renderMiniChart = (history: ResidentHistoryEntry[], key: keyof ResidentHistoryEntry, color: string, label: string) => {
    const data = getHistoryChartData(history, key);
    if (data.length === 0) return null;
    
    return (
      <div className="mt-2">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="flex items-end gap-0.5 h-16">
          {data.map((d, i) => (
            <div
              key={i}
              className={`flex-1 ${color} rounded-t opacity-70 hover:opacity-100 transition-opacity`}
              style={{ height: `${d.height}%` }}
              title={`Day ${history[i].day}: ¥${d.value.toFixed(0)}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="entity-detail h-full flex flex-col animate-slideIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <div>
            <h3 className="text-lg font-bold text-white">{selectedEntity.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor()}`}>
              {getTypeLabel()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSelectedEntity(null)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {selectedEntity.type === 'resident' && (
          <>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Heart className="w-4 h-4" />
                人格类型
              </div>
              <div className={`text-lg font-bold ${selectedEntity.personality.color}`}>
                {selectedEntity.personality.label}
              </div>
              <p className="text-xs text-gray-500 mt-1">{selectedEntity.personality.description}</p>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Briefcase className="w-4 h-4" />
                就业状态
              </div>
              <div className={`text-lg font-bold ${selectedEntity.employed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedEntity.employed ? '✅ 已就业' : '❌ 失业中'}
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Wallet className="w-4 h-4" />
                财务状况
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 月收入
                  </span>
                  <span className="text-white font-mono">¥{selectedEntity.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <PiggyBank className="w-3 h-3" /> 储蓄
                  </span>
                  <span className="text-amber-400 font-mono">¥{selectedEntity.savings.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> 债务
                  </span>
                  <span className={`font-mono ${selectedEntity.debt > 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                    ¥{selectedEntity.debt.toFixed(0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Home className="w-3 h-3" /> 资产
                  </span>
                  <span className="text-purple-400 font-mono">¥{selectedEntity.assets.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-gray-400 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> 日消费
                  </span>
                  <span className="text-cyan-400 font-mono">¥{selectedEntity.consumption.toFixed(0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                {getMoodIcon(selectedEntity.mood)}
                情绪指数
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedEntity.mood >= 70 ? 'bg-emerald-500' :
                      selectedEntity.mood >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${selectedEntity.mood}%` }}
                  />
                </div>
                <span className={`font-bold text-sm ${
                  selectedEntity.mood >= 70 ? 'text-emerald-400' :
                  selectedEntity.mood >= 40 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {selectedEntity.mood.toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{getMoodLabel(selectedEntity.mood)}</p>
            </div>

            {selectedEntity.history.length > 0 && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <Activity className="w-4 h-4" />
                  人生轨迹 (近{selectedEntity.history.length}天)
                </div>
                {renderMiniChart(selectedEntity.history, 'income', 'bg-emerald-500', '收入')}
                {renderMiniChart(selectedEntity.history, 'savings', 'bg-amber-500', '储蓄')}
                {renderMiniChart(selectedEntity.history, 'debt', 'bg-rose-500', '债务')}
                {renderMiniChart(selectedEntity.history, 'mood', 'bg-cyan-500', '情绪')}
              </div>
            )}

            {selectedEntity.history.some(h => h.event) && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-gray-400 text-sm mb-2">📝 重要事件</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedEntity.history.filter(h => h.event).map((h, i) => (
                    <div key={i} className="text-xs text-gray-500 flex gap-2">
                      <span className="text-gray-600">D{h.day}</span>
                      <span>{h.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {selectedEntity.type === 'shop' && (
          <>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                经营状况
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">营业收入</span>
                  <span className="text-emerald-400 font-mono">¥{selectedEntity.revenue.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">运营支出</span>
                  <span className="text-rose-400 font-mono">¥{selectedEntity.expenses.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-gray-400">净利润</span>
                  <span className={`font-mono font-bold ${selectedEntity.revenue - selectedEntity.expenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ¥{(selectedEntity.revenue - selectedEntity.expenses).toFixed(0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <ShoppingBag className="w-4 h-4" />
                库存与定价
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">库存量</span>
                  <span className="text-white font-mono">{selectedEntity.inventory.toFixed(0)} 件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">价格水平</span>
                  <span className="text-orange-400 font-mono">{selectedEntity.priceLevel.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedEntity.type === 'enterprise' && (
          <>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Users className="w-4 h-4" />
                人力资源
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {selectedEntity.employeeCount} 名员工
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                经营状况
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">营业收入</span>
                  <span className="text-emerald-400 font-mono">¥{selectedEntity.revenue.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">工资支出</span>
                  <span className="text-rose-400 font-mono">¥{selectedEntity.expenses.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-gray-400">净利润</span>
                  <span className={`font-mono font-bold ${selectedEntity.revenue - selectedEntity.expenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ¥{(selectedEntity.revenue - selectedEntity.expenses).toFixed(0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Building2 className="w-4 h-4" />
                生产能力
              </div>
              <div className="text-xl font-bold text-cyan-400">
                日产量 ¥{selectedEntity.production.toFixed(0).toLocaleString()}
              </div>
            </div>

            {(selectedEntity.landHoldings || 0) > 0 && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Building className="w-4 h-4" />
                  土地储备
                </div>
                <div className="text-lg font-bold text-violet-400">
                  {selectedEntity.landHoldings} 套房产
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  估值 ¥{selectedEntity.landValue?.toFixed(0).toLocaleString() || '0'}
                </div>
              </div>
            )}
          </>
        )}

        {selectedEntity.type === 'house' && (
          <>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Home className="w-4 h-4" />
                房屋状态
              </div>
              <div className={`text-lg font-bold ${
                selectedEntity.status === 'owned' ? 'text-emerald-400' :
                selectedEntity.status === 'rented' ? 'text-amber-400' :
                'text-gray-400'
              }`}>
                {selectedEntity.status === 'owned' ? '🏠 自有住房' :
                 selectedEntity.status === 'rented' ? '🏘️ 已出租' :
                 '🏚️ 空置中'}
              </div>
              {selectedEntity.ownerType && (
                <div className="text-xs text-gray-500 mt-1">
                  所有者: {selectedEntity.ownerType === 'resident' ? '居民' : 
                          selectedEntity.ownerType === 'enterprise' ? '企业' : '银行'}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                价格信息
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">售价</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ¥{selectedEntity.price.toFixed(0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">月租金</span>
                  <span className="text-amber-400 font-mono">
                    ¥{selectedEntity.rent.toFixed(0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {selectedEntity.priceHistory && selectedEntity.priceHistory.length > 1 && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Activity className="w-4 h-4" />
                  价格走势
                </div>
                <div className="flex items-end gap-0.5 h-16">
                  {selectedEntity.priceHistory.slice(-20).map((price: number, i: number) => {
                    const max = Math.max(...selectedEntity.priceHistory.slice(-20));
                    const min = Math.min(...selectedEntity.priceHistory.slice(-20));
                    const range = max - min || 1;
                    const height = ((price - min) / range) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-violet-500 rounded-t opacity-70"
                        style={{ height: `${Math.max(10, height)}%` }}
                        title={`¥${price.toFixed(0)}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {selectedEntity.type === 'resident' && (selectedEntity.ownedHouseId || selectedEntity.rentedHouseId) && (
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Home className="w-4 h-4" />
              住房情况
            </div>
            <div className="text-sm">
              {selectedEntity.ownedHouseId ? (
                <span className="text-emerald-400">🏠 自有住房</span>
              ) : selectedEntity.rentedHouseId ? (
                <span className="text-amber-400">🏘️ 租住房屋</span>
              ) : null}
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-gray-500">
            位置: ({selectedEntity.position.x}, {selectedEntity.position.y})
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ID: {selectedEntity.id}
          </div>
        </div>
      </div>
    </div>
  );
}
