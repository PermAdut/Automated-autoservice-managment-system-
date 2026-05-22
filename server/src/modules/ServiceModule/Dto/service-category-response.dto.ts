import { Expose } from 'class-transformer';

export class ServiceCategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  parentId: string | null;

  @Expose()
  isActive: boolean;
}
