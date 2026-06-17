import { useGameSocket } from '@/hooks/useGameSocket';
import { TimeControl } from '@/components/TimeControl/TimeControl';
import { CityView } from '@/components/CityView/CityView';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { StatsPanel } from '@/components/StatsPanel/StatsPanel';
import { EntityDetail } from '@/components/EntityDetail/EntityDetail';
import { EventLog } from '@/components/EventLog/EventLog';

export default function Home() {
  useGameSocket();

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <TimeControl />
      
      <div className="flex-1 p-4 flex gap-4 min-w-0">
        <div className="w-60 flex-shrink-0 flex flex-col gap-4">
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700 flex-shrink-0">
            <ControlPanel />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-[680px]">
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700 flex-shrink-0">
            <StatsPanel />
          </div>
          
          <div className="flex-1 flex gap-4 min-h-[720px]">
            <div className="flex-1 p-4 bg-slate-800/30 rounded-2xl border border-slate-700 flex flex-col min-w-0">
              <CityView />
            </div>

            <div className="w-80 flex-shrink-0 p-4 bg-slate-800/30 rounded-2xl border border-slate-700 flex flex-col">
              <EventLog />
            </div>
          </div>
        </div>

        <div className="w-64 flex-shrink-0">
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700 min-h-full">
            <EntityDetail />
          </div>
        </div>
      </div>
    </div>
  );
}
