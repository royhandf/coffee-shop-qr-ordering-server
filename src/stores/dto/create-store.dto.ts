import { IsString, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
