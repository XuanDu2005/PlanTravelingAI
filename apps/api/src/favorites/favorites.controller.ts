import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() current: JwtUser) {
    return this.favorites.list(current.sub);
  }

  @Get('ids')
  listIds(@CurrentUser() current: JwtUser) {
    return this.favorites.listIds(current.sub);
  }

  @Post(':recommendationId')
  @HttpCode(HttpStatus.OK)
  add(
    @CurrentUser() current: JwtUser,
    @Param('recommendationId') recommendationId: string,
  ) {
    return this.favorites.add(current.sub, recommendationId);
  }

  @Delete(':recommendationId')
  remove(
    @CurrentUser() current: JwtUser,
    @Param('recommendationId') recommendationId: string,
  ) {
    return this.favorites.remove(current.sub, recommendationId);
  }
}
