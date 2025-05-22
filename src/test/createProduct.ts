// Este archivo de prueba ya no es necesario porque:
// 1. Estamos usando TSyringe para inyección de dependencias
// 2. Deberíamos usar un framework de testing como Jest
// 3. Los mocks deberían estar en archivos separados

/*
import { CreateProductCommand } from '../application/commands/product/CreateProductCommand';
import { IProductRepository } from '../domain/repositories/IProductRepository';
import { IProduct } from '../domain/entities/Product';

// Este mock es muy básico y debería estar en un archivo separado
const mockProductRepository: IProductRepository = {
  create: async (product: IProduct) => {
    console.log('Producto creado:', product);
    return { ...product, id: 1 };
  },
  findById: async () => null,
  findAll: async () => [],
  update: async () => null,
  delete: async () => false
};

// Los datos de prueba deberían estar en un archivo fixtures separado
const productData: IProduct = {
  name: "Labial Mate Borboleta",
  product_type: "physical",
  slug: "labial-mate-borboleta",
  description: "Labial mate profesional con fórmula de larga duración",
  short_description: "Labial mate de larga duración",
  sku: "LAB-MAT-001",
  price: 299.99,
  sale_price: 249.99,
  status: true,
  stock_status: "in_stock",
  weight: 0.05,
  dimensions: {
    length: "8",
    width: "2",
    height: "2"
  },
  categories: ["Maquillaje"],
  tags: ["labial", "mate", "larga duración"],
  images: [],
  meta_data: []
};

// Esta función de prueba debería ser reemplazada por tests unitarios proper
async function test() {
  try {
    const command = new CreateProductCommand(productData);
    const result = await command.execute();
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
*/