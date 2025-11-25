import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { GetAttributeValuesQuery } from "../../application/queries/attribute/GetAttributeValuesQuery";
import { GetAttributeValuesHandler } from "../../application/query-handlers/attribute/GetAttributeValuesHandler";

@injectable()
export class AttributeValueController {
  constructor(
    @inject("GetAttributeValuesHandler")
    private getAttributeValuesHandler: GetAttributeValuesHandler
  ) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { attribute_id, page, per_page } = req.query;

      const query = new GetAttributeValuesQuery({
        attribute_id: attribute_id ? parseInt(attribute_id as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        per_page: per_page ? parseInt(per_page as string) : undefined,
      });

      const result = await this.getAttributeValuesHandler.handle(query);

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
      });
    } catch (error: any) {
      console.error("Error al obtener valores de atributos:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }
}

