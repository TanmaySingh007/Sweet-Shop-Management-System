import { IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class RestockDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Quantity must be a positive integer' })
  quantity: number;
}

