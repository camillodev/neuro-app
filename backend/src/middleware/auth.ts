import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware de autenticação usando Clerk
 * Usa a API moderna do @clerk/express com getAuth()
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticação não fornecido'
    });
    return;
  }

  // Adicionar clerkId à requisição para compatibilidade
  (req as AuthenticatedRequest).clerkId = auth.userId;

  next();
}

/**
 * Middleware opcional de autenticação
 * Adiciona userId se o token for válido, mas não bloqueia a requisição
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const auth = getAuth(req);

  if (auth.userId) {
    (req as AuthenticatedRequest).clerkId = auth.userId;
  }

  next();
}
