import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateItineraryDto {
  @IsObject()
  content!: Record<string, unknown>;
}

export class ReplanDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  dayIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  activityIndex?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ToggleShareDto {
  @IsBoolean()
  enabled!: boolean;
}

export class CreateExpenseDto {
  @IsString({ message: 'Tên khoản chi phải là chuỗi' })
  @MinLength(2, { message: 'Tên khoản chi phải có ít nhất 2 ký tự' })
  @MaxLength(120, { message: 'Tên khoản chi không được vượt quá 120 ký tự' })
  title!: string;

  @IsString({ message: 'Danh mục phải là chuỗi' })
  @MinLength(2, { message: 'Danh mục phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'Danh mục không được vượt quá 50 ký tự' })
  category!: string;

  @IsInt({ message: 'Số tiền phải là số nguyên' })
  @Min(0, { message: 'Số tiền không được âm' })
  @Max(2_000_000_000, {
    message: 'Số tiền mỗi khoản chi không được vượt quá 2.000.000.000 VND (2 tỷ)',
  })
  amount!: number;

  @IsOptional()
  @IsString({ message: 'Người chi trả phải là chuỗi' })
  @MaxLength(100, { message: 'Tên người chi trả không được vượt quá 100 ký tự' })
  paidBy?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày chi tiêu không hợp lệ' })
  spentAt?: string;
}

export class CreatePackingItemDto {
  @IsString({ message: 'Tên đồ dùng phải là chuỗi' })
  @MinLength(1, { message: 'Tên đồ dùng không được để trống' })
  @MaxLength(120, { message: 'Tên đồ dùng không được vượt quá 120 ký tự' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Danh mục phải là chuỗi' })
  @MaxLength(50, { message: 'Danh mục không được vượt quá 50 ký tự' })
  category?: string;

  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải ít nhất là 1' })
  @Max(99, { message: 'Số lượng không được vượt quá 99' })
  quantity?: number;
}

export class UpdatePackingItemDto {
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái đóng gói phải là boolean' })
  isPacked?: boolean;

  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải ít nhất là 1' })
  @Max(99, { message: 'Số lượng không được vượt quá 99' })
  quantity?: number;
}

export class CreateCollaboratorDto {
  @IsEmail()
  email!: string;

  @IsIn(['VIEWER', 'EDITOR'])
  role!: 'VIEWER' | 'EDITOR';
}

export class CreateJournalEntryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;
}

export class CreateBookingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  type!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  provider!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  confirmation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  amount?: number;

  @IsOptional()
  @IsIn(['PLANNED', 'BOOKED', 'CANCELLED'])
  status?: 'PLANNED' | 'BOOKED' | 'CANCELLED';
}

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  confirmation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  amount?: number;

  @IsOptional()
  @IsIn(['PLANNED', 'BOOKED', 'CANCELLED'])
  status?: 'PLANNED' | 'BOOKED' | 'CANCELLED';
}
