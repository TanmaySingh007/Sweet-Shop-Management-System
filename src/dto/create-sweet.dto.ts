import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSweetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0, { message: 'Price must be non-negative' })
  price: number;

  @IsNumber()
  @Min(0, { message: 'Quantity must be non-negative' })
  quantity: number;
}

