import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserRaw {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  surName: string;
}
