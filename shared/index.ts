export interface EconomicParams {
  taxRate: number;
  minimumWage: number;
  consumptionTax: number;
}

export type EntityType = 'resident' | 'shop' | 'enterprise';

export interface Resident {
  id: string;
  type: 'resident';
  name: string;
  employed: boolean;
  employerId: string | null;
  income: number;
  savings: number;
  consumption: number;
  position: { x: number; y: number };
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
}

export type Entity = Resident | Shop | Enterprise;

export interface EconomicStats {
  gdp: number;
  gdpChange: number;
  unemploymentRate: number;
  unemploymentChange: number;
  priceIndex: number;
  priceChange: number;
  totalPopulation: number;
  employedPopulation: number;
}

export interface GameState {
  day: number;
  isRunning: boolean;
  speed: number;
  params: EconomicParams;
  stats: EconomicStats;
  entities: Entity[];
  history: EconomicStats[];
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
};

export const GAME_CONFIG = {
  INITIAL_RESIDENTS: 100,
  INITIAL_SHOPS: 10,
  INITIAL_ENTERPRISES: 5,
  CONSUMPTION_RATE: 0.8,
  UNEMPLOYMENT_BENEFIT: 500,
  LAYOFF_THRESHOLD_DAYS: 3,
  HIRE_THRESHOLD_DAYS: 7,
  GRID_SIZE: 16,
};
