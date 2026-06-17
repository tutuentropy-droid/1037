import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Entity } from '@shared/index';
import { GAME_CONFIG } from '@shared/index';
import { Building2, ShoppingBag, Users } from 'lucide-react';
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
      return entity.employed 
        ? 'bg-emerald-500/80 border-emerald-400' 
        : 'bg-rose-500/80 border-rose-400';
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
    return <Users className="w-4 h-4 text-white" />;
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
        width: '36px',
        height: '36px',
        left: `${entity.position.x * 40}px`,
        top: `${entity.position.y * 40}px`,
      }}
      onClick={onClick}
      title={entity.name}
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
    <div className="city-view-container flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
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

      <div className="legend flex gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500/80 border border-purple-400 rounded"></div>
          <span className="text-gray-300">企业</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500/80 border border-amber-400 rounded"></div>
          <span className="text-gray-300">商店</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/80 border border-emerald-400 rounded"></div>
          <span className="text-gray-300">就业居民</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-rose-500/80 border border-rose-400 rounded"></div>
          <span className="text-gray-300">失业居民</span>
        </div>
      </div>

      <div 
        className="city-grid relative bg-slate-800/50 rounded-lg border-2 border-slate-700 overflow-hidden flex-1"
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
  );
}
