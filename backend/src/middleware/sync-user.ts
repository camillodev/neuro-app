import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { AuthenticatedRequest } from '../types';
import { UserRepository } from '../repositories/user.repository';

const userRepo = new UserRepository();

/**
 * Middleware para sincronizar usuário do Clerk com o banco de dados
 * Deve ser usado APÓS requireAuth em rotas protegidas
 */
export async function syncUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      // Usuário não autenticado, pular sincronização
      next();
      return;
    }

    // Buscar ou criar usuário no banco
    const clerkId = auth.userId;

    // Buscar informações do usuário no Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);

    // Email principal do usuário
    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Usuário sem email cadastrado'
      });
      return;
    }

    // Nome completo ou primeiro nome
    const name = clerkUser.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
      : undefined;

    // Sincronizar usuário (criar se não existir)
    await userRepo.findOrCreateByClerkId(clerkId, email, name);

    // Continuar para o próximo middleware
    next();
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao sincronizar usuário'
    });
  }
}
