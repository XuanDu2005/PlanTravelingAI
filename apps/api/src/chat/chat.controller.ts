import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard, JwtUser } from '../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('sessions')
  list(@CurrentUser() user: JwtUser) {
    return this.chat.listSessions(user.sub);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtUser) {
    return this.chat.createSession(user.sub);
  }

  @Get('sessions/:id/messages')
  messages(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chat.listMessages(user.sub, id);
  }

  @Post('sessions/:id/messages')
  send(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chat.sendMessage(user.sub, id, dto);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    await this.chat.deleteSession(user.sub, id);
  }
}