import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserRaw {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  surName: string;
}
