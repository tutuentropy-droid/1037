export interface EconomicParams {
  taxRate: number;
  minimumWage: number;
  consumptionTax: number;
  interestRate: number;
}

export type EntityType = 'resident' | 'shop' | 'enterprise' | 'house';

export type PersonalityType = 'frugal' | 'consumer' | 'speculator' | 'layabout';

export interface PersonalityInfo {
  type: PersonalityType;
  label: string;
  color: string;
  description: string;
  consumptionMultiplier: number;
  savingsRate: number;
  investmentChance: number;
  workMotivation: number;
}

export const PERSONALITIES: Record<PersonalityType, PersonalityInfo> = {
  frugal: {
    type: 'frugal',
    label: '节俭型',
    color: 'text-emerald-400',
    description: '崇尚节俭，喜欢存钱，消费谨慎',
    consumptionMultiplier: 0.6,
    savingsRate: 0.6,
    investmentChance: 0.05,
    workMotivation: 0.9,
  },
  consumer: {
    type: 'consumer',
    label: '消费型',
    color: 'text-rose-400',
    description: '喜欢消费，容易超前消费，享受当下',
    consumptionMultiplier: 1.4,
    savingsRate: 0.1,
    investmentChance: 0.1,
    workMotivation: 0.7,
  },
  speculator: {
    type: 'speculator',
    label: '投机型',
    color: 'text-amber-400',
    description: '喜欢投资冒险，追求高收益，容易大起大落',
    consumptionMultiplier: 0.9,
    savingsRate: 0.3,
    investmentChance: 0.4,
    workMotivation: 0.6,
  },
  layabout: {
    type: 'layabout',
    label: '躺平型',
    color: 'text-slate-400',
    description: '无欲无求，工作积极性低，满足于基本生活',
    consumptionMultiplier: 0.5,
    savingsRate: 0.4,
    investmentChance: 0.02,
    workMotivation: 0.2,
  },
};

export type EventType =
  | 'income_change'
  | 'job_change'
  | 'debt_change'
  | 'asset_purchase'
  | 'asset_sale'
  | 'mood_change'
  | 'bankruptcy'
  | 'investment_gain'
  | 'investment_loss'
  | 'economic_boom'
  | 'economic_recession'
  | 'policy_change'
  | 'inflation_warning'
  | 'deflation_warning';

export interface EconomicEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  day: number;
  timestamp: number;
  impact?: 'positive' | 'negative' | 'neutral';
  entityId?: string;
  entityName?: string;
  amount?: number;
}

export interface ResidentHistoryEntry {
  day: number;
  income: number;
  savings: number;
  debt: number;
  mood: number;
  event?: string;
}

export type ResidentActivity = 'idle' | 'working' | 'shopping' | 'home';

export interface Resident {
  id: string;
  type: 'resident';
  name: string;
  employed: boolean;
  employerId: string | null;
  income: number;
  savings: number;
  consumption: number;
  debt: number;
  assets: number;
  mood: number;
  personality: PersonalityInfo;
  position: { x: number; y: number };
  homePosition: { x: number; y: number };
  targetPosition: { x: number; y: number } | null;
  activity: ResidentActivity;
  ownedHouseId: string | null;
  rentedHouseId: string | null;
  history: ResidentHistoryEntry[];
}

export interface Shop {
  id: string;
  type: 'shop';
  name: string;
  revenue: number;
  expenses: number;
  inventory: number;
  priceLevel: number;
  position: { x: number; y: number };
  revenueHistory: number[];
}

export interface Enterprise {
  id: string;
  type: 'enterprise';
  name: string;
  revenue: number;
  expenses: number;
  employeeCount: number;
  employeeIds: string[];
  production: number;
  position: { x: number; y: number };
  revenueHistory: number[];
  landHoldings: number;
  landValue: number;
}

export type HouseStatus = 'empty' | 'owned' | 'rented';
export type HouseOwnerType = 'resident' | 'enterprise' | 'bank';

export interface House {
  id: string;
  type: 'house';
  name: string;
  price: number;
  rent: number;
  status: HouseStatus;
  ownerType: HouseOwnerType | null;
  ownerId: string | null;
  tenantId: string | null;
  position: { x: number; y: number };
  priceHistory: number[];
}

export type Entity = Resident | Shop | Enterprise | House;

export interface HousingStats {
  avgHousePrice: number;
  avgRent: number;
  vacancyRate: number;
  homeownershipRate: number;
  totalHouses: number;
  priceChange: number;
}

export interface EconomicStats {
  gdp: number;
  gdpChange: number;
  unemploymentRate: number;
  unemploymentChange: number;
  priceIndex: number;
  priceChange: number;
  totalPopulation: number;
  employedPopulation: number;
  housing: HousingStats;
  totalLoans: number;
  avgInterestRate: number;
}

export interface GameState {
  day: number;
  isRunning: boolean;
  speed: number;
  params: EconomicParams;
  stats: EconomicStats;
  entities: Entity[];
  history: EconomicStats[];
  events: EconomicEvent[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const DEFAULT_PARAMS: EconomicParams = {
  taxRate: 0.2,
  minimumWage: 2000,
  consumptionTax: 0.1,
  interestRate: 0.05,
};

export const GAME_CONFIG = {
  INITIAL_RESIDENTS: 100,
  INITIAL_SHOPS: 10,
  INITIAL_ENTERPRISES: 5,
  INITIAL_HOUSES: 80,
  CONSUMPTION_RATE: 0.8,
  UNEMPLOYMENT_BENEFIT: 500,
  LAYOFF_THRESHOLD_DAYS: 3,
  HIRE_THRESHOLD_DAYS: 7,
  GRID_SIZE: 16,
  MAX_HISTORY_ENTRIES: 30,
  MAX_EVENTS: 100,
  HOUSE_PRICE: 50000,
  HOUSE_RENT_RATIO: 0.01,
  INVESTMENT_RETURN_RATE: 0.08,
  INVESTMENT_RISK: 0.3,
  DEBT_INTEREST_RATE: 0.005,
  LAND_SPECULATION_PROFIT_THRESHOLD: 0.3,
  LOAN_MAX_INCOME_RATIO: 5,
};
