import type { Request, Response } from 'express';
import type { EconomicParams, ApiResponse } from '../../shared/index.js';
import { gameStateManager } from '../models/GameStateManager.js';

export function getGameState(req: Request, res: Response) {
  const state = gameStateManager.getState();
  const response: ApiResponse<typeof state> = {
    success: true,
    data: state,
  };
  res.json(response);
}

export function initGame(req: Request, res: Response) {
  const state = gameStateManager.initialize();
  const response: ApiResponse<typeof state> = {
    success: true,
    data: state,
    message: '游戏已初始化',
  };
  res.json(response);
}

export function resetGame(req: Request, res: Response) {
  const state = gameStateManager.reset();
  const response: ApiResponse<typeof state> = {
    success: true,
    data: state,
    message: '游戏已重置',
  };
  res.json(response);
}

export function updateGameParams(req: Request, res: Response) {
  const params = req.body as Partial<EconomicParams>;
  
  if (params.taxRate !== undefined && (params.taxRate < 0 || params.taxRate > 0.5)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: '税率必须在 0-50% 之间',
    });
  }
  
  if (params.minimumWage !== undefined && (params.minimumWage < 1000 || params.minimumWage > 5000)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: '最低工资必须在 1000-5000 之间',
    });
  }
  
  if (params.consumptionTax !== undefined && (params.consumptionTax < 0 || params.consumptionTax > 0.3)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: '消费税必须在 0-30% 之间',
    });
  }

  if (params.interestRate !== undefined && (params.interestRate < 0 || params.interestRate > 0.2)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: '利率必须在 0-20% 之间',
    });
  }

  const state = gameStateManager.updateParams(params);
  const response: ApiResponse<typeof state.params> = {
    success: true,
    data: state.params,
    message: '参数已更新',
  };
  res.json(response);
}

export function stepGame(req: Request, res: Response) {
  const state = gameStateManager.step();
  const response: ApiResponse<typeof state> = {
    success: true,
    data: state,
    message: `已推进到第 ${state.day} 天`,
  };
  res.json(response);
}

export function getEntity(req: Request, res: Response) {
  const { id } = req.params;
  const entity = gameStateManager.getEntity(id);
  
  if (!entity) {
    return res.status(404).json({
      success: false,
      data: null,
      message: '实体不存在',
    });
  }

  const response: ApiResponse<typeof entity> = {
    success: true,
    data: entity,
  };
  res.json(response);
}

export function getHistory(req: Request, res: Response) {
  const history = gameStateManager.getHistory();
  const response: ApiResponse<typeof history> = {
    success: true,
    data: history,
  };
  res.json(response);
}
