import { Expose } from 'class-transformer';

export class InvoiceResponseDto {
  @Expose()
  id: string;

  @Expose()
  positionForBuyingId: string;

  @Expose()
  amount: string;

  @Expose()
  invoiceDate: string;

  @Expose()
  status: string;
}
