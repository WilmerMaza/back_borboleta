import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { IProduct } from "../../domain/entities/Product";
import ProductModel from "../database/models/ProductModel";
import { injectable, inject } from "tsyringe";
import { IAttachmentRepository } from "../../domain/repositories/IAttachmentRepository";

@injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @inject('IAttachmentRepository') private attachmentRepository: IAttachmentRepository
  ) {}

  /**
   * Procesa las imágenes de un producto (thumbnail y galleries)
   */
  private async processProductImages(product: any): Promise<any> {
    try {
      // Procesar product_thumbnail_id si existe
      if (product.product_thumbnail_id) {
        try {
          const thumbnail = await this.attachmentRepository.findById(product.product_thumbnail_id);
          if (thumbnail) {
            product.product_thumbnail = {
              id: thumbnail.id,
              name: thumbnail.name,
              disk: thumbnail.disk,
              file_name: thumbnail.file_name,
              mime_type: thumbnail.mime_type,
              asset_url: thumbnail.asset_url,
              original_url: thumbnail.original_url
            };
            console.log(`✅ Imagen thumbnail procesada para producto ${product.id}`);
            // Eliminar el campo temporal solo si se procesó correctamente
            delete product.product_thumbnail_id;
          } else {
            console.warn(`⚠️ No se encontró thumbnail con ID ${product.product_thumbnail_id} para producto ${product.id}`);
          }
        } catch (error) {
          console.error(`❌ Error procesando thumbnail ${product.product_thumbnail_id}:`, error);
        }
      }

      // Procesar product_galleries_id si existe
      if (Array.isArray(product.product_galleries_id)) {
        const galleries = [];
        for (const attachmentId of product.product_galleries_id) {
          try {
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
            } else {
              console.warn(`⚠️ No se encontró imagen de galería con ID ${attachmentId} para producto ${product.id}`);
            }
          } catch (error) {
            console.error(`❌ Error procesando imagen de galería ${attachmentId}:`, error);
          }
        }
        
        if (galleries.length > 0) {
          product.product_galleries = galleries;
          console.log(`✅ ${galleries.length} imágenes de galería procesadas para producto ${product.id}`);
          // Eliminar el campo temporal solo si se procesaron correctamente
          delete product.product_galleries_id;
        } else {
          console.warn(`⚠️ No se pudieron procesar imágenes de galería para producto ${product.id}`);
        }
      }

      return product;
    } catch (error) {
      console.error('❌ Error general procesando imágenes del producto:', error);
      return product; // Devolver producto sin procesar en caso de error
    }
  }

  async create(product: Partial<IProduct>): Promise<IProduct> {
    try {
    

      // Ignorar sale_price del frontend y calcular automáticamente
      // delete product.sale_price; // Eliminar sale_price si viene del frontend

      // Calcular sale_price automáticamente si hay price y discount
      // if (
      //   product.price &&
      //   product.discount !== undefined &&
      //   product.discount > 0
      // ) {
      //   const price = Number(product.price);
      //   const discount = Number(product.discount);

      //   // Validar que el descuento esté entre 0 y 100
      //   if (discount >= 0 && discount <= 100) {
      //     const salePrice = price - (price * discount) / 100;
      //     product.sale_price = Math.max(0, salePrice); // Asegurar que no sea negativo
      //     console.log(
      //       "💰 Sale price calculado:",
      //       product.sale_price,
      //       "Precio original:",
      //       price,
      //       "Descuento:",
      //       discount + "%"
      //     );
      //   } else {
      //     console.log(
      //       "⚠️ Descuento inválido:",
      //       discount,
      //       "%. Debe estar entre 0 y 100"
      //     );
      //     product.sale_price = product.price; // Sin descuento
      //   }
      // } else {
      //   // Si no hay descuento, sale_price = price
      //   product.sale_price = product.price;
      //   console.log(
      //     "💰 Sin descuento, sale_price = price:",
      //     product.sale_price
      //   );
      // }

      const newProduct = new ProductModel(product);
    

      const savedProduct = await newProduct.save();
    

      const productObj = savedProduct.toObject();
      return {
        ...productObj,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.create:", error);
      throw new Error("Error al crear el producto en la base de datos");
    }
  }

  async findAll(params: { skip: number; limit: number; categoryId?: string }): Promise<IProduct[]> {
    try {
      const filter: any = {};
      
      // Filtrar por categoría si se proporciona
      if (params.categoryId) {
        filter.categories = params.categoryId;
      }
      
      const products = await ProductModel.find(filter)
        .populate('categories')
        .skip(params.skip)
        .limit(params.limit)
        .sort({ createdAt: -1 });

      // Transformar _id a id para compatibilidad con el frontend
      return products.map((product) => {
        const productObj = product.toObject();
        return {
          ...productObj,
        };
      });
    } catch (error) {
      console.error("❌ Error en ProductRepository.findAll:", error);
      throw new Error("Error al obtener productos de la base de datos");
    }
  }

  async findById(id: string): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findById(id);
      if (!product) return null;

      const productObj = product.toObject();
      return {
        ...productObj,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.findById:", error);
      throw new Error("Error al obtener el producto de la base de datos");
    }
  }

  async findByAutoIncrementId(id: number): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findOne({ id: id });
      if (!product) return null;

      const productObj = product.toObject();
      // Procesar imágenes del producto
      const processedProduct = await this.processProductImages(productObj);
      
      return {
        ...processedProduct,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.findByAutoIncrementId:", error);
      throw new Error("Error al obtener el producto de la base de datos");
    }
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findOne({ slug });
      if (!product) return null;

      const productObj = product.toObject();
      // Procesar imágenes del producto
      const processedProduct = await this.processProductImages(productObj);
      
      return {
        ...processedProduct,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.findBySlug:", error);
      throw new Error(
        "Error al obtener el producto por slug de la base de datos"
      );
    }
  }

  async update(
    id: string,
    product: Partial<IProduct>
  ): Promise<IProduct | null> {
    try {
      // Ignorar sale_price del frontend y recalcular automáticamente
      delete product.sale_price; // Eliminar sale_price si viene del frontend

      // Si se está actualizando price o discount, recalcular sale_price
      if (product.price !== undefined || product.discount !== undefined) {
        // Obtener el producto actual para tener todos los datos
        const currentProduct = await ProductModel.findById(id);
        if (!currentProduct) return null;

        const currentPrice =
          product.price !== undefined
            ? Number(product.price)
            : Number(currentProduct.price);
        const currentDiscount =
          product.discount !== undefined
            ? Number(product.discount)
            : Number(currentProduct.discount || 0);

        // Calcular sale_price automáticamente
        if (currentPrice && currentDiscount > 0) {
          // Validar que el descuento esté entre 0 y 100
          if (currentDiscount >= 0 && currentDiscount <= 100) {
            const salePrice =
              currentPrice - (currentPrice * currentDiscount) / 100;
            product.sale_price = Math.max(0, salePrice); // Asegurar que no sea negativo
            console.log(
              "💰 Sale price recalculado:",
              product.sale_price,
              "Precio:",
              currentPrice,
              "Descuento:",
              currentDiscount + "%"
            );
          } else {
            console.log(
              "⚠️ Descuento inválido:",
              currentDiscount,
              "%. Debe estar entre 0 y 100"
            );
            product.sale_price = currentPrice; // Sin descuento
          }
        } else {
          // Si no hay descuento, sale_price = price
          product.sale_price = currentPrice;
          console.log(
            "💰 Sin descuento, sale_price = price:",
            product.sale_price
          );
        }
      }

      const updatedProduct = await ProductModel.findByIdAndUpdate(id, product, {
        new: true,
      });
      if (!updatedProduct) return null;

      const productObj = updatedProduct.toObject();
      
      // Procesar imágenes del producto después de la actualización
      const processedProduct = await this.processProductImages(productObj);
      
      return {
        ...processedProduct,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.update:", error);
      throw new Error("Error al actualizar el producto en la base de datos");
    }
  }

  async updateByNumericId(id: number, product: Partial<IProduct>): Promise<IProduct | null> {
    try {
      // Ignorar sale_price del frontend y recalcular automáticamente
      delete product.sale_price; // Eliminar sale_price si viene del frontend

      // Si se está actualizando price o discount, recalcular sale_price
      if (product.price !== undefined || product.discount !== undefined) {
        // Obtener el producto actual para tener todos los datos
        const currentProduct = await ProductModel.findOne({ id: id });
        if (!currentProduct) return null;

        const currentPrice =
          product.price !== undefined
            ? Number(product.price)
            : Number(currentProduct.price);
        const currentDiscount =
          product.discount !== undefined
            ? Number(product.discount)
            : Number(currentProduct.discount || 0);

        // Calcular sale_price automáticamente
        if (currentPrice && currentDiscount > 0) {
          // Validar que el descuento esté entre 0 y 100
          if (currentDiscount >= 0 && currentDiscount <= 100) {
            const salePrice =
              currentPrice - (currentPrice * currentDiscount) / 100;
            product.sale_price = Math.max(0, salePrice); // Asegurar que no sea negativo
            console.log(
              "💰 Sale price recalculado:",
              product.sale_price,
              "Precio:",
              currentPrice,
              "Descuento:",
              currentDiscount + "%"
            );
          } else {
            console.log(
              "⚠️ Descuento inválido:",
              currentDiscount,
              "%. Debe estar entre 0 y 100"
            );
            product.sale_price = currentPrice; // Sin descuento
          }
        } else {
          // Si no hay descuento, sale_price = price
          product.sale_price = currentPrice;
          console.log(
            "💰 Sin descuento, sale_price = price:",
            product.sale_price
          );
        }
      }

      console.log("🔄 Actualizando producto en base de datos...");
      const updatedProduct = await ProductModel.findOneAndUpdate({ id: id }, product, {
        new: true,
      });
      if (!updatedProduct) {
        console.error("❌ No se pudo actualizar el producto - producto no encontrado");
        return null;
      }

      console.log("✅ Producto actualizado en base de datos");
      const productObj = updatedProduct.toObject();
      
      // Procesar imágenes del producto después de la actualización
      console.log("🖼️ Procesando imágenes del producto...");
      
      // Intentar procesar imágenes, pero si falla, devolver el producto sin procesar
      let processedProduct = productObj;
      try {
        processedProduct = await this.processProductImages(productObj);
        console.log("✅ Imágenes procesadas correctamente");
      } catch (imageError) {
        console.error("❌ Error procesando imágenes, devolviendo producto sin procesar:", imageError);
        // Continuar con el producto sin procesar imágenes
      }
      
      return {
        ...processedProduct,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.updateByNumericId:", error);
      console.error("❌ Error details:", {
        id,
        product: product,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw new Error(`Error al actualizar el producto en la base de datos: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByNumericId(id: number): Promise<boolean> {
    const result = await ProductModel.findOneAndDelete({ id: id });
    return !!result;
  }

  async count(params?: { categoryId?: string }): Promise<number> {
    const filter: any = {};
    
    // Filtrar por categoría si se proporciona
    if (params?.categoryId) {
      filter.categories = params.categoryId;
    }
    
    return await ProductModel.countDocuments(filter);
  }

  async findByNumericId(numericId: number): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findOne({ id: numericId });
      if (!product) return null;

      const productObj = product.toObject();
      // Procesar imágenes del producto
      const processedProduct = await this.processProductImages(productObj);
      
      return {
        ...processedProduct,
      };
    } catch (error) {
      console.error("❌ Error en ProductRepository.findByNumericId:", error);
      throw new Error(
        "Error al obtener el producto por numeric_id de la base de datos"
      );
    }
  }
}
