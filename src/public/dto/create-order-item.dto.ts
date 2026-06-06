import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemAddonDto } from './create-order-item-addon.dto';

export class CreateOrderItemDto {
  @IsString()
  menu_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemAddonDto)
  addons?: CreateOrderItemAddonDto[];
}
