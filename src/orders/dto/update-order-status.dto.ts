import { IsIn } from 'class-validator';

// Status yang bisa diubah oleh staff/owner
// waiting_payment → queued (setelah bayar)
// queued → processing (barista mulai buat)
// processing → ready (sudah siap diambil)
// ready → completed (customer ambil)
// * → cancelled (bisa dari status manapun sebelum completed)
export class UpdateOrderStatusDto {
  @IsIn(['queued', 'processing', 'ready', 'completed', 'cancelled'])
  order_status: string;
}
