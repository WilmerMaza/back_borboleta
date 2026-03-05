import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { CreateProductCommand } from "../../application/commands/product/CreateProductCommand";
import { CreateProductHandler } from "../../application/command-handlers/product/CreateProductHandler";
import { GetProductsHandler } from "../../application/command-handlers/product/GetProductsHandler";
import { GetProductByIdHandler } from "../../application/query-handlers/product/GetProductByIdHandler";
import { GetProductBySlugCommand } from "../../application/commands/product/GetProductBySlugCommand";
import { GetProductBySlugHandler } from "../../application/command-handlers/product/GetProductBySlugHandler";
import { UpdateProductCommand } from "../../application/commands/product/UpdateProductCommand";
import { UpdateProductHandler } from "../../application/command-handlers/product/UpdateProductHandler";
import { DeleteProductCommand } from "../../application/commands/product/DeleteProductCommand";
import { DeleteProductHandler } from "../../application/command-handlers/product/DeleteProductHandler";
import mongoose from "mongoose";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository";
import { parseIncludeParam } from "../../shared/utils/requestParams";
import { ProductRepository } from "../../infrastructure/repositories/ProductRepository";
import { IAttachmentRepository } from "../../domain/repositories/IAttachmentRepository";
import { IAttributeRepository } from "../../domain/repositories/IAttributeRepository";
import AttributeModel from "../../infrastructure/database/models/AttributeModel";


@injectable()
export class ProductController {
  constructor(
    @inject("CreateProductHandler")
    private createProductHandler: CreateProductHandler,
    @inject("GetProductsHandler")
    private getProductsHandler: GetProductsHandler,
    @inject("GetProductByIdHandler")
    private getProductByIdHandler: GetProductByIdHandler,
    @inject("GetProductBySlugHandler")
    private getProductBySlugHandler: GetProductBySlugHandler,
    @inject("UpdateProductHandler")
    private updateProductHandler: UpdateProductHandler,
    @inject("DeleteProductHandler")
    private deleteProductHandler: DeleteProductHandler,
    @inject("CategoryRepository")
    private categoryRepository: CategoryRepository,
    @inject("ProductRepository")
    private productRepository: ProductRepository,
    @inject("IAttachmentRepository")
    private attachmentRepository: IAttachmentRepository,
    @inject("AttributeRepository")
    private attributeRepository: IAttributeRepository
  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validar precio
      if (req.body.price === undefined || req.body.price === null) {
        throw new Error("El precio es requerido");
      }

      const price = Number(req.body.price);
      if (isNaN(price) || price < 0) {
        throw new Error(
          "El precio debe ser un número válido mayor o igual a 0"
        );
      }

  
      const productData: any = {
        ...req.body,
        price,
        tags: [], 
      };

      // Validar y transformar categorías si existen
      if (Array.isArray(productData.categories)) {
        const validatedCategories: mongoose.Types.ObjectId[] = [];

        for (const id of productData.categories) {
          const category = await this.categoryRepository.findByAutoIncrementId(
            id
          );
          if (!category) {
            throw new Error(`La categoría con ID ${id} no existe`);
          }

          // Convertir el _id de MongoDB a ObjectId para la referencia
          validatedCategories.push(new mongoose.Types.ObjectId((category as any)._id));
        }

        productData.categories = validatedCategories;
      }

      // Validar y transformar atributos si existen
      if (productData.attributes_ids && Array.isArray(productData.attributes_ids)) {
        const validatedAttributes: mongoose.Types.ObjectId[] = [];

        for (const id of productData.attributes_ids) {
          const attribute = await this.attributeRepository.findById(id);
          if (!attribute) {
            throw new Error(`El atributo con ID ${id} no existe`);
          }

          // Buscar el documento de Attribute en MongoDB para obtener el _id
          const attributeDoc = await AttributeModel.findOne({ id: id });
          
          if (attributeDoc) {
            // Convertir el _id de MongoDB a ObjectId para la referencia
            validatedAttributes.push(new mongoose.Types.ObjectId(attributeDoc._id));
          } else {
            throw new Error(`No se encontró el documento de Attribute con ID ${id}`);
          }
        }

        productData.attributes = validatedAttributes;
        // Eliminar el campo temporal
        delete productData.attributes_ids;
      }

      // Procesar product_galleries_id
      if (Array.isArray(productData.product_galleries_id)) {
        const galleries = [];
        for (const id of productData.product_galleries_id) {
          const attachment = await this.attachmentRepository.findById(id);
          if (attachment) {
            galleries.push({
              id: attachment.id,
              name: attachment.name,
              disk: attachment.disk,
              file_name: attachment.file_name,
              mime_type: attachment.mime_type,
              asset_url: attachment.asset_url,
              original_url: attachment.original_url
            });
          }
        }
        productData.product_galleries = galleries;
        // Eliminar el campo temporal
        delete productData.product_galleries_id;
      }

      // Procesar product_thumbnail_id
      if (productData.product_thumbnail_id) {
        const thumbnail = await this.attachmentRepository.findById(productData.product_thumbnail_id);
        if (thumbnail) {
          productData.product_thumbnail = {
            id: thumbnail.id,
            name: thumbnail.name,
            disk: thumbnail.disk,
            file_name: thumbnail.file_name,
            mime_type: thumbnail.mime_type,
            asset_url: thumbnail.asset_url,
            original_url: thumbnail.original_url
          };
        }
        // Eliminar el campo temporal
        delete productData.product_thumbnail_id;
      }

      // Procesar variations si existen
      if (productData.variations !== undefined) {
        try {
          // Si variations viene como string, parsearlo
          let variationsData = productData.variations;
          if (typeof variationsData === 'string') {
            variationsData = JSON.parse(variationsData);
          }

          // Si es un array, procesar cada variación
          if (Array.isArray(variationsData)) {
            const processedVariations = [];

            for (const variation of variationsData) {
              const processedVariation: any = {
                ...variation,
              };

              // Procesar attribute_values si existen
              if (variation.attribute_values && Array.isArray(variation.attribute_values)) {
                // Los attribute_values ya vienen como IDs numéricos, mantenerlos así
                processedVariation.attribute_values = variation.attribute_values;
              }

              // Procesar variation_image_id si existe
              if (variation.variation_image_id) {
                const variationImage = await this.attachmentRepository.findById(variation.variation_image_id);
                if (variationImage) {
                  processedVariation.variation_image = {
                    id: variationImage.id,
                    name: variationImage.name,
                    disk: variationImage.disk,
                    file_name: variationImage.file_name,
                    mime_type: variationImage.mime_type,
                    asset_url: variationImage.asset_url,
                    original_url: variationImage.original_url
                  };
                }
                // Eliminar el campo temporal
                delete processedVariation.variation_image_id;
              }

              // Procesar variation_galleries_id si existe
              if (variation.variation_galleries_id && Array.isArray(variation.variation_galleries_id)) {
                const galleries = [];
                for (const id of variation.variation_galleries_id) {
                  const attachment = await this.attachmentRepository.findById(id);
                  if (attachment) {
                    galleries.push({
                      id: attachment.id,
                      name: attachment.name,
                      disk: attachment.disk,
                      file_name: attachment.file_name,
                      mime_type: attachment.mime_type,
                      asset_url: attachment.asset_url,
                      original_url: attachment.original_url
                    });
                  }
                }
                processedVariation.variation_galleries = galleries;
                // Eliminar el campo temporal
                delete processedVariation.variation_galleries_id;
              }

              processedVariations.push(processedVariation);
            }

            productData.variations = processedVariations;
          } else {
            // Si no es un array válido, establecer como array vacío
            productData.variations = [];
          }
        } catch (error) {
          console.error("❌ Error procesando variations:", error);
          // En caso de error, establecer como array vacío para no romper la creación
          productData.variations = [];
        }
      }

      // Ejecutar el comando
      const command = new CreateProductCommand(productData);
      const product = await this.createProductHandler.handle(command);

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error("❌ Error al crear producto:", error.message);

      // Errores de validación de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        res.status(400).json({
          success: false,
          message: "Error de validación",
          details: validationErrors,
        });
        return;
      }

      // Otros errores
      res.status(400).json({
        success: false,
        message: error.message || "Error al crear el producto",
        details: error?.errors || null,
      });
    }
  }

  async getProductsWithDiscount(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        this.productRepository.findAllWithDiscount({ skip, limit }),
        this.productRepository.countWithDiscount(),
      ]);

      res.status(200).json({
        success: true,
        current_page: page,
        data: products,
        from: skip + 1,
        last_page: Math.ceil(total / limit) || 1,
        per_page: limit,
        to: Math.min(skip + limit, total),
        total,
      });
    } catch (error: any) {
      console.error("❌ Error al obtener productos con descuento:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los productos con descuento",
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.getProductsHandler.handle({ page, limit });

      res.status(200).json({
        current_page: 1,
        data: result.products,
        first_page_url: "",
        from: 1,
        last_page: 1,
        last_page_url: "",
        links: [
          {
            url: null,
            label: "&laquo; Previous",
            active: false,
          },
          {
            url: "",
            label: "1",
            active: true,
          },
          {
            url: null,
            label: "Next &raquo;",
            active: false,
          },
        ],
        next_page_url: null,
        path: "",
        per_page: result.total,
        prev_page_url: null,
        to: result.total,
        total: result.total,
      });
    } catch (error: any) {
      console.error("❌ Error al obtener productos:", error.message);

      res.status(400).json({
        success: false,
        message: error.message || "Error al obtener los productos",
        details: error?.errors || null,
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || id === "undefined" || id === "null") {
        res.status(400).json({
          success: false,
          message: "El ID del producto es requerido",
        });
        return;
      }

      // Convertir ID a número si es string
      const productId = typeof id === 'string' ? parseInt(id) : id;
      
      // Validar que el ID sea un número válido
      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({
          success: false,
          message: "El ID del producto debe ser un número válido",
        });
        return;
      }

      const include = parseIncludeParam(req.query.include);
      const product = await this.getProductByIdHandler.handle(productId, {
        include: include.length > 0 ? include : undefined,
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error("❌ Error al obtener producto por ID:", error.message);

      res.status(400).json({
        success: false,
        message: error.message || "Error al obtener el producto",
        details: error?.errors || null,
      });
    }
  }

  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "El slug es requerido",
        });
        return;
      }

      const include = parseIncludeParam(req.query.include);
      const command = new GetProductBySlugCommand(slug);
      const product = await this.getProductBySlugHandler.handle(command, {
        include: include.length > 0 ? include : undefined,
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error("❌ Error al obtener producto por slug:", error.message);

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Error al obtener el producto",
        details: error?.errors || null,
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || id === "undefined" || id === "null") {
        res.status(400).json({
          success: false,
          message: "El ID del producto es requerido y debe ser válido",
        });
        return;
      }

      // Convertir ID a número si es string
      const productId = typeof id === 'string' ? parseInt(id) : id;
      
      // Validar que el ID sea un número válido
      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({
          success: false,
          message: "El ID del producto debe ser un número válido",
        });
        return;
      }

      console.log("📦 Actualizando producto con ID:", productId);
      console.log("📦 Datos de actualización:", JSON.stringify(req.body, null, 2));

      // Validar que el precio sea un número válido si se está actualizando
      if (req.body.price !== undefined && req.body.price !== null) {
        const price = Number(req.body.price);
        if (isNaN(price) || price < 0) {
          throw new Error(
            "El precio debe ser un número válido mayor o igual a 0"
          );
        }
        req.body.price = price;
      }

      // Procesar product_galleries_id si existe
      if (Array.isArray(req.body.product_galleries_id)) {
        console.log("🖼️ Procesando galería de imágenes:", req.body.product_galleries_id);
        const galleries = [];
        for (const attachmentId of req.body.product_galleries_id) {
          try {
            console.log("🔍 Buscando attachment con ID:", attachmentId);
            const attachment = await this.attachmentRepository.findById(attachmentId);
            if (attachment) {
              galleries.push({
                id: attachment.id,
                name: attachment.name,
                disk: attachment.disk,
                file_name: attachment.file_name,
                mime_type: attachment.mime_type,
                asset_url: attachment.asset_url,
                original_url: attachment.original_url
              });
              console.log("✅ Imagen de galería agregada:", attachment.file_name);
            } else {
              console.warn("⚠️ No se encontró imagen de galería con ID:", attachmentId);
            }
          } catch (error) {
            console.error("❌ Error procesando imagen de galería:", attachmentId, error);
          }
        }
        
        if (galleries.length > 0) {
          req.body.product_galleries = galleries;
          console.log("✅ Galería procesada correctamente:", galleries.length, "imágenes");
        } else {
          console.warn("⚠️ No se pudieron procesar imágenes de galería");
        }
        
        // Eliminar el campo temporal
        delete req.body.product_galleries_id;
      }

      // Procesar product_thumbnail_id si existe
      if (req.body.product_thumbnail_id) {
        try {
          console.log("🖼️ Procesando thumbnail ID:", req.body.product_thumbnail_id);
          const thumbnail = await this.attachmentRepository.findById(req.body.product_thumbnail_id);
          if (thumbnail) {
            req.body.product_thumbnail = {
              id: thumbnail.id,
              name: thumbnail.name,
              disk: thumbnail.disk,
              file_name: thumbnail.file_name,
              mime_type: thumbnail.mime_type,
              asset_url: thumbnail.asset_url,
              original_url: thumbnail.original_url
            };
            console.log("✅ Thumbnail procesado correctamente");
          } else {
            console.warn("⚠️ No se encontró thumbnail con ID:", req.body.product_thumbnail_id);
          }
        } catch (error) {
          console.error("❌ Error procesando thumbnail:", error);
        }
        // Eliminar el campo temporal
        delete req.body.product_thumbnail_id;
      }

      // Validar y procesar categorías si se están enviando
      if (req.body.categories && Array.isArray(req.body.categories)) {
        console.log("📁 Validando categorías:", req.body.categories);
        const validCategories = [];
        
        for (const categoryId of req.body.categories) {
          try {
            let categoryIdToUse = categoryId;
            
            // Si es un string, intentar convertirlo a número
            if (typeof categoryId === 'string') {
              // Remover espacios y caracteres extraños como [ ] "
              const cleanId = categoryId.replace(/[\[\]"\s]/g, '');
              const numId = parseInt(cleanId);
              if (!isNaN(numId)) {
                categoryIdToUse = numId;
                console.log("✅ Categoría convertida de string a número:", categoryId, "->", categoryIdToUse);
              } else {
                console.warn("⚠️ No se pudo convertir categoría a número:", categoryId);
                continue;
              }
            } else if (typeof categoryId === 'number') {
              categoryIdToUse = categoryId;
              console.log("✅ Categoría numérica:", categoryIdToUse);
            } else {
              console.warn("⚠️ Tipo de categoría no válido:", typeof categoryId, categoryId);
              continue;
            }
            
            // Buscar la categoría por su ID numérico para obtener el ObjectId de MongoDB
            try {
              const category = await this.categoryRepository.findByAutoIncrementId(categoryIdToUse);
              if (category) {
                // Usar el _id de MongoDB para la relación
                const mongoId = (category as any)._id || category.id;
                if (mongoId) {
                  validCategories.push(mongoId);
                  console.log("✅ Categoría encontrada:", category.name, "ID numérico:", categoryIdToUse, "MongoID:", mongoId);
                } else {
                  console.warn("⚠️ Categoría sin _id válido:", categoryIdToUse);
                }
              } else {
                console.warn("⚠️ Categoría no encontrada con ID numérico:", categoryIdToUse);
              }
            } catch (error) {
              console.error("❌ Error buscando categoría:", categoryIdToUse, error);
            }
          } catch (error) {
            console.error("❌ Error validando categoría:", categoryId, error);
          }
        }
        
        // Actualizar el array de categorías con los ObjectIds válidos
        req.body.categories = validCategories;
        console.log("📁 Categorías procesadas:", validCategories);
      }

      console.log("🚀 Enviando comando de actualización...");
      console.log("📦 Datos finales a actualizar:", JSON.stringify(req.body, null, 2));
      
      const command = new UpdateProductCommand(productId, req.body);
      const product = await this.updateProductHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Producto actualizado exitosamente",
        data: product,
      });
    } catch (error: any) {
      console.error("❌ Error al actualizar producto:", error.message);
      console.error("❌ Error completo:", error);

      // Manejar errores de validación de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        res.status(400).json({
          success: false,
          message: "Error de validación",
          details: validationErrors,
        });
        return;
      }

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Error al actualizar el producto",
        details: error?.errors || null,
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || id === "undefined" || id === "null") {
        res.status(400).json({
          success: false,
          message: "El ID del producto es requerido y debe ser válido",
        });
        return;
      }

      // Convertir ID a número si es string
      const productId = typeof id === 'string' ? parseInt(id) : id;
      
      // Validar que el ID sea un número válido
      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({
          success: false,
          message: "El ID del producto debe ser un número válido",
        });
        return;
      }

      console.log("🗑️ Eliminando producto con ID:", productId);

      const command = new DeleteProductCommand(productId);
      const deleted = await this.deleteProductHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Producto eliminado exitosamente",
        data: { deleted },
      });
    } catch (error: any) {
      console.error("❌ Error al eliminar producto:", error.message);

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Error al eliminar el producto",
        details: error?.errors || null,
      });
    }
  }
}
