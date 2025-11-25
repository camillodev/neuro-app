import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/express';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware de autenticação usando Clerk
 * Valida o token JWT e adiciona o userId na requisição
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token de autenticação não fornecido'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token com Clerk
    const session = await clerkClient.sessions.verifySession(
      token,
      req.body.sessionId
    );

    if (!session || !session.userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token inválido ou expirado'
      });
      return;
    }

    // Adicionar clerkId à requisição
    (req as AuthenticatedRequest).clerkId = session.userId;

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Falha na autenticação'
    });
  }
}

/**
 * Middleware opcional de autenticação
 * Adiciona userId se o token for válido, mas não bloqueia a requisição
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await clerkClient.sessions.verifySession(
        token,
        req.body.sessionId
      );

      if (session && session.userId) {
        (req as AuthenticatedRequest).clerkId = session.userId;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas seguir sem autenticação
    next();
  }
}
