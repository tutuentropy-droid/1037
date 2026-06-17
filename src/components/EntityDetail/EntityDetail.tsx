import { useGameStore } from '@/store/gameStore';
import type { Resident, Shop, Enterprise } from '@shared/index';
import { X, Building2, ShoppingBag, User, Briefcase, Wallet, TrendingUp, Users } from 'lucide-react';
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
    return <User className="w-6 h-6 text-emerald-400" />;
  };

  const getTypeLabel = () => {
    if (selectedEntity.type === 'enterprise') return '企业';
    if (selectedEntity.type === 'shop') return '商店';
    return '居民';
  };

  const getTypeColor = () => {
    if (selectedEntity.type === 'enterprise') return 'text-purple-400 border-purple-500/30';
    if (selectedEntity.type === 'shop') return 'text-amber-400 border-amber-500/30';
    return selectedEntity.employed ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30';
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
                <div className="flex justify-between">
                  <span className="text-gray-400">月收入</span>
                  <span className="text-white font-mono">¥{selectedEntity.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">储蓄</span>
                  <span className="text-amber-400 font-mono">¥{selectedEntity.savings.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">日消费</span>
                  <span className="text-cyan-400 font-mono">¥{selectedEntity.consumption.toFixed(0).toLocaleString()}</span>
                </div>
              </div>
            </div>
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
          </>
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
