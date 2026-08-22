import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AiChatMessage } from '../ai/ai.types';
import { CHAT_HISTORY_LIMIT, CHAT_SYSTEM_PROMPT } from './chat.constants';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  listSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    });
  }

  async createSession(userId: string) {
    return this.prisma.chatSession.create({
      data: { userId, title: '' },
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    });
  }

  async listMessages(userId: string, sessionId: string) {
    await this.ensureSession(userId, sessionId);
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });
  }

  async sendMessage(userId: string, sessionId: string, dto: SendMessageDto) {
    await this.ensureSession(userId, sessionId);

    const userMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: ChatRole.USER,
        content: dto.content,
      },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    const history = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: CHAT_HISTORY_LIMIT,
      select: { role: true, content: true },
    });

    const messages: AiChatMessage[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...history
        .slice()
        .reverse()
        .map((m) => ({
          role:
            m.role === ChatRole.ASSISTANT
              ? ('assistant' as const)
              : m.role === ChatRole.USER
                ? ('user' as const)
                : ('system' as const),
          content: m.content,
        })),
    ];

    const assistantText = await this.ai.chat(messages);

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: ChatRole.ASSISTANT,
        content: assistantText,
      },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    // Update session title from first user message (best-effort).
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { title: true },
    });
    if (session && !session.title) {
      const title = dto.content.trim().slice(0, 60);
      await this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { title },
      });
    }

    return { userMessage, assistantMessage };
  }

  async deleteSession(userId: string, sessionId: string) {
    await this.ensureSession(userId, sessionId);
    await this.prisma.chatSession.delete({ where: { id: sessionId } });
  }

  private async ensureSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true },
    });
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    return session;
  }
}

// Helper type to keep the service return shape tight.
export type ChatMessageRow = Prisma.ChatMessageGetPayload<{
  select: { id: true; role: true; content: true; createdAt: true };
}>;