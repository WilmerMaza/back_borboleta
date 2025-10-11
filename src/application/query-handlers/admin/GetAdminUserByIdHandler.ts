import { injectable, inject } from 'tsyringe';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { GetAdminUserByIdQuery } from '../../queries/admin/GetAdminUserByIdQuery';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class GetAdminUserByIdHandler {
  constructor(
    @inject('AdminUserRepository') private adminUserRepository: IAdminUserRepository
  ) {}

  async handle(query: GetAdminUserByIdQuery): Promise<any> {
    try {
      Logger.log('Buscando AdminUser por ID:', query.id);

      const adminUser = await this.adminUserRepository.findById(query.id);
      
      if (!adminUser) {
        Logger.log('AdminUser no encontrado:', query.id);
        throw new Error('AdminUser no encontrado');
      }

      Logger.log('✅ AdminUser encontrado:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name
      });

      return adminUser;
    } catch (error: any) {
      Logger.error('Error en GetAdminUserByIdHandler:', error);
      throw error;
    }
  }
}
