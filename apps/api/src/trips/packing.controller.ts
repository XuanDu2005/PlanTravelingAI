import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PackingService } from './packing.service';
import { CreatePackingItemDto, UpdatePackingItemDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';
import { AiService } from '../ai/ai.service';

@Controller('trips/:tripId/packing')
@UseGuards(JwtAuthGuard)
export class PackingController {
  constructor(
    private readonly packing: PackingService,
    private readonly ai: AiService,
  ) {}

  @Get()
  list(@CurrentUser() current: JwtUser, @Param('tripId') tripId: string) {
    return this.packing.list(current.sub, tripId);
  }

  @Post()
  create(
    @CurrentUser() current: JwtUser,
    @Param('tripId') tripId: string,
    @Body() dto: CreatePackingItemDto,
  ) {
    return this.packing.create(current.sub, tripId, dto);
  }

  @Post('generate')
  async generate(
    @CurrentUser() current: JwtUser,
    @Param('tripId') tripId: string,
  ) {
    return this.packing.generate(current.sub, tripId, this.ai);
  }

  @Patch(':itemId')
  update(
    @CurrentUser() current: JwtUser,
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePackingItemDto,
  ) {
    return this.packing.update(current.sub, tripId, itemId, dto);
  }

  @Delete(':itemId')
  remove(
    @CurrentUser() current: JwtUser,
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.packing.remove(current.sub, tripId, itemId);
  }
}