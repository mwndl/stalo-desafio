import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export abstract class TenantAwareService<T extends ObjectLiteral> {
  protected abstract repository: Repository<T>;

  protected addTenantFilter(queryBuilder: SelectQueryBuilder<T>, tenantId: string, alias: string = 'entity'): SelectQueryBuilder<T> {
    return queryBuilder.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  protected validateTenantAccess(entity: any, tenantId: string): void {
    if (entity.tenantId !== tenantId) {
      throw AppException.resourceNotBelongsToTenant();
    }
  }
}
