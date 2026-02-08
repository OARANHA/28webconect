'use server';

import { prisma } from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';
import {
  addCommentSchema,
  getCommentsSchema,
  deleteCommentSchema,
} from '@/lib/validations/comments';
import { notifyNewComment } from '@/lib/comment-notifications';
import type { CommentWithUser, CommentsPaginatedResponse } from '@/types/project';

// Interface de resposta padrão para actions
interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

/**
 * Adiciona um novo comentário a um projeto
 * Valida permissões e dispara notificações
 */
export async function addComment(
  input: unknown,
  userId: string
): Promise<ActionResponse<CommentWithUser>> {
  try {
    // Validar entrada
    const validation = addCommentSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      };
    }

    const { projectId, milestoneId, content } = validation.data;

    // Buscar o projeto e o role do usuário requester
    const [project, requester] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          milestones: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    // Verificar se projeto e requester existem
    if (!project || !requester) {
      return {
        success: false,
        error: 'Projeto não encontrado ou você não tem permissão',
      };
    }

    // Verificar permissões: é dono do projeto OU é admin
    const isOwner = project.userId === userId;
    const isAdmin = requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: 'Você não tem permissão para comentar neste projeto',
      };
    }

    // Verificar se o milestone existe (se fornecido)
    if (milestoneId) {
      const milestoneExists = project.milestones.some((m) => m.id === milestoneId);
      if (!milestoneExists) {
        return {
          success: false,
          error: 'Etapa do projeto não encontrada',
        };
      }
    }

    // Criar o comentário
    const comment = await prisma.projectComment.create({
      data: {
        projectId,
        milestoneId: milestoneId || null,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Buscar informações do autor para notificação
    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!author) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      };
    }

    // Disparar notificações (não bloqueia em caso de erro)
    try {
      await notifyNewComment(comment, project, author);
    } catch (notificationError) {
      console.error('Erro ao enviar notificações:', notificationError);
      // Não falha a criação do comentário se a notificação falhar
    }

    return {
      success: true,
      data: comment as CommentWithUser,
      message: 'Comentário adicionado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao criar comentário. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro inesperado ao criar comentário',
    };
  }
}

/**
 * Busca comentários de um projeto com paginação cursor-based
 */
export async function getCommentsByProject(
  input: unknown,
  userId: string
): Promise<ActionResponse<CommentsPaginatedResponse>> {
  try {
    // Validar entrada
    const validation = getCommentsSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      };
    }

    const { projectId, milestoneId, cursor, limit } = validation.data;

    // Buscar o projeto e o role do usuário requester
    const [project, requester] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    // Verificar se projeto e requester existem
    if (!project || !requester) {
      return {
        success: false,
        error: 'Projeto não encontrado ou você não tem permissão',
      };
    }

    // Verificar permissões: é dono do projeto OU é admin
    const isOwner = project.userId === userId;
    const isAdmin = requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: 'Você não tem permissão para visualizar este projeto',
      };
    }

    // Buscar comentários com cursor pagination
    const comments = await prisma.projectComment.findMany({
      where: {
        projectId,
        milestoneId: milestoneId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1, // Pegar um a mais para verificar hasMore
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      success: true,
      data: {
        comments: items as CommentWithUser[],
        hasMore,
        nextCursor,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao buscar comentários. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro inesperado ao buscar comentários',
    };
  }
}

/**
 * Busca comentários de um milestone específico
 * Wrapper de getCommentsByProject que força milestoneId
 */
export async function getCommentsByMilestone(
  projectId: string,
  milestoneId: string,
  userId: string,
  cursor?: string,
  limit: number = 10
): Promise<ActionResponse<CommentsPaginatedResponse>> {
  return getCommentsByProject({ projectId, milestoneId, cursor, limit }, userId);
}

/**
 * Deleta um comentário
 * Apenas o autor ou admin pode deletar
 */
export async function deleteComment(input: unknown, userId: string): Promise<ActionResponse<void>> {
  try {
    // Validar entrada
    const validation = deleteCommentSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      };
    }

    const { commentId } = validation.data;

    // Buscar o comentário e verificar permissões
    const comment = await prisma.projectComment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!comment) {
      return {
        success: false,
        error: 'Comentário não encontrado',
      };
    }

    // Verificar se usuário é autor ou admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAuthor = comment.userId === userId;
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        error: 'Você não tem permissão para deletar este comentário',
      };
    }

    // Deletar o comentário
    await prisma.projectComment.delete({
      where: { id: commentId },
    });

    return {
      success: true,
      message: 'Comentário removido com sucesso',
    };
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao remover comentário. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro inesperado ao remover comentário',
    };
  }
}
