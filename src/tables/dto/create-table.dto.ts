import { IsString, MaxLength } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @MaxLength(50)
  code: string; // Contoh: "Meja 1", "A1", "VIP-01"
}
