import { injectable, inject } from 'tsyringe';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { GetAdminUsersQuery } from '../../queries/admin/GetAdminUsersQuery';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class GetAdminUsersHandler {
  constructor(
    @inject('AdminUserRepository') private adminUserRepository: IAdminUserRepository
  ) {}

  async handle(query: GetAdminUsersQuery): Promise<{
    admin_users: any[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }> {
    try {
      Logger.log('Obteniendo lista de AdminUsers:', {
        page: query.page,
        limit: query.limit,
        search: query.search,
        roleId: query.roleId
      });

      const skip = (query.page - 1) * query.limit;
      
      const adminUsers = await this.adminUserRepository.findAll({
        skip,
        limit: query.limit,
        search: query.search,
        role: query.roleId?.toString()
      });

      const total = await this.adminUserRepository.count({
        role: query.roleId?.toString()
      });

      const lastPage = Math.ceil(total / query.limit);

      const result = {
        admin_users: adminUsers,
        pagination: {
          current_page: query.page,
          per_page: query.limit,
          total,
          last_page: lastPage
        }
      };

      Logger.log('✅ AdminUsers obtenidos:', {
        total: result.pagination.total,
        count: result.admin_users.length,
        page: result.pagination.current_page
      });

      return result;
    } catch (error: any) {
      Logger.error('Error en GetAdminUsersHandler:', error);
      throw error;
    }
  }
}
