import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Play, Pause, SkipForward, FastForward, Wifi, WifiOff } from 'lucide-react';
import './TimeControl.css';

export function TimeControl() {
  const state = useGameStore(state => state.state);
  const isConnected = useGameStore(state => state.isConnected);
  const error = useGameStore(state => state.error);
  const setControl = useGameStore(state => state.setControl);
  const step = useGameStore(state => state.step);

  const handleTogglePlay = useCallback(() => {
    if (!state) return;
    setControl(!state.isRunning, state.speed);
  }, [state, setControl]);

  const handleStep = useCallback(() => {
    step();
  }, [step]);

  const handleSpeedChange = useCallback((speed: number) => {
    if (!state) return;
    setControl(state.isRunning, speed);
  }, [state, setControl]);

  return (
    <div className="time-control flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <h1 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '18px' }}
        >
          🏭 经济生态箱
        </h1>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-400" />
          )}
          <span className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isConnected ? '已连接' : '连接中断'}
          </span>
        </div>

        {error && (
          <div className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">游戏天数</div>
            <div 
              className="text-3xl font-bold text-white tabular-nums"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              第 {state?.day || 0} 天
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleStep}
              disabled={!isConnected}
              className="p-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="手动推进一天"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleTogglePlay}
              disabled={!isConnected}
              className={`
                p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${state?.isRunning 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                }
              `}
              title={state?.isRunning ? '暂停' : '开始'}
            >
              {state?.isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">速度:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                disabled={!isConnected}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                  ${state?.speed === speed
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50 hover:text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {speed}x
                {speed === 3 && <FastForward className="inline w-3 h-3 ml-1" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
