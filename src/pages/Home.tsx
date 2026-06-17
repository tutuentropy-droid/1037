import { useGameSocket } from '@/hooks/useGameSocket';
import { TimeControl } from '@/components/TimeControl/TimeControl';
import { CityView } from '@/components/CityView/CityView';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { StatsPanel } from '@/components/StatsPanel/StatsPanel';
import { EntityDetail } from '@/components/EntityDetail/EntityDetail';

export default function Home() {
  useGameSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <TimeControl />
      
      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        <div className="w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700 flex-1">
            <ControlPanel />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700">
            <StatsPanel />
          </div>
          
          <div className="flex-1 p-5 bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden min-h-0">
            <CityView />
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700 h-full">
            <EntityDetail />
          </div>
        </div>
      </div>
    </div>
  );
}
