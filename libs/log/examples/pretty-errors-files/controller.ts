import type { ProductsService } from './services/products';

export class Controller {
  constructor(private productsService: ProductsService) {}

  getProducts({ params: { label } }: any) {
    return this.productsService.findByLabel(label);
  }
}
