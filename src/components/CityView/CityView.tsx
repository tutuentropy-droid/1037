import { useMemo, useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Entity, Resident, House } from '@shared/index';
import { GAME_CONFIG } from '@shared/index';
import { Building2, ShoppingBag, User, Home } from 'lucide-react';
import './CityView.css';

interface EntityTileProps {
  entity: Entity;
  isSelected: boolean;
  onClick: () => void;
  prosperityLevel: number;
}

function HouseTile({ house, isSelected, onClick }: { house: House; isSelected: boolean; onClick: () => void }) {
  const getHouseColor = () => {
    switch (house.status) {
      case 'owned':
        return 'bg-emerald-600/80 border-emerald-400';
      case 'rented':
        return house.ownerType === 'enterprise' 
          ? 'bg-purple-600/80 border-purple-400' 
          : 'bg-amber-600/80 border-amber-400';
      case 'empty':
      default:
        return 'bg-slate-600/60 border-slate-500';
    }
  };

  const getTitle = () => {
    const statusText = house.status === 'owned' ? '自有' : house.status === 'rented' ? '租住' : '空置';
    return `${house.name} [${statusText}] ¥${house.price.toFixed(0)}`;
  };

  return (
    <div
      className={`
        entity-tile house-tile absolute flex items-center justify-center
        border-2 rounded cursor-pointer transition-all duration-300
        ${getHouseColor()}
        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 z-10' : ''}
        hover:scale-105 hover:z-10
      `}
      style={{
        width: '28px',
        height: '28px',
        left: `${house.position.x * 40 + 6}px`,
        top: `${house.position.y * 40 + 6}px`,
      }}
      onClick={onClick}
      title={getTitle()}
    >
      <Home className="w-4 h-4 text-white" />
    </div>
  );
}

function ResidentAvatar({ 
  resident, 
  isSelected, 
  onClick,
  prosperityLevel 
}: { 
  resident: Resident; 
  isSelected: boolean; 
  onClick: () => void;
  prosperityLevel: number;
}) {
  const [displayPos, setDisplayPos] = useState({ ...resident.homePosition });
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      setDisplayPos(prev => {
        let target = { ...resident.homePosition };
        
        if (resident.employed) {
          const cycle = (now / 1000) % 8;
          if (cycle < 3) {
            target = { ...resident.homePosition };
          } else if (cycle < 6) {
            if (resident.employerId) {
              target = { x: resident.position.x + (Math.random() - 0.5) * 0.5, y: resident.position.y + (Math.random() - 0.5) * 0.5 };
            } else {
              target = { ...resident.position };
            }
          } else {
            target = { x: resident.position.x + (Math.random() - 0.5) * 2, y: resident.position.y + (Math.random() - 0.5) * 2 };
          }
        } else {
          target = { ...resident.homePosition };
          const idleWander = (now / 1000) % 10;
          if (idleWander > 5) {
            target = {
              x: resident.homePosition.x + Math.sin(now / 2000 + resident.id.charCodeAt(0)) * 0.5,
              y: resident.homePosition.y + Math.cos(now / 2000 + resident.id.charCodeAt(1)) * 0.5,
            };
          }
        }

        const speed = 2 + prosperityLevel * 2;
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 0.1) {
          return target;
        }
        
        const moveAmount = Math.min(dist, delta * speed);
        return {
          x: prev.x + (dx / dist) * moveAmount,
          y: prev.y + (dy / dist) * moveAmount,
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resident, prosperityLevel]);

  const getEntityColor = () => {
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
  };

  const getTitle = () => {
    const status = resident.employed ? '工作中' : '失业';
    const activity = !resident.employed ? '（在家）' : '';
    return `${resident.name} [${resident.personality.label}] ${status}${activity}`;
  };

  return (
    <div
      className={`
        resident-avatar absolute flex items-center justify-center
        border-2 rounded-full cursor-pointer transition-all
        ${getEntityColor()}
        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 z-20' : ''}
        ${resident.employed ? '' : 'animate-pulse-slow'}
      `}
      style={{
        width: '20px',
        height: '20px',
        left: `${displayPos.x * 40 + 10}px`,
        top: `${displayPos.y * 40 + 10}px`,
        zIndex: isSelected ? 20 : 5,
      }}
      onClick={onClick}
      title={getTitle()}
    >
      <User className="w-3 h-3 text-white" />
    </div>
  );
}

function EntityTile({ entity, isSelected, onClick, prosperityLevel }: EntityTileProps) {
  if (entity.type === 'house') {
    return <HouseTile house={entity as House} isSelected={isSelected} onClick={onClick} />;
  }
  if (entity.type === 'resident') {
    return (
      <ResidentAvatar 
        resident={entity as Resident} 
        isSelected={isSelected} 
        onClick={onClick}
        prosperityLevel={prosperityLevel}
      />
    );
  }

  const getEntityColor = () => {
    if (entity.type === 'enterprise') {
      return 'bg-purple-500/80 border-purple-400';
    }
    if (entity.type === 'shop') {
      return 'bg-amber-500/80 border-amber-400';
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

function ProsperityParticles({ level }: { level: number }) {
  const particles = useMemo(() => {
    if (level < 0.3) return [];
    const count = Math.floor(level * 20);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      size: 2 + Math.random() * 4,
    }));
  }, [level]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="prosperity-particle absolute rounded-full bg-amber-400/40"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
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

  const prosperityLevel = useMemo(() => {
    if (!state?.stats) return 0.5;
    const gdpFactor = Math.min(1, Math.max(0, (state.stats.gdpChange + 5) / 10));
    const employmentFactor = 1 - state.stats.unemploymentRate;
    return (gdpFactor * 0.5 + employmentFactor * 0.5);
  }, [state?.stats]);

  const houses = useMemo(
    () => state?.entities.filter(e => e.type === 'house') || [],
    [state?.entities]
  );
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

  const staticEntities = useMemo(() => {
    return [
      ...(state?.entities.filter(e => e.type !== 'resident') || []),
    ];
  }, [state?.entities]);

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
          <span className="text-violet-400">
            <Home className="inline w-4 h-4 mr-1" />
            {houses.length} 房屋
          </span>
          <span className="text-emerald-400">
            <User className="inline w-4 h-4 mr-1" />
            {residents.length} 居民
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 text-xs flex-shrink-0">
        <span className="text-gray-400">经济活力:</span>
        <div className="flex-1 max-w-xs h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              prosperityLevel > 0.7 ? 'bg-gradient-to-r from-emerald-500 to-amber-400' :
              prosperityLevel > 0.4 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
              'bg-gradient-to-r from-rose-500 to-rose-400'
            }`}
            style={{ width: `${prosperityLevel * 100}%` }}
          />
        </div>
        <span className={`font-bold ${
          prosperityLevel > 0.7 ? 'text-emerald-400' :
          prosperityLevel > 0.4 ? 'text-amber-400' :
          'text-rose-400'
        }`}>
          {(prosperityLevel * 100).toFixed(0)}%
        </span>
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-600/80 border border-emerald-400 rounded"></div>
          <span className="text-gray-300">自有住房</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-600/80 border border-amber-400 rounded"></div>
          <span className="text-gray-300">租住住房</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-600/60 border border-slate-500 rounded"></div>
          <span className="text-gray-300">空置住房</span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-gray-400">居民人格:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-emerald-300 rounded-full"></div>
          <span className="text-emerald-400">节俭型</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-pink-300 rounded-full"></div>
          <span className="text-pink-400">消费型</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-yellow-300 rounded-full"></div>
          <span className="text-yellow-400">投机型</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/70 border-2 border-slate-300 rounded-full"></div>
          <span className="text-slate-400">躺平型</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 w-full">
        <div className="flex justify-center items-start min-w-full p-2">
          <div 
            className={`city-grid relative bg-slate-800/50 rounded-lg border-2 border-slate-700 flex-shrink-0 transition-all duration-1000 ${
              prosperityLevel > 0.7 ? 'prosperous' : prosperityLevel < 0.3 ? 'depressed' : ''
            }`}
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
            <ProsperityParticles level={prosperityLevel} />
            
            {staticEntities.map(entity => (
              <EntityTile
                key={entity.id}
                entity={entity}
                isSelected={selectedEntity?.id === entity.id}
                onClick={() => handleEntityClick(entity)}
                prosperityLevel={prosperityLevel}
              />
            ))}
            
            {residents.map(entity => (
              <EntityTile
                key={entity.id}
                entity={entity}
                isSelected={selectedEntity?.id === entity.id}
                onClick={() => handleEntityClick(entity)}
                prosperityLevel={prosperityLevel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
