import { Controller } from './controller';
import { ProductsRepository } from './repo/products';
import { ProductsService } from './services/products';

export function createAppLikeExample() {
  const productsRepository = new ProductsRepository();
  const productsService = new ProductsService(productsRepository);
  const controller = new Controller(productsService);

  const call = () => {
    try {
      controller.getProducts({ params: { label: 'foo' } });
    } catch (error) {
      throw new NetworkError('Network error', { cause: error });
    }
  };

  return { call };
}

class NetworkError extends Error {
  constructor(message: string, options: { cause: unknown }) {
    super(message, options);

    this.name = 'NetworkError';
  }
}
