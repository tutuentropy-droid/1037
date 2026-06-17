import { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_PARAMS } from '@shared/index';
import { Settings, DollarSign, Percent, Wallet, RotateCcw, Banknote, TrendingUp, TrendingDown } from 'lucide-react';
import './ControlPanel.css';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
  icon: React.ReactNode;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  defaultValue,
  icon,
  onChange,
  formatValue,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const defaultPercentage = ((defaultValue - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  return (
    <div className="slider-container mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-orange-400">{icon}</span>
          <span className="text-sm font-medium text-gray-200">{label}</span>
        </div>
        <span 
          className="text-lg font-bold text-white tabular-nums"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          {formatValue ? formatValue(value) : value.toFixed(1)}
          <span className="text-xs text-gray-400 ml-1">{unit}</span>
        </span>
      </div>
      
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
          <div 
            className="absolute top-0 h-full w-0.5 bg-white/50"
            style={{ left: `${defaultPercentage}%` }}
            title={`默认值: ${defaultValue}`}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
        />
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-orange-500 pointer-events-none transition-all duration-150"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span className="text-gray-400">默认: {formatValue ? formatValue(defaultValue) : defaultValue}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

export function ControlPanel() {
  const state = useGameStore(state => state.state);
  const updateParams = useGameStore(state => state.updateParams);
  const reset = useGameStore(state => state.reset);
  
  const [localParams, setLocalParams] = useState({
    taxRate: state?.params.taxRate || DEFAULT_PARAMS.taxRate,
    minimumWage: state?.params.minimumWage || DEFAULT_PARAMS.minimumWage,
    consumptionTax: state?.params.consumptionTax || DEFAULT_PARAMS.consumptionTax,
    interestRate: state?.params.interestRate || DEFAULT_PARAMS.interestRate,
  });

  const handleTaxRateChange = useCallback((value: number) => {
    setLocalParams(prev => ({ ...prev, taxRate: value }));
    updateParams({ taxRate: value });
  }, [updateParams]);

  const handleMinimumWageChange = useCallback((value: number) => {
    setLocalParams(prev => ({ ...prev, minimumWage: value }));
    updateParams({ minimumWage: value });
  }, [updateParams]);

  const handleConsumptionTaxChange = useCallback((value: number) => {
    setLocalParams(prev => ({ ...prev, consumptionTax: value }));
    updateParams({ consumptionTax: value });
  }, [updateParams]);

  const handleInterestRateChange = useCallback((value: number) => {
    setLocalParams(prev => ({ ...prev, interestRate: value }));
    updateParams({ interestRate: value });
  }, [updateParams]);

  const handleReset = useCallback(() => {
    setLocalParams({ ...DEFAULT_PARAMS });
    reset();
  }, [reset]);

  return (
    <div className="control-panel h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '14px' }}>
          <Settings className="w-5 h-5 text-orange-400" />
          经济控制
        </h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        <Slider
          label="个人所得税率"
          value={localParams.taxRate}
          min={0}
          max={0.5}
          step={0.01}
          unit="%"
          defaultValue={DEFAULT_PARAMS.taxRate}
          icon={<Percent className="w-4 h-4" />}
          onChange={handleTaxRateChange}
          formatValue={(v) => `${(v * 100).toFixed(0)}`}
        />

        <Slider
          label="最低工资标准"
          value={localParams.minimumWage}
          min={1000}
          max={5000}
          step={100}
          unit="元/月"
          defaultValue={DEFAULT_PARAMS.minimumWage}
          icon={<Wallet className="w-4 h-4" />}
          onChange={handleMinimumWageChange}
          formatValue={(v) => v.toFixed(0)}
        />

        <Slider
          label="消费税率"
          value={localParams.consumptionTax}
          min={0}
          max={0.3}
          step={0.01}
          unit="%"
          defaultValue={DEFAULT_PARAMS.consumptionTax}
          icon={<DollarSign className="w-4 h-4" />}
          onChange={handleConsumptionTaxChange}
          formatValue={(v) => `${(v * 100).toFixed(0)}`}
        />

        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">银行利率</span>
            <span 
              className="ml-auto text-lg font-bold text-white tabular-nums"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              {(localParams.interestRate * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => handleInterestRateChange(Math.max(0, localParams.interestRate - 0.005))}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 rounded-lg text-rose-300 text-sm transition-colors"
            >
              <TrendingDown className="w-4 h-4" />
              降息
            </button>
            <button
              onClick={() => handleInterestRateChange(Math.min(0.2, localParams.interestRate + 0.005))}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              加息
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={0.2}
            step={0.005}
            value={localParams.interestRate}
            onChange={(e) => handleInterestRateChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0%</span>
            <span className="text-gray-400">默认: {(DEFAULT_PARAMS.interestRate * 100).toFixed(1)}%</span>
            <span>20%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="text-sm font-medium text-gray-300 mb-2">💡 经济提示</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• 提高税率会增加政府收入，但会降低居民消费意愿</li>
          <li>• 提高工资会增加居民购买力，但可能导致企业裁员</li>
          <li>• 提高消费税会抑制消费，但能稳定物价</li>
          <li>• 加息会抑制贷款和消费，有助于控制通胀</li>
          <li>• 降息会刺激经济，但可能引发资产泡沫</li>
        </ul>
      </div>
    </div>
  );
}
