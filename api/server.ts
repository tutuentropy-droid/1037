import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { gameStateManager } from './models/GameStateManager.js';
import type { EconomicParams } from '../shared/index.js';

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

let gameLoopInterval: NodeJS.Timeout | null = null;

function broadcastState() {
  const state = gameStateManager.getState();
  io.emit('game:state', state);
}

function startGameLoop() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }

  const state = gameStateManager.getState();
  const speed = state.speed;
  const interval = 2000 / speed;

  gameLoopInterval = setInterval(() => {
    const currentState = gameStateManager.getState();
    if (currentState.isRunning) {
      gameStateManager.step();
      broadcastState();
    }
  }, interval);
}

function stopGameLoop() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('game:state', gameStateManager.getState());

  socket.on('game:params:update', (params: Partial<EconomicParams>) => {
    gameStateManager.updateParams(params);
    broadcastState();
  });

  socket.on('game:control', (data: { isRunning: boolean; speed?: number }) => {
    gameStateManager.setControl(data.isRunning, data.speed);
    
    if (data.isRunning) {
      startGameLoop();
    } else {
      stopGameLoop();
    }
    
    broadcastState();
  });

  socket.on('game:step', () => {
    gameStateManager.step();
    broadcastState();
  });

  socket.on('game:reset', () => {
    stopGameLoop();
    gameStateManager.reset();
    broadcastState();
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const connectedClients = io.engine.clientsCount;
    if (connectedClients === 0) {
      stopGameLoop();
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

export default httpServer;
