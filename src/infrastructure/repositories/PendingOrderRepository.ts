import { injectable } from 'tsyringe';
import PendingOrderModel, { IPendingOrder } from '../database/models/PendingOrderModel';

@injectable()
export class PendingOrderRepository {
  async create(pendingOrder: Partial<IPendingOrder>): Promise<IPendingOrder> {
    try {
      const newPendingOrder = new PendingOrderModel(pendingOrder);
      const saved = await newPendingOrder.save();
      return saved.toObject();
    } catch (error: any) {
      console.error('❌ Error al crear orden pendiente:', error);
      throw new Error(`Error al crear orden pendiente: ${error.message}`);
    }
  }

  async findByReference(reference: string): Promise<IPendingOrder | null> {
    try {
      const pendingOrder = await PendingOrderModel.findOne({ reference });
      return pendingOrder ? pendingOrder.toObject() : null;
    } catch (error: any) {
      console.error('❌ Error al buscar orden pendiente por reference:', error);
      return null;
    }
  }

  async delete(reference: string): Promise<boolean> {
    try {
      const result = await PendingOrderModel.deleteOne({ reference });
      return result.deletedCount > 0;
    } catch (error: any) {
      console.error('❌ Error al eliminar orden pendiente:', error);
      return false;
    }
  }

  async deleteByReference(reference: string): Promise<boolean> {
    return this.delete(reference);
  }
}




