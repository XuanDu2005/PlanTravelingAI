import { Controller, Delete, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/guards/jwt-auth.guard';

@Controller('trips/:tripId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  list(@CurrentUser() current: JwtUser, @Param('tripId') tripId: string) {
    return this.expenses.list(current.sub, tripId);
  }

  @Post()
  create(
    @CurrentUser() current: JwtUser,
    @Param('tripId') tripId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenses.create(current.sub, tripId, dto);
  }

  @Delete(':expenseId')
  remove(
    @CurrentUser() current: JwtUser,
    @Param('tripId') tripId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expenses.remove(current.sub, tripId, expenseId);
  }
}