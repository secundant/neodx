import type { ProductsRepository } from '../repo/products';

export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  findByLabel(label: string) {
    return this.productsRepository.findByLabel(label);
  }
}
