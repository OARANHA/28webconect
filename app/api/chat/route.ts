import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages } from 'ai';
import { searchSimilarDocumentsWithScores } from '@/lib/embeddings';
import { selectChatModel } from '@/lib/mistral';
import { sendMessageSchema } from '@/lib/validations/chat';
import type { Message } from '@/types/chat';

/**
 * Extrai conteúdo de uma mensagem do Vercel AI SDK
 * O SDK envia mensagens com 'parts' em vez de 'content'
 */
function extractContentFromMessage(message: any): string {
  if (message.content) {
    return message.content;
  }
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('');
  }
  return '';
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validar entrada
    const body = await req.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      console.error('Erro de validação:', validation.error);
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { messages, sessionId, userId } = validation.data;
    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    const lastUserMessageContent = extractContentFromMessage(lastUserMessage);
    console.log('[Chat API] Query do usuário:', lastUserMessageContent);

    // 2. Buscar documentos similares (RAG)
    let contextText = '';
    let ragContext = '';

    try {
      const relevantDocs = await searchSimilarDocumentsWithScores(
        lastUserMessageContent || '',
        3, // Top 3 documentos
        0.6 // Similaridade mínima
      );

      console.log(`[Chat API] Documentos recuperados: ${relevantDocs.length}`);

      if (relevantDocs.length > 0) {
        ragContext = relevantDocs.map((doc, i) => `[${i + 1}] ${doc.content}`).join('\n\n');

        contextText = `\n\nContexto relevante da base de conhecimento:\n${ragContext}`;
      }
    } catch (error) {
      console.error('[Chat API] Erro na busca RAG:', error);
      // Continuar sem contexto se RAG falhar
    }

    // 3. Construir mensagem de sistema com contexto
    const systemMessage = {
      role: 'system' as const,
      content: `Você é um assistente virtual da 28Web Connect, uma empresa especializada em desenvolvimento web, sistemas ERP, e-commerce e agentes de IA.

INSTRUÇÕES:
- Use o contexto fornecido abaixo para responder perguntas sobre nossos serviços
- Seja conciso, amigável e profissional
- Se não encontrar a resposta no contexto, diga que pode ajudar a esclarecer dúvidas sobre nossos serviços ou que um consultor pode entrar em contato
- Não invente informações que não estejam no contexto
- Responda em português do Brasil
${contextText}`,
    };

    // 4. Preparar mensagens para o modelo
    const allMessages = [
      systemMessage,
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: extractContentFromMessage(m),
      })),
    ];

    // 5. Criar stream de resposta
    const model = selectChatModel('groq');

    const result = await streamText({
      model,
      messages: allMessages,
      temperature: 0.7,
    });

    // 6. Retornar stream no formato esperado pelo Vercel AI SDK
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[Chat API] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
