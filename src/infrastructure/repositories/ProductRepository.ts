import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IProduct } from '../../domain/entities/Product';
import ProductModel from '../database/models/ProductModel';
import { injectable } from 'tsyringe';

@injectable()
export class ProductRepository implements IProductRepository {
    async create(product: Partial<IProduct>): Promise<IProduct> {
        try {
            console.log('📦 Datos recibidos en el repositorio:', product);
            console.log('💰 Precio en el repositorio:', product.price, 'Tipo:', typeof product.price);

            // Ignorar sale_price del frontend y calcular automáticamente
            delete product.sale_price; // Eliminar sale_price si viene del frontend
            
            // Calcular sale_price automáticamente si hay price y discount
            if (product.price && product.discount !== undefined && product.discount > 0) {
                const price = Number(product.price);
                const discount = Number(product.discount);
                
                // Validar que el descuento esté entre 0 y 100
                if (discount >= 0 && discount <= 100) {
                    const salePrice = price - (price * discount / 100);
                    product.sale_price = Math.max(0, salePrice); // Asegurar que no sea negativo
                    console.log('💰 Sale price calculado:', product.sale_price, 'Precio original:', price, 'Descuento:', discount + '%');
                } else {
                    console.log('⚠️ Descuento inválido:', discount, '%. Debe estar entre 0 y 100');
                    product.sale_price = product.price; // Sin descuento
                }
            } else {
                // Si no hay descuento, sale_price = price
                product.sale_price = product.price;
                console.log('💰 Sin descuento, sale_price = price:', product.sale_price);
            }

            const newProduct = new ProductModel(product);
            console.log('📦 Modelo creado:', newProduct);
            
            const savedProduct = await newProduct.save();
            console.log('📦 Producto guardado:', savedProduct);
            
            const productObj = savedProduct.toObject();
            return {
                ...productObj,
                id: productObj._id,
                numeric_id: productObj.numeric_id
            };
        } catch (error) {
            console.error('❌ Error en ProductRepository.create:', error);
            throw new Error('Error al crear el producto en la base de datos');
        }
    }

    async findAll(params: { skip: number; limit: number }): Promise<IProduct[]> {
        try {
            const products = await ProductModel.find()
                .skip(params.skip)
                .limit(params.limit)
                .sort({ createdAt: -1 });
            
            // Transformar _id a id para compatibilidad con el frontend
            return products.map(product => {
                const productObj = product.toObject();
                return {
                    ...productObj,
                    id: productObj._id,
                    numeric_id: productObj.numeric_id
                };
            });
        } catch (error) {
            console.error('❌ Error en ProductRepository.findAll:', error);
            throw new Error('Error al obtener productos de la base de datos');
        }
    }

    async findById(id: string): Promise<IProduct | null> {
        try {
            const product = await ProductModel.findById(id);
            if (!product) return null;
            
            const productObj = product.toObject();
            return {
                ...productObj,
                id: productObj._id,
                numeric_id: productObj.numeric_id
            };
        } catch (error) {
            console.error('❌ Error en ProductRepository.findById:', error);
            throw new Error('Error al obtener el producto de la base de datos');
        }
    }

    async findBySlug(slug: string): Promise<IProduct | null> {
        try {
            const product = await ProductModel.findOne({ slug });
            if (!product) return null;
            
            const productObj = product.toObject();
            return {
                ...productObj,
                id: productObj._id,
                numeric_id: productObj.numeric_id
            };
        } catch (error) {
            console.error('❌ Error en ProductRepository.findBySlug:', error);
            throw new Error('Error al obtener el producto por slug de la base de datos');
        }
    }

    async update(id: string, product: Partial<IProduct>): Promise<IProduct | null> {
        try {
            // Ignorar sale_price del frontend y recalcular automáticamente
            delete product.sale_price; // Eliminar sale_price si viene del frontend
            
            // Si se está actualizando price o discount, recalcular sale_price
            if (product.price !== undefined || product.discount !== undefined) {
                // Obtener el producto actual para tener todos los datos
                const currentProduct = await ProductModel.findById(id);
                if (!currentProduct) return null;

                const currentPrice = product.price !== undefined ? Number(product.price) : Number(currentProduct.price);
                const currentDiscount = product.discount !== undefined ? Number(product.discount) : Number(currentProduct.discount || 0);

                // Calcular sale_price automáticamente
                if (currentPrice && currentDiscount > 0) {
                    // Validar que el descuento esté entre 0 y 100
                    if (currentDiscount >= 0 && currentDiscount <= 100) {
                        const salePrice = currentPrice - (currentPrice * currentDiscount / 100);
                        product.sale_price = Math.max(0, salePrice); // Asegurar que no sea negativo
                        console.log('💰 Sale price recalculado:', product.sale_price, 'Precio:', currentPrice, 'Descuento:', currentDiscount + '%');
                    } else {
                        console.log('⚠️ Descuento inválido:', currentDiscount, '%. Debe estar entre 0 y 100');
                        product.sale_price = currentPrice; // Sin descuento
                    }
                } else {
                    // Si no hay descuento, sale_price = price
                    product.sale_price = currentPrice;
                    console.log('💰 Sin descuento, sale_price = price:', product.sale_price);
                }
            }

            const updatedProduct = await ProductModel.findByIdAndUpdate(id, product, { new: true });
            if (!updatedProduct) return null;
            
            const productObj = updatedProduct.toObject();
            return {
                ...productObj,
                id: productObj._id,
                numeric_id: productObj.numeric_id
            };
        } catch (error) {
            console.error('❌ Error en ProductRepository.update:', error);
            throw new Error('Error al actualizar el producto en la base de datos');
        }
    }

    async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
        return !!result;
    }

    async count(): Promise<number> {
        return await ProductModel.countDocuments();
  }

    async findByNumericId(numericId: number): Promise<IProduct | null> {
        try {
            const product = await ProductModel.findOne({ numeric_id: numericId });
            if (!product) return null;
            
            const productObj = product.toObject();
            return {
                ...productObj,
                id: productObj._id,
                numeric_id: productObj.numeric_id
            };
        } catch (error) {
            console.error('❌ Error en ProductRepository.findByNumericId:', error);
            throw new Error('Error al obtener el producto por numeric_id de la base de datos');
        }
    }
}