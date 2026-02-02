import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { ITaxRepository } from "../../domain/repositories/ITaxRepository";
import { AuthenticatedRequest } from "../../middleware/auth";
import { TaxCreateRequest, TaxUpdateRequest, ITax } from "../../domain/entities/Tax";

@injectable()
export class TaxController {
  constructor(
    @inject("TaxRepository") private taxRepository: ITaxRepository
  ) {}

  // GET /api/taxes - Listar impuestos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 10;
      const sort_by = req.query.sort_by as string;
      const sort_direction = (req.query.sort_direction as 'asc' | 'desc') || 'desc';
      const search = req.query.search as string;

      const result = await this.taxRepository.findAll({
        page,
        per_page,
        sort_by,
        sort_direction,
        search
      });

      res.status(200).json({
        data: result.data,
        total: result.total,
        current_page: result.current_page,
        per_page: result.per_page
      });
    } catch (error: any) {
      console.error("Error al obtener impuestos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // GET /api/taxes/:id - Obtener un impuesto por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const taxId = parseInt(id);

      if (isNaN(taxId) || taxId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de impuesto inválido"
        });
        return;
      }

      const tax = await this.taxRepository.findById(taxId);

      if (!tax) {
        res.status(404).json({
          success: false,
          message: "Impuesto no encontrado"
        });
        return;
      }

      res.status(200).json(tax);
    } catch (error: any) {
      console.error("Error al obtener impuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // POST /api/taxes - Crear impuesto
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const taxData: TaxCreateRequest = req.body;
      const createdById = req.user?.userId;

      // Validaciones
      if (!taxData.name || taxData.name.trim() === '') {
        res.status(400).json({
          success: false,
          message: "El nombre del impuesto es requerido"
        });
        return;
      }

      if (taxData.rate === undefined || taxData.rate === null) {
        res.status(400).json({
          success: false,
          message: "La tasa del impuesto es requerida"
        });
        return;
      }

      if (typeof taxData.rate !== 'number' || taxData.rate < 0 || taxData.rate > 100) {
        res.status(400).json({
          success: false,
          message: "La tasa debe ser un número entre 0 y 100"
        });
        return;
      }

      // Normalizar status (puede venir como booleano o número 1/0)
      let status = true;
      if (taxData.status !== undefined) {
        if (typeof taxData.status === 'boolean') {
          status = taxData.status;
        } else if (typeof taxData.status === 'number') {
          status = taxData.status === 1;
        }
      }

      const tax = await this.taxRepository.create({
        name: taxData.name.trim(),
        rate: taxData.rate,
        country_id: taxData.country_id,
        state_id: taxData.state_id,
        pincode: taxData.pincode,
        city: taxData.city?.trim(),
        status,
        created_by_id: createdById
      });

      res.status(201).json(tax);
    } catch (error: any) {
      console.error("Error al crear impuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // PUT /api/taxes/:id - Actualizar impuesto
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const taxId = parseInt(id);
      const updateData: TaxUpdateRequest = req.body;

      if (isNaN(taxId) || taxId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de impuesto inválido"
        });
        return;
      }

      // Verificar que el impuesto existe
      const existingTax = await this.taxRepository.findById(taxId);
      if (!existingTax) {
        res.status(404).json({
          success: false,
          message: "Impuesto no encontrado"
        });
        return;
      }

      // Validar rate si se proporciona
      if (updateData.rate !== undefined) {
        if (typeof updateData.rate !== 'number' || updateData.rate < 0 || updateData.rate > 100) {
          res.status(400).json({
            success: false,
            message: "La tasa debe ser un número entre 0 y 100"
          });
          return;
        }
      }

      // Normalizar status si se proporciona
      if (updateData.status !== undefined) {
        if (typeof updateData.status === 'boolean') {
          updateData.status = updateData.status;
        } else if (typeof updateData.status === 'number') {
          updateData.status = updateData.status === 1;
        }
      }

      // Preparar datos de actualización
      const taxUpdate: Partial<ITax> = {};
      if (updateData.name !== undefined) {
        taxUpdate.name = updateData.name.trim();
      }
      if (updateData.rate !== undefined) {
        taxUpdate.rate = updateData.rate;
      }
      if (updateData.country_id !== undefined) {
        taxUpdate.country_id = updateData.country_id;
      }
      if (updateData.state_id !== undefined) {
        taxUpdate.state_id = updateData.state_id;
      }
      if (updateData.pincode !== undefined) {
        taxUpdate.pincode = updateData.pincode;
      }
      if (updateData.city !== undefined) {
        taxUpdate.city = updateData.city.trim();
      }
      if (updateData.status !== undefined) {
        taxUpdate.status = updateData.status as boolean;
      }

      const updatedTax = await this.taxRepository.update(taxId, taxUpdate);

      if (!updatedTax) {
        res.status(404).json({
          success: false,
          message: "Impuesto no encontrado"
        });
        return;
      }

      res.status(200).json(updatedTax);
    } catch (error: any) {
      console.error("Error al actualizar impuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // PUT/PATCH /api/taxes/:id/status - Actualizar estado
  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const taxId = parseInt(id);
      const { status } = req.body;

      if (isNaN(taxId) || taxId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de impuesto inválido"
        });
        return;
      }

      // Normalizar status
      let normalizedStatus: boolean;
      if (typeof status === 'boolean') {
        normalizedStatus = status;
      } else if (typeof status === 'number') {
        normalizedStatus = status === 1;
      } else {
        res.status(400).json({
          success: false,
          message: "El estado debe ser un valor booleano o 1/0"
        });
        return;
      }

      const updatedTax = await this.taxRepository.updateStatus(taxId, normalizedStatus);

      if (!updatedTax) {
        res.status(404).json({
          success: false,
          message: "Impuesto no encontrado"
        });
        return;
      }

      res.status(200).json(updatedTax);
    } catch (error: any) {
      console.error("Error al actualizar estado del impuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // DELETE /api/taxes/:id - Eliminar un impuesto
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const taxId = parseInt(id);

      if (isNaN(taxId) || taxId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de impuesto inválido"
        });
        return;
      }

      const deleted = await this.taxRepository.delete(taxId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Impuesto no encontrado"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Impuesto eliminado exitosamente"
      });
    } catch (error: any) {
      console.error("Error al eliminar impuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // POST /api/taxes/delete-multiple - Eliminar múltiples impuestos
  async deleteMultiple(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: "Se requiere un array de IDs válido"
        });
        return;
      }

      const result = await this.taxRepository.deleteMultiple(ids);

      res.status(200).json({
        success: true,
        message: `${result.deleted} impuesto${result.deleted !== 1 ? "s" : ""} eliminado${result.deleted !== 1 ? "s" : ""} exitosamente`,
        data: {
          deleted: result.deleted,
          failed: result.failed
        }
      });
    } catch (error: any) {
      console.error("Error al eliminar impuestos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }
}
