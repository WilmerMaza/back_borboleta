import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { CreateAttributeCommand } from "../../application/commands/attribute/CreateAttributeCommand";
import { UpdateAttributeCommand } from "../../application/commands/attribute/UpdateAttributeCommand";
import { DeleteAttributeCommand } from "../../application/commands/attribute/DeleteAttributeCommand";
import { UpdateAttributeStatusCommand } from "../../application/commands/attribute/UpdateAttributeStatusCommand";
import { DeleteMultipleAttributesCommand } from "../../application/commands/attribute/DeleteMultipleAttributesCommand";
import { CreateAttributeHandler } from "../../application/command-handlers/attribute/CreateAttributeHandler";
import { UpdateAttributeHandler } from "../../application/command-handlers/attribute/UpdateAttributeHandler";
import { DeleteAttributeHandler } from "../../application/command-handlers/attribute/DeleteAttributeHandler";
import { UpdateAttributeStatusHandler } from "../../application/command-handlers/attribute/UpdateAttributeStatusHandler";
import { DeleteMultipleAttributesHandler } from "../../application/command-handlers/attribute/DeleteMultipleAttributesHandler";
import { GetAllAttributesQuery } from "../../application/queries/attribute/GetAllAttributesQuery";
import { GetAttributeByIdQuery } from "../../application/queries/attribute/GetAttributeByIdQuery";
import { GetAllAttributesHandler } from "../../application/query-handlers/attribute/GetAllAttributesHandler";
import { GetAttributeByIdHandler } from "../../application/query-handlers/attribute/GetAttributeByIdHandler";
import { AuthenticatedRequest } from "../../middleware/auth";

@injectable()
export class AttributeController {
  constructor(
    @inject("CreateAttributeHandler")
    private createAttributeHandler: CreateAttributeHandler,
    @inject("UpdateAttributeHandler")
    private updateAttributeHandler: UpdateAttributeHandler,
    @inject("DeleteAttributeHandler")
    private deleteAttributeHandler: DeleteAttributeHandler,
    @inject("UpdateAttributeStatusHandler")
    private updateAttributeStatusHandler: UpdateAttributeStatusHandler,
    @inject("DeleteMultipleAttributesHandler")
    private deleteMultipleAttributesHandler: DeleteMultipleAttributesHandler,
    @inject("GetAllAttributesHandler")
    private getAllAttributesHandler: GetAllAttributesHandler,
    @inject("GetAttributeByIdHandler")
    private getAttributeByIdHandler: GetAttributeByIdHandler
  ) {}

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const attributeData = req.body;
      const createdById = req.user?.userId;

      // Validaciones básicas
      if (!attributeData.name) {
        res.status(400).json({
          success: false,
          message: "El nombre del atributo es requerido",
        });
        return;
      }

      if (!attributeData.style) {
        res.status(400).json({
          success: false,
          message: "El estilo del atributo es requerido",
        });
        return;
      }

      if (!attributeData.value || !Array.isArray(attributeData.value) || attributeData.value.length === 0) {
        res.status(400).json({
          success: false,
          message: "Se requiere al menos un valor para el atributo",
        });
        return;
      }

      const command = new CreateAttributeCommand(attributeData);
      const attribute = await this.createAttributeHandler.handle(command, createdById);

      res.status(201).json({
        success: true,
        message: "Atributo creado exitosamente",
        data: {
          attribute,
        },
      });
    } catch (error: any) {
      console.error("Error al crear atributo:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error al crear el atributo",
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, per_page, search, status, style } = req.query;

      const query = new GetAllAttributesQuery({
        page: page ? parseInt(page as string) : undefined,
        per_page: per_page ? parseInt(per_page as string) : 10,
        search: search as string,
        status: status !== undefined ? status === "true" || status === "1" : undefined,
        style: style as string,
      });

      const result = await this.getAllAttributesHandler.handle(query);

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        current_page: result.current_page,
        per_page: result.per_page,
        last_page: result.last_page,
      });
    } catch (error: any) {
      console.error("Error al obtener atributos:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attributeId = parseInt(id);

      if (isNaN(attributeId)) {
        res.status(400).json({
          success: false,
          message: "ID de atributo inválido",
        });
        return;
      }

      const query = new GetAttributeByIdQuery(attributeId);
      const attribute = await this.getAttributeByIdHandler.handle(query);

      if (!attribute) {
        res.status(404).json({
          success: false,
          message: "Atributo no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: attribute,
      });
    } catch (error: any) {
      console.error("Error al obtener atributo:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attributeId = parseInt(id);

      if (isNaN(attributeId)) {
        res.status(400).json({
          success: false,
          message: "ID de atributo inválido",
        });
        return;
      }

      const attributeData = req.body;

      const command = new UpdateAttributeCommand(attributeId, attributeData);
      const attribute = await this.updateAttributeHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Atributo actualizado exitosamente",
        data: {
          attribute,
        },
      });
    } catch (error: any) {
      console.error("Error al actualizar atributo:", error);

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Error al actualizar el atributo",
      });
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attributeId = parseInt(id);

      if (isNaN(attributeId)) {
        res.status(400).json({
          success: false,
          message: "ID de atributo inválido",
        });
        return;
      }

      const { status } = req.body;

      if (typeof status !== "boolean") {
        res.status(400).json({
          success: false,
          message: "El estado debe ser un valor booleano",
        });
        return;
      }

      const command = new UpdateAttributeStatusCommand(attributeId, status);
      const attribute = await this.updateAttributeStatusHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Estado actualizado exitosamente",
        data: {
          id: attribute.id,
          status: attribute.status,
          updated_at: attribute.updated_at,
        },
      });
    } catch (error: any) {
      console.error("Error al actualizar estado del atributo:", error);

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Error al actualizar el estado del atributo",
      });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attributeId = parseInt(id);

      if (isNaN(attributeId)) {
        res.status(400).json({
          success: false,
          message: "ID de atributo inválido",
        });
        return;
      }

      const command = new DeleteAttributeCommand(attributeId);
      await this.deleteAttributeHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Atributo eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar atributo:", error);

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Error al eliminar el atributo",
      });
    }
  }

  async deleteMultiple(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: "Se requiere un array de IDs válido",
        });
        return;
      }

      const command = new DeleteMultipleAttributesCommand(ids);
      const result = await this.deleteMultipleAttributesHandler.handle(command);

      res.status(200).json({
        success: true,
        message: `${result.deleted} atributo${result.deleted !== 1 ? "s" : ""} eliminado${result.deleted !== 1 ? "s" : ""} exitosamente`,
        data: {
          deleted: result.deleted,
          failed: result.failed,
        },
      });
    } catch (error: any) {
      console.error("Error al eliminar atributos:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error al eliminar los atributos",
      });
    }
  }
}

