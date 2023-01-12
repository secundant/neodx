import { asyncFunction } from './es-module.mjs';

export class MyClass {
  async #wait() {
    await asyncFunction();
  }

  async run() {
    await this.#wait();
    return 0;
  }
}
