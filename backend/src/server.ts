// Carregar variáveis de ambiente ANTES de qualquer import
import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';
import routes from './routes';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARES =====

// CORS - permitir requisições do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parser de JSON
app.use(express.json());

// Logger simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== ROTAS =====

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NeuroApp Backend'
  });
});

// Rotas da API
app.use('/api', routes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// ===== ERROR HANDLER =====
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Erro não tratado:', error);

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 NeuroApp Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

export default app;
