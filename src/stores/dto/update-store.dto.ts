import {
  IsBoolean,
  IsOptional,
  IsString,
  isString,
  MaxLength,
} from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  // buka/tutup tokonya
  @IsOptional()
  @IsBoolean()
  is_open?: boolean;
}
