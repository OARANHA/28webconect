import { z } from 'zod';

export const sendMessageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      // Aceita tanto o formato antigo com 'content' quanto o novo com 'parts' do Vercel AI SDK
      content: z.string().optional(),
      parts: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          })
        )
        .optional(),
    })
  ),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export const saveChatSessionSchema = z.object({
  userId: z.string(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      createdAt: z.date(),
    })
  ),
});

export const getChatHistorySchema = z.object({
  userId: z.string(),
  limit: z.number().optional().default(10),
});

export const deleteChatSessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SaveChatSessionInput = z.infer<typeof saveChatSessionSchema>;
export type GetChatHistoryInput = z.infer<typeof getChatHistorySchema>;
export type DeleteChatSessionInput = z.infer<typeof deleteChatSessionSchema>;
