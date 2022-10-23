import { addPackageToTree } from '@/testing-utils/package';
import { VirtualTree } from '@/tree';
import { readTreeJson } from '@/tree/utils/json';
import { addPackageJsonDependencies } from '@/tree/utils/package-json';

describe('package.json utils', () => {
  test('should add missed dependencies', async () => {
    const tree = await addPackageToTree(new VirtualTree('/'));

    await addPackageJsonDependencies(tree, {
      dependencies: {
        react: '^18'
      }
    });

    expect(await readTreeJson(tree, 'package.json')).toEqual(
      expect.objectContaining({
        dependencies: {
          react: '^18'
        }
      })
    );

    await addPackageJsonDependencies(tree, {
      devDependencies: {
        react: '^18'
      }
    });
  });
});
