import { ReportShareToken } from '@prisma/client';
import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma';

export class ReportTokenRepository {
  /**
   * Cria um novo token de compartilhamento
   */
  async create(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    expiresAt?: Date
  ): Promise<ReportShareToken> {
    const token = nanoid(32); // Gera token único de 32 caracteres

    return await prisma.reportShareToken.create({
      data: {
        userId,
        token,
        dateFrom,
        dateTo,
        expiresAt
      }
    });
  }

  /**
   * Busca token por seu valor
   */
  async findByToken(token: string): Promise<ReportShareToken | null> {
    const shareToken = await prisma.reportShareToken.findUnique({
      where: { token },
      include: {
        user: true
      }
    });

    // Verificar se o token expirou
    if (shareToken && shareToken.expiresAt) {
      if (shareToken.expiresAt < new Date()) {
        return null; // Token expirado
      }
    }

    return shareToken;
  }

  /**
   * Lista todos os tokens de um usuário
   */
  async findByUserId(userId: string): Promise<ReportShareToken[]> {
    return await prisma.reportShareToken.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Deleta um token
   */
  async delete(tokenId: string): Promise<void> {
    await prisma.reportShareToken.delete({
      where: { id: tokenId }
    });
  }

  /**
   * Deleta tokens expirados
   */
  async deleteExpired(): Promise<number> {
    const result = await prisma.reportShareToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }
}
