import { z } from 'zod';

export const addCommentSchema = z.object({
  projectId: z.string().cuid(),
  milestoneId: z.string().cuid().optional(),
  content: z
    .string()
    .min(1, 'Comentário não pode estar vazio')
    .max(5000, 'Comentário muito longo (máximo 5000 caracteres)'),
});

export const getCommentsSchema = z.object({
  projectId: z.string().cuid(),
  milestoneId: z.string().cuid().optional(),
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

export const deleteCommentSchema = z.object({
  commentId: z.string().cuid(),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type GetCommentsInput = z.infer<typeof getCommentsSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
