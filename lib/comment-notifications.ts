import { createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { NotificationType, UserRole } from '@prisma/client';
import type { ProjectComment, Project, User, ProjectMilestone } from '@prisma/client';

interface ProjectWithUser extends Project {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  };
  milestones: ProjectMilestone[];
}

interface CommentWithUser extends ProjectComment {
  user?: {
    id: string;
    name: string | null;
    role: UserRole;
  };
}

/**
 * Notifica destinatários sobre um novo comentário
 * - Cliente comenta → Notifica admins
 * - Admin comenta → Notifica dono do projeto
 */
export async function notifyNewComment(
  comment: CommentWithUser,
  project: ProjectWithUser,
  author: { id: string; name: string | null; role: UserRole }
): Promise<void> {
  const isAuthorAdmin = author.role === UserRole.ADMIN || author.role === UserRole.SUPER_ADMIN;
  const isAuthorClient = author.role === UserRole.CLIENTE;

  const authorName = author.name || 'Usuário';
  const projectName = project.name;
  const actionUrl = `/projetos/${project.id}`;

  // Buscar informações do milestone se houver
  let milestoneName: string | null = null;
  if (comment.milestoneId) {
    const milestone = project.milestones.find((m) => m.id === comment.milestoneId);
    if (milestone) {
      milestoneName = milestone.name;
    }
  }

  // Construir mensagens personalizadas
  const clientMessage = `Novo comentário de ${authorName} no projeto ${projectName}`;
  const adminMessage = `A equipe 28Web respondeu no projeto ${projectName}`;

  if (isAuthorClient) {
    // Cliente comentou → Notificar todos os admins
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const notificationPromises = admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: NotificationType.NOVA_MENSAGEM,
        title: 'Novo comentário em projeto',
        message: milestoneName ? `${clientMessage} (Etapa: ${milestoneName})` : clientMessage,
        metadata: {
          projectId: project.id,
          projectName,
          commentId: comment.id,
          milestoneId: comment.milestoneId,
          milestoneName,
          authorId: author.id,
          authorName,
          actionUrl,
        },
        channels: ['IN_APP', 'EMAIL'],
      })
    );

    await Promise.allSettled(notificationPromises);
  } else if (isAuthorAdmin) {
    // Admin comentou → Notificar dono do projeto
    const ownerMessage = adminMessage;

    await createNotification({
      userId: project.userId,
      type: NotificationType.NOVA_MENSAGEM,
      title: 'Nova resposta da equipe 28Web',
      message: milestoneName ? `${ownerMessage} (Etapa: ${milestoneName})` : ownerMessage,
      metadata: {
        projectId: project.id,
        projectName,
        commentId: comment.id,
        milestoneId: comment.milestoneId,
        milestoneName,
        authorId: author.id,
        authorName,
        actionUrl,
      },
      channels: ['IN_APP', 'EMAIL', 'PUSH'],
    });
  }
}

/**
 * Notifica menções em comentários (funcionalidade futura)
 * Detecta @username no conteúdo e notifica usuários mencionados
 */
export async function notifyMentions(
  content: string,
  comment: CommentWithUser,
  project: ProjectWithUser,
  author: { id: string; name: string | null; role: UserRole }
): Promise<void> {
  // Extrair menções (@username)
  const mentionRegex = /@(\w+)/g;
  const mentions = content.match(mentionRegex);

  if (!mentions || mentions.length === 0) {
    return;
  }

  // Remover duplicados e o @
  const uniqueUsernames = Array.from(new Set(mentions.map((m) => m.slice(1))));

  // Buscar usuários mencionados
  const mentionedUsers = await prisma.user.findMany({
    where: {
      name: {
        in: uniqueUsernames,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Notificar cada usuário mencionado
  const actionUrl = `/projetos/${project.id}`;
  const authorName = author.name || 'Alguém';

  const notificationPromises = mentionedUsers.map((user) =>
    createNotification({
      userId: user.id,
      type: NotificationType.NOVA_MENSAGEM,
      title: 'Você foi mencionado em um comentário',
      message: `${authorName} mencionou você no projeto ${project.name}`,
      metadata: {
        projectId: project.id,
        projectName: project.name,
        commentId: comment.id,
        authorId: author.id,
        authorName,
        actionUrl,
        mentioned: true,
      },
      channels: ['IN_APP', 'EMAIL'],
    })
  );

  await Promise.allSettled(notificationPromises);
}
