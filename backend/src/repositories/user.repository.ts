import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  /**
   * Encontra ou cria um usuário baseado no clerkId
   */
  async findOrCreateByClerkId(
    clerkId: string,
    email: string,
    name?: string
  ): Promise<User> {
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          name
        }
      });
    }

    return user;
  }

  /**
   * Busca usuário por clerkId
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { clerkId }
    });
  }

  /**
   * Busca usuário por ID interno
   */
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * Atualiza informações do usuário
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data
    });
  }
}
