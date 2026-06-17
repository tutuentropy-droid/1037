import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Entity, Resident } from '@shared/index';
import { GAME_CONFIG, PERSONALITIES } from '@shared/index';
import { Building2, ShoppingBag, User } from 'lucide-react';
import './CityView.css';

interface EntityTileProps {
  entity: Entity;
  isSelected: boolean;
  onClick: () => void;
}

function EntityTile({ entity, isSelected, onClick }: EntityTileProps) {
  const getEntityColor = () => {
    if (entity.type === 'enterprise') {
      return 'bg-purple-500/80 border-purple-400';
    }
    if (entity.type === 'shop') {
      return 'bg-amber-500/80 border-amber-400';
    }
    if (entity.type === 'resident') {
      const resident = entity as Resident;
      const baseColor = resident.employed ? 'bg-emerald-500/70' : 'bg-rose-500/70';
      let borderColor = 'border-emerald-400';
      
      switch (resident.personality.type) {
        case 'frugal':
          borderColor = resident.employed ? 'border-emerald-300' : 'border-emerald-600';
          break;
        case 'consumer':
          borderColor = resident.employed ? 'border-pink-300' : 'border-pink-600';
          break;
        case 'speculator':
          borderColor = resident.employed ? 'border-yellow-300' : 'border-yellow-600';
          break;
        case 'layabout':
          borderColor = resident.employed ? 'border-slate-300' : 'border-slate-600';
          break;
      }
      return `${baseColor} ${borderColor} border-2`;
    }
    return 'bg-gray-500/80 border-gray-400';
  };

  const getEntityIcon = () => {
    if (entity.type === 'enterprise') {
      return <Building2 className="w-4 h-4 text-white" />;
    }
    if (entity.type === 'shop') {
      return <ShoppingBag className="w-4 h-4 text-white" />;
    }
    return <User className="w-3.5 h-3.5 text-white" />;
  };

  const getTitle = () => {
    if (entity.type === 'resident') {
      const resident = entity as Resident;
      return `${resident.name} [${resident.personality.label}] ${resident.employed ? '✓' : '✗'}`;
    }
    return entity.name;
  };

  return (
    <div
      className={`
        entity-tile absolute flex items-center justify-center
        border-2 rounded cursor-pointer transition-all duration-200
        ${getEntityColor()}
        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 z-10' : ''}
        hover:scale-105 hover:z-10
      `}
      style={{
        width: '32px',
        height: '32px',
        left: `${entity.position.x * 40 + 4}px`,
        top: `${entity.position.y * 40 + 4}px`,
      }}
      onClick={onClick}
      title={getTitle()}
    >
      {getEntityIcon()}
    </div>
  );
}

export function CityView() {
  const state = useGameStore(state => state.state);
  const selectedEntity = useGameStore(state => state.selectedEntity);
  const setSelectedEntity = useGameStore(state => state.setSelectedEntity);

  const gridSize = GAME_CONFIG.GRID_SIZE;
  const pixelSize = 40;
  const containerSize = gridSize * pixelSize;

  const residents = useMemo(
    () => state?.entities.filter(e => e.type === 'resident') || [],
    [state?.entities]
  );
  const shops = useMemo(
    () => state?.entities.filter(e => e.type === 'shop') || [],
    [state?.entities]
  );
  const enterprises = useMemo(
    () => state?.entities.filter(e => e.type === 'enterprise') || [],
    [state?.entities]
  );

  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(selectedEntity?.id === entity.id ? null : entity);
  };

  return (
    <div className="city-view-container flex flex-col h-full min-h-[680px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '14px' }}>
          🏙️ 城市视图
        </h2>
        <div className="flex gap-4 text-sm">
          <span className="text-purple-400">
            <Building2 className="inline w-4 h-4 mr-1" />
            {enterprises.length} 企业
          </span>
          <span className="text-amber-400">
            <ShoppingBag className="inline w-4 h-4 mr-1" />
            {shops.length} 商店
          </span>
          <span className="text-emerald-400">
            <Users className="inline w-4 h-4 mr-1" />
            {residents.length} 居民
          </span>
        </div>
      </div>

      <div className="legend flex flex-wrap gap-3 mb-4 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500/80 border border-purple-400 rounded"></div>
          <span className="text-gray-300">企业</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500/80 border border-amber-400 rounded"></div>
          <span className="text-gray-300">商店</span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-gray-400">居民人格:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-emerald-300 rounded"></div>
          <span className="text-emerald-400">节俭型</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-pink-300 rounded"></div>
          <span className="text-pink-400">消费型</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-yellow-300 rounded"></div>
          <span className="text-yellow-400">投机型</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-slate-300 rounded"></div>
          <span className="text-slate-400">躺平型</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 w-full">
        <div className="flex justify-center items-start min-w-full p-2">
          <div 
            className="city-grid relative bg-slate-800/50 rounded-lg border-2 border-slate-700 flex-shrink-0"
            style={{ 
              width: `${containerSize}px`, 
              height: `${containerSize}px`,
              backgroundImage: `
                linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${pixelSize}px ${pixelSize}px`,
            }}
          >
            {state?.entities.map(entity => (
              <EntityTile
                key={entity.id}
                entity={entity}
                isSelected={selectedEntity?.id === entity.id}
                onClick={() => handleEntityClick(entity)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
