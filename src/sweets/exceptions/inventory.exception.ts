import { HttpException, HttpStatus } from '@nestjs/common';

export class InventoryException extends HttpException {
  constructor(message: string = 'Item is out of stock') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

