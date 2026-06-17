import type {
  GameState,
  Resident,
  Shop,
  Enterprise,
  Entity,
  EconomicParams,
  EconomicStats,
  EconomicEvent,
  PersonalityType,
  ResidentHistoryEntry,
} from '../../shared/index.js';
import { DEFAULT_PARAMS, GAME_CONFIG, PERSONALITIES } from '../../shared/index.js';

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

function getRandomPersonality(): PersonalityType {
  const types: PersonalityType[] = ['frugal', 'consumer', 'speculator', 'layabout'];
  const weights = [0.3, 0.3, 0.2, 0.2];
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return types[i];
  }
  return 'frugal';
}

function createEvent(
  type: EconomicEvent['type'],
  title: string,
  description: string,
  day: number,
  impact?: 'positive' | 'negative' | 'neutral',
  entityId?: string,
  entityName?: string,
  amount?: number
): EconomicEvent {
  return {
    id: generateId(),
    type,
    title,
    description,
    day,
    timestamp: Date.now(),
    impact,
    entityId,
    entityName,
    amount,
  };
}

function addEvent(state: GameState, event: EconomicEvent): void {
  state.events.unshift(event);
  if (state.events.length > GAME_CONFIG.MAX_EVENTS) {
    state.events.pop();
  }
}

function calculateMood(resident: Resident): number {
  let mood = 50;

  if (resident.employed) {
    mood += 15;
  } else {
    mood -= 20;
  }

  if (resident.savings > 10000) {
    mood += 10;
  } else if (resident.savings < 1000) {
    mood -= 10;
  }

  if (resident.debt > 0) {
    mood -= Math.min(15, resident.debt / 5000);
  }

  if (resident.assets > 0) {
    mood += Math.min(10, resident.assets / 50000);
  }

  if (resident.personality.type === 'layabout') {
    if (!resident.employed) mood += 10;
  }

  if (resident.personality.type === 'consumer') {
    if (resident.consumption > resident.income * 0.5) mood += 5;
  }

  if (resident.personality.type === 'frugal') {
    if (resident.savings > resident.income * 6) mood += 5;
  }

  if (resident.personality.type === 'speculator') {
    if (resident.assets > 0) mood += 8;
  }

  return Math.max(0, Math.min(100, mood));
}

function recordResidentHistory(resident: Resident, day: number, event?: string): void {
  const entry: ResidentHistoryEntry = {
    day,
    income: resident.income,
    savings: resident.savings,
    debt: resident.debt,
    mood: resident.mood,
    event,
  };
  resident.history.push(entry);
  if (resident.history.length > GAME_CONFIG.MAX_HISTORY_ENTRIES) {
    resident.history.shift();
  }
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
    const personalityType = getRandomPersonality();
    const personality = { ...PERSONALITIES[personalityType] };
    
    const employed = Math.random() < 0.9 * personality.workMotivation;
    let employerId: string | null = null;
    let income = 0;

    if (employed && enterprises.length > 0) {
      const enterprise = enterprises[Math.floor(Math.random() * enterprises.length)];
      employerId = enterprise.id;
      income = DEFAULT_PARAMS.minimumWage + Math.random() * 1000;
    }

    const initialSavings = 5000 + Math.random() * 10000;
    
    const resident: Resident = {
      id: generateId(),
      type: 'resident',
      name: generateName(),
      employed,
      employerId,
      income,
      savings: initialSavings,
      consumption: 0,
      debt: 0,
      assets: 0,
      mood: 50,
      personality,
      position: pos,
      history: [],
    };
    
    resident.mood = calculateMood(resident);
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
    events: [],
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
    const personality = resident.personality;
    let consumptionAmount: number;
    let eventToRecord: string | undefined;

    if (resident.employed) {
      const disposableIncome = resident.income * (1 - params.taxRate);
      const baseConsumption = disposableIncome * GAME_CONFIG.CONSUMPTION_RATE * (1 - params.consumptionTax);
      consumptionAmount = baseConsumption * personality.consumptionMultiplier;

      if (personality.type === 'consumer' && Math.random() < 0.3) {
        const overspend = consumptionAmount * 0.3;
        consumptionAmount += overspend;
        if (resident.savings < consumptionAmount) {
          const debtNeeded = consumptionAmount - resident.savings;
          resident.debt += debtNeeded;
          eventToRecord = `超前消费 ¥${debtNeeded.toFixed(0)}`;
          addEvent(state, createEvent(
            'debt_change',
            `${resident.name} 超前消费`,
            `${resident.name} 为了消费背负了 ¥${debtNeeded.toFixed(0)} 的债务`,
            state.day,
            'negative',
            resident.id,
            resident.name,
            debtNeeded
          ));
        }
      }

      resident.consumption = consumptionAmount;
      const savingsChange = disposableIncome - consumptionAmount;
      resident.savings += savingsChange;
    } else {
      consumptionAmount = Math.min(resident.savings * 0.5, GAME_CONFIG.UNEMPLOYMENT_BENEFIT);
      resident.consumption = consumptionAmount;
      resident.savings -= consumptionAmount;

      if (resident.savings < 0) {
        resident.debt += Math.abs(resident.savings);
        resident.savings = 0;
      }
    }

    if (consumptionAmount > 0) {
      shops.forEach(shop => {
        const shopShare = Math.max(shop.revenue, 1000) / totalShopRevenue;
        const consumptionForShop = consumptionAmount * shopShare;
        shop.revenue += consumptionForShop * (1 + params.consumptionTax);
      });
    }

    recordResidentHistory(resident, state.day, eventToRecord);
  });
}

function simulateInvestment(state: GameState): void {
  const residents = state.entities.filter(e => e.type === 'resident') as Resident[];

  residents.forEach(resident => {
    const personality = resident.personality;
    
    if (resident.savings < GAME_CONFIG.HOUSE_PRICE * 0.3) return;
    if (Math.random() > personality.investmentChance * 0.1) return;

    const investmentAmount = Math.min(resident.savings * 0.3, GAME_CONFIG.HOUSE_PRICE * 0.5);
    
    if (personality.type === 'speculator') {
      const isGain = Math.random() > GAME_CONFIG.INVESTMENT_RISK;
      
      if (isGain) {
        const gain = investmentAmount * GAME_CONFIG.INVESTMENT_RETURN_RATE * (1 + Math.random());
        resident.savings += gain;
        resident.assets += gain * 0.5;
        addEvent(state, createEvent(
          'investment_gain',
          `${resident.name} 投资获利`,
          `${resident.name} 的投资获得了 ¥${gain.toFixed(0)} 的收益`,
          state.day,
          'positive',
          resident.id,
          resident.name,
          gain
        ));
      } else {
        const loss = investmentAmount * GAME_CONFIG.INVESTMENT_RISK * (1 + Math.random());
        resident.savings -= loss;
        resident.assets = Math.max(0, resident.assets - loss * 0.3);
        addEvent(state, createEvent(
          'investment_loss',
          `${resident.name} 投资亏损`,
          `${resident.name} 的投资亏损了 ¥${loss.toFixed(0)}`,
          state.day,
          'negative',
          resident.id,
          resident.name,
          loss
        ));
      }
    }
    
    if (personality.type === 'frugal' && resident.savings >= GAME_CONFIG.HOUSE_PRICE * 0.8) {
      if (Math.random() < 0.05) {
        const houseCost = GAME_CONFIG.HOUSE_PRICE;
        resident.savings -= houseCost;
        resident.assets += houseCost;
        addEvent(state, createEvent(
          'asset_purchase',
          `${resident.name} 购置房产`,
          `${resident.name} 花费 ¥${houseCost.toFixed(0)} 购置了房产`,
          state.day,
          'positive',
          resident.id,
          resident.name,
          houseCost
        ));
      }
    }
  });
}

function simulateDebtInterest(state: GameState): void {
  const residents = state.entities.filter(e => e.type === 'resident') as Resident[];

  residents.forEach(resident => {
    if (resident.debt > 0) {
      const interest = resident.debt * GAME_CONFIG.DEBT_INTEREST_RATE;
      resident.debt += interest;
      
      if (resident.savings >= resident.debt && resident.personality.type !== 'consumer') {
        if (Math.random() < 0.3) {
          resident.savings -= resident.debt;
          addEvent(state, createEvent(
            'debt_change',
            `${resident.name} 还清债务`,
            `${resident.name} 还清了所有债务，共计 ¥${resident.debt.toFixed(0)}`,
            state.day,
            'positive',
            resident.id,
            resident.name,
            resident.debt
          ));
          resident.debt = 0;
        }
      }

      if (resident.debt > resident.income * 24 && resident.assets > 0) {
        const assetSale = Math.min(resident.assets, resident.debt * 0.5);
        resident.assets -= assetSale;
        resident.debt -= assetSale;
        addEvent(state, createEvent(
          'bankruptcy',
          `${resident.name} 被迫变卖资产`,
          `${resident.name} 因债务过高被迫变卖价值 ¥${assetSale.toFixed(0)} 的资产`,
          state.day,
          'negative',
          resident.id,
          resident.name,
          assetSale
        ));
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
          addEvent(state, createEvent(
            'job_change',
            `${resident.name} 被裁员`,
            `${resident.name} 失去了工作`,
            state.day,
            'negative',
            resident.id,
            resident.name
          ));
        }
        enterprise.employeeCount--;
      }
    }
    
    if (history.length >= GAME_CONFIG.HIRE_THRESHOLD_DAYS) {
      const recent = history.slice(-GAME_CONFIG.HIRE_THRESHOLD_DAYS);
      const isGrowing = recent.every((val, i, arr) => i === 0 || val > arr[i - 1]);
      
      if (isGrowing && unemployedResidents.length > 0) {
        const motivatedResidents = unemployedResidents.filter(
          r => Math.random() < r.personality.workMotivation
        );
        
        const candidates = motivatedResidents.length > 0 ? motivatedResidents : unemployedResidents;
        const newHire = candidates[Math.floor(Math.random() * candidates.length)];
        
        const idx = unemployedResidents.findIndex(r => r.id === newHire.id);
        if (idx > -1) unemployedResidents.splice(idx, 1);
        
        newHire.employed = true;
        newHire.employerId = enterprise.id;
        newHire.income = state.params.minimumWage;
        enterprise.employeeIds.push(newHire.id);
        enterprise.employeeCount++;
        
        addEvent(state, createEvent(
          'job_change',
          `${newHire.name} 找到工作`,
          `${newHire.name} 入职 ${enterprise.name}`,
          state.day,
          'positive',
          newHire.id,
          newHire.name
        ));
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

function simulateMoodChanges(state: GameState): void {
  const residents = state.entities.filter(e => e.type === 'resident') as Resident[];

  residents.forEach(resident => {
    const oldMood = resident.mood;
    const newMood = calculateMood(resident);
    resident.mood = newMood;

    if (Math.abs(newMood - oldMood) > 10) {
      addEvent(state, createEvent(
        'mood_change',
        `${resident.name} 情绪${newMood > oldMood ? '好转' : '恶化'}`,
        `${resident.name} 的情绪指数从 ${oldMood.toFixed(0)} 变为 ${newMood.toFixed(0)}`,
        state.day,
        newMood > oldMood ? 'positive' : 'negative',
        resident.id,
        resident.name
      ));
    }
  });
}

function checkEconomicEvents(state: GameState): void {
  const prevStats = state.history[state.history.length - 2];
  
  if (!prevStats) return;

  if (state.stats.gdpChange > 5) {
    addEvent(state, createEvent(
      'economic_boom',
      '经济繁荣',
      `GDP 增长率达到 ${state.stats.gdpChange.toFixed(2)}%，经济蓬勃发展`,
      state.day,
      'positive'
    ));
  }

  if (state.stats.gdpChange < -3) {
    addEvent(state, createEvent(
      'economic_recession',
      '经济衰退',
      `GDP 增长率为 ${state.stats.gdpChange.toFixed(2)}%，经济陷入衰退`,
      state.day,
      'negative'
    ));
  }

  if (state.stats.priceChange > 3) {
    addEvent(state, createEvent(
      'inflation_warning',
      '通胀预警',
      `物价指数上涨 ${state.stats.priceChange.toFixed(2)}%，通胀压力加大`,
      state.day,
      'negative'
    ));
  }

  if (state.stats.priceChange < -2) {
    addEvent(state, createEvent(
      'deflation_warning',
      '通缩预警',
      `物价指数下跌 ${Math.abs(state.stats.priceChange).toFixed(2)}%，存在通缩风险`,
      state.day,
      'negative'
    ));
  }
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
  simulateInvestment(newState);
  simulateDebtInterest(newState);
  simulateProduction(newState);
  simulateHiringDecisions(newState);
  simulateShopOperations(newState);
  simulateTaxCollection(newState);
  simulateMoodChanges(newState);
  calculateEconomicStats(newState);
  checkEconomicEvents(newState);

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
