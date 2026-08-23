import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HeroService } from './hero.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller()
export class HeroController {
  constructor(private readonly hero: HeroService) {}

  @Public()
  @Get('hero/slides')
  listPublic() {
    return this.hero.listActiveSlides();
  }

  // Admin endpoints mounted under /admin/hero/slides...
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/hero/slides')
  listAll() {
    return this.hero.listAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/hero/slides')
  create(@Body() dto: CreateHeroSlideDto) {
    return this.hero.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/hero/slides/:id')
  update(@Param('id') id: string, @Body() dto: UpdateHeroSlideDto) {
    return this.hero.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/hero/slides/:id/move')
  move(@Param('id') id: string, @Body() body: { direction?: 'up' | 'down' }) {
    return this.hero.move(id, body?.direction ?? 'down');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/hero/slides/:id')
  remove(@Param('id') id: string) {
    return this.hero.remove(id);
  }
}
