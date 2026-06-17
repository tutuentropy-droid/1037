import type {
  GameState,
  Resident,
  Shop,
  Enterprise,
  Entity,
  EconomicParams,
  EconomicStats,
} from '../../shared/index.js';
import { DEFAULT_PARAMS, GAME_CONFIG } from '../../shared/index.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateName(): string {
  const names = ['小明', '小红', '小华', '小丽', '小强', '小芳', '小伟', '小娟', '小龙', '小凤',
    '志明', '春娇', '建国', '美玲', '国强', '淑芬', '文豪', '雅婷', '俊宏', '佳慧'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateShopName(): string {
  const prefixes = ['幸福', '快乐', '美好', '兴旺', '繁荣', '如意', '吉祥', '平安', '顺利', '和谐'];
  const suffixes = ['超市', '商店', '便利店', '百货', '市场', '商行', '店铺', '门市', '专柜', '中心'];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + 
         suffixes[Math.floor(Math.random() * suffixes.length)];
}

function generateEnterpriseName(): string {
  const prefixes = ['光明', '远大', '创新', '发展', '前进', '腾飞', '昌盛', '兴盛', '恒昌', '永盛'];
  const suffixes = ['企业', '公司', '集团', '工厂', '制造厂', '科技', '产业', '实业', '贸易', '股份'];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + 
         suffixes[Math.floor(Math.random() * suffixes.length)];
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function generateRandomPosition(existingPositions: { x: number; y: number }[], gridSize: number) {
  let x: number, y: number;
  let attempts = 0;
  do {
    x = Math.floor(Math.random() * gridSize);
    y = Math.floor(Math.random() * gridSize);
    attempts++;
  } while (existingPositions.some(p => p.x === x && p.y === y) && attempts < 100);
  return { x, y };
}

export function initializeGame(): GameState {
  const entities: Entity[] = [];
  const positions: { x: number; y: number }[] = [];
  const gridSize = GAME_CONFIG.GRID_SIZE;

  for (let i = 0; i < GAME_CONFIG.INITIAL_ENTERPRISES; i++) {
    const pos = generateRandomPosition(positions, gridSize);
    positions.push(pos);
    const enterprise: Enterprise = {
      id: generateId(),
      type: 'enterprise',
      name: generateEnterpriseName(),
      revenue: 50000 + Math.random() * 50000,
      expenses: 40000 + Math.random() * 30000,
      employeeCount: 0,
      employeeIds: [],
      production: 10000 + Math.random() * 5000,
      position: pos,
      revenueHistory: [],
    };
    entities.push(enterprise);
  }

  for (let i = 0; i < GAME_CONFIG.INITIAL_SHOPS; i++) {
    const pos = generateRandomPosition(positions, gridSize);
    positions.push(pos);
    const shop: Shop = {
      id: generateId(),
      type: 'shop',
      name: generateShopName(),
      revenue: 20000 + Math.random() * 30000,
      expenses: 15000 + Math.random() * 20000,
      inventory: 500 + Math.random() * 500,
      priceLevel: 1 + Math.random() * 0.2,
      position: pos,
      revenueHistory: [],
    };
    entities.push(shop);
  }

  const enterprises = entities.filter(e => e.type === 'enterprise') as Enterprise[];
  const residentList: Resident[] = [];
  
  for (let i = 0; i < GAME_CONFIG.INITIAL_RESIDENTS; i++) {
    const pos = generateRandomPosition(positions, gridSize);
    positions.push(pos);
    const employed = Math.random() > 0.1;
    let employerId: string | null = null;
    let income = 0;

    if (employed && enterprises.length > 0) {
      const enterprise = enterprises[Math.floor(Math.random() * enterprises.length)];
      employerId = enterprise.id;
      income = DEFAULT_PARAMS.minimumWage + Math.random() * 1000;
    }

    const resident: Resident = {
      id: generateId(),
      type: 'resident',
      name: generateName(),
      employed,
      employerId,
      income,
      savings: 5000 + Math.random() * 10000,
      consumption: 0,
      position: pos,
    };
    residentList.push(resident);
    entities.push(resident);
  }

  enterprises.forEach(enterprise => {
    const employees = residentList.filter(r => r.employerId === enterprise.id);
    enterprise.employeeIds = employees.map(e => e.id);
    enterprise.employeeCount = employees.length;
  });

  const initialStats: EconomicStats = {
    gdp: 0,
    gdpChange: 0,
    unemploymentRate: 0.1,
    unemploymentChange: 0,
    priceIndex: 100,
    priceChange: 0,
    totalPopulation: GAME_CONFIG.INITIAL_RESIDENTS,
    employedPopulation: GAME_CONFIG.INITIAL_RESIDENTS * 0.9,
  };

  const state: GameState = {
    day: 0,
    isRunning: false,
    speed: 1,
    params: { ...DEFAULT_PARAMS },
    stats: initialStats,
    entities,
    history: [],
  };

  calculateEconomicStats(state);
  state.history.push({ ...state.stats });

  return state;
}

function simulateWagePayment(state: GameState): void {
  const { params, entities } = state;
  const enterprises = entities.filter(e => e.type === 'enterprise') as Enterprise[];
  const residents = entities.filter(e => e.type === 'resident') as Resident[];

  enterprises.forEach(enterprise => {
    let totalWages = 0;
    enterprise.employeeIds.forEach(empId => {
      const resident = residents.find(r => r.id === empId);
      if (resident) {
        const wage = Math.max(resident.income, params.minimumWage);
        resident.income = wage;
        totalWages += wage;
      }
    });
    enterprise.expenses = totalWages;
  });
}

function simulateConsumption(state: GameState): void {
  const { params, entities } = state;
  const residents = entities.filter(e => e.type === 'resident') as Resident[];
  const shops = entities.filter(e => e.type === 'shop') as Shop[];

  const totalShopRevenue = shops.reduce((sum, s) => sum + Math.max(s.revenue, 1000), 0) || 1;

  residents.forEach(resident => {
    if (resident.employed) {
      const disposableIncome = resident.income * (1 - params.taxRate);
      const consumptionAmount = disposableIncome * GAME_CONFIG.CONSUMPTION_RATE * (1 - params.consumptionTax);
      resident.consumption = consumptionAmount;
      resident.savings += disposableIncome - consumptionAmount;

      shops.forEach(shop => {
        const shopShare = Math.max(shop.revenue, 1000) / totalShopRevenue;
        const consumptionForShop = consumptionAmount * shopShare;
        shop.revenue += consumptionForShop * (1 + params.consumptionTax);
      });
    } else {
      const consumptionAmount = Math.min(resident.savings * 0.5, GAME_CONFIG.UNEMPLOYMENT_BENEFIT);
      resident.consumption = consumptionAmount;
      resident.savings -= consumptionAmount;

      if (consumptionAmount > 0) {
        shops.forEach(shop => {
          const shopShare = Math.max(shop.revenue, 1000) / totalShopRevenue;
          const consumptionForShop = consumptionAmount * shopShare;
          shop.revenue += consumptionForShop * (1 + params.consumptionTax);
        });
      }
    }
  });
}

function simulateProduction(state: GameState): void {
  const enterprises = state.entities.filter(e => e.type === 'enterprise') as Enterprise[];

  enterprises.forEach(enterprise => {
    const baseProduction = enterprise.employeeCount * 500;
    const efficiency = 0.8 + Math.random() * 0.4;
    enterprise.production = baseProduction * efficiency;
    enterprise.revenue = enterprise.production * (2 + Math.random() * 0.5);
    enterprise.revenueHistory.push(enterprise.revenue);
    if (enterprise.revenueHistory.length > 30) {
      enterprise.revenueHistory.shift();
    }
  });
}

function simulateHiringDecisions(state: GameState): void {
  const enterprises = state.entities.filter(e => e.type === 'enterprise') as Enterprise[];
  const residents = state.entities.filter(e => e.type === 'resident') as Resident[];
  const unemployedResidents = residents.filter(r => !r.employed);

  enterprises.forEach(enterprise => {
    const history = enterprise.revenueHistory;
    
    if (history.length >= GAME_CONFIG.LAYOFF_THRESHOLD_DAYS) {
      const recent = history.slice(-GAME_CONFIG.LAYOFF_THRESHOLD_DAYS);
      const isDeclining = recent.every((val, i, arr) => i === 0 || val < arr[i - 1]);
      
      if (isDeclining && enterprise.employeeCount > 1) {
        const laidOffId = enterprise.employeeIds.pop()!;
        const resident = residents.find(r => r.id === laidOffId);
        if (resident) {
          resident.employed = false;
          resident.employerId = null;
          resident.income = 0;
        }
        enterprise.employeeCount--;
      }
    }
    
    if (history.length >= GAME_CONFIG.HIRE_THRESHOLD_DAYS) {
      const recent = history.slice(-GAME_CONFIG.HIRE_THRESHOLD_DAYS);
      const isGrowing = recent.every((val, i, arr) => i === 0 || val > arr[i - 1]);
      
      if (isGrowing && unemployedResidents.length > 0) {
        const newHire = unemployedResidents.shift()!;
        newHire.employed = true;
        newHire.employerId = enterprise.id;
        newHire.income = state.params.minimumWage;
        enterprise.employeeIds.push(newHire.id);
        enterprise.employeeCount++;
      }
    }
  });
}

function simulateShopOperations(state: GameState): void {
  const shops = state.entities.filter(e => e.type === 'shop') as Shop[];
  const enterprises = state.entities.filter(e => e.type === 'enterprise') as Enterprise[];
  const residents = state.entities.filter(e => e.type === 'resident') as Resident[];

  const totalConsumption = residents.reduce((sum, r) => sum + r.consumption, 0);
  const avgConsumption = totalConsumption / shops.length;

  shops.forEach(shop => {
    shop.revenueHistory.push(shop.revenue);
    if (shop.revenueHistory.length > 30) {
      shop.revenueHistory.shift();
    }

    const demand = shop.revenue / (avgConsumption || 1);
    if (demand > 1.2 && shop.inventory > 0) {
      shop.priceLevel = Math.min(shop.priceLevel * 1.05, 2);
    } else if (demand < 0.8) {
      shop.priceLevel = Math.max(shop.priceLevel * 0.95, 0.5);
    }

    const restockAmount = Math.max(0, avgConsumption * 0.5 - shop.inventory);
    if (restockAmount > 0 && enterprises.length > 0) {
      const supplier = enterprises[Math.floor(Math.random() * enterprises.length)];
      const cost = restockAmount * 0.8;
      shop.inventory += restockAmount;
      shop.expenses += cost;
      supplier.revenue += cost;
    }

    shop.inventory = Math.max(0, shop.inventory - shop.revenue * 0.3);
  });
}

function simulateTaxCollection(state: GameState): void {
  const { params, entities } = state;
  const residents = entities.filter(e => e.type === 'resident') as Resident[];
  const enterprises = entities.filter(e => e.type === 'enterprise') as Enterprise[];
  const shops = entities.filter(e => e.type === 'shop') as Shop[];

  let totalTax = 0;

  residents.forEach(resident => {
    if (resident.employed) {
      totalTax += resident.income * params.taxRate;
    }
  });

  enterprises.forEach(enterprise => {
    const profit = enterprise.revenue - enterprise.expenses;
    if (profit > 0) {
      totalTax += profit * params.taxRate;
    }
  });

  shops.forEach(shop => {
    const profit = shop.revenue - shop.expenses;
    if (profit > 0) {
      totalTax += profit * params.taxRate;
    }
  });
}

function calculateEconomicStats(state: GameState): void {
  const { entities } = state;
  const residents = entities.filter(e => e.type === 'resident') as Resident[];
  const shops = entities.filter(e => e.type === 'shop') as Shop[];
  const enterprises = entities.filter(e => e.type === 'enterprise') as Enterprise[];

  const totalConsumption = residents.reduce((sum, r) => sum + r.consumption, 0);
  const totalProduction = enterprises.reduce((sum, e) => sum + e.production, 0);
  const unemployedCount = residents.filter(r => !r.employed).length;
  const governmentSpending = unemployedCount * GAME_CONFIG.UNEMPLOYMENT_BENEFIT;
  const gdp = totalConsumption + totalProduction + governmentSpending;

  const unemploymentRate = unemployedCount / residents.length;

  const avgPrice = shops.reduce((sum, s) => sum + s.priceLevel, 0) / shops.length;
  const basePrice = state.history[0] ? state.history[0].priceIndex / 100 : 1;
  const priceIndex = (avgPrice / basePrice) * 100;

  const prevStats = state.history[state.history.length - 1];
  const gdpChange = prevStats && prevStats.gdp > 0 ? ((gdp - prevStats.gdp) / prevStats.gdp) * 100 : 0;
  const unemploymentChange = prevStats ? (unemploymentRate - prevStats.unemploymentRate) * 100 : 0;
  const priceChange = prevStats && prevStats.priceIndex > 0 
    ? ((priceIndex - prevStats.priceIndex) / prevStats.priceIndex) * 100 
    : 0;

  state.stats = {
    gdp,
    gdpChange,
    unemploymentRate,
    unemploymentChange,
    priceIndex,
    priceChange,
    totalPopulation: residents.length,
    employedPopulation: residents.filter(r => r.employed).length,
  };
}

export function simulateDay(state: GameState): GameState {
  const newState = deepClone(state);
  newState.day += 1;

  simulateWagePayment(newState);
  simulateConsumption(newState);
  simulateProduction(newState);
  simulateHiringDecisions(newState);
  simulateShopOperations(newState);
  simulateTaxCollection(newState);
  calculateEconomicStats(newState);

  newState.history.push({ ...newState.stats });
  if (newState.history.length > 100) {
    newState.history.shift();
  }

  return newState;
}

export function updateParams(state: GameState, params: Partial<EconomicParams>): GameState {
  const newState = deepClone(state);
  newState.params = { ...newState.params, ...params };
  return newState;
}

export function setGameControl(state: GameState, isRunning: boolean, speed?: number): GameState {
  const newState = deepClone(state);
  newState.isRunning = isRunning;
  if (speed !== undefined) {
    newState.speed = Math.max(1, Math.min(3, speed));
  }
  return newState;
}
