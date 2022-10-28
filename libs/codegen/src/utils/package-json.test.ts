import { addPackageJsonDependencies, removePackageJsonDependencies } from '@/utils/package-json';

describe('addPackageJsonDependencies', () => {
  test('should add missed dependencies', async () => {
    const pkg = {};
    const updates = {
      dependencies: {
        a: '^18'
      },
      devDependencies: {
        b: '^2.1.3'
      }
    };

    expect(addPackageJsonDependencies(pkg, updates)).toEqual(updates);
  });

  test('should skip existing dependencies', async () => {
    const pkg = {
      dependencies: {
        a: '^1.2.3'
      }
    };

    expect(addPackageJsonDependencies(pkg, { devDependencies: { a: '1' } })).toEqual(null);
    expect(addPackageJsonDependencies(pkg, { dependencies: { a: '^1.2.0' } })).toEqual(null);
    expect(
      addPackageJsonDependencies(pkg, {
        devDependencies: { a: '^1.2.0' },
        dependencies: { a: '^1.0.0' }
      })
    ).toEqual(null);
  });

  test('should upgrade dependencies versions on same fields', async () => {
    const pkg = {
      dependencies: {
        a: '^1.2.3',
        b: '^9999'
      },
      devDependencies: {
        c: '1.0.0'
      }
    };

    expect(addPackageJsonDependencies(pkg, { dependencies: { a: '2.0.0', b: 'next' } })).toEqual({
      ...pkg,
      dependencies: { ...pkg.dependencies, a: '2.0.0', b: 'next' }
    });
    expect(addPackageJsonDependencies(pkg, { devDependencies: { a: '2.0.0', b: 'next' } })).toEqual(
      null
    );
    expect(
      addPackageJsonDependencies(pkg, {
        dependencies: { b: '^3.0.0', c: '5.0.0' },
        devDependencies: { c: '^3.0.0' }
      })
    ).toEqual({
      ...pkg,
      devDependencies: { c: '^3.0.0' }
    });
  });

  test('should handle not-semver', () => {
    const latestSpec = { dependencies: { react: 'latest' } };
    const nextSpec = { dependencies: { react: 'next' } };

    expect(addPackageJsonDependencies(latestSpec, nextSpec)).toEqual(nextSpec);
    expect(addPackageJsonDependencies(nextSpec, latestSpec)).toEqual(null);
  });
});

describe('removeTreePackageJsonDependencies', () => {
  test('should ignore missed deps', () => {
    expect(removePackageJsonDependencies({}, { dependencies: ['a'] })).toBeNull();
    expect(
      removePackageJsonDependencies(createOneEachDepPkg(), {
        dependencies: ['d'],
        devDependencies: ['c'],
        peerDependencies: ['b'],
        optionalDependencies: ['a']
      })
    ).toBeNull();
  });

  test('should remove dependencies', () => {
    expect(
      removePackageJsonDependencies(createOneEachDepPkg(), {
        dependencies: ['a'],
        devDependencies: ['a'],
        peerDependencies: ['c']
      })
    ).toEqual({
      name: 'test',
      devDependencies: { b: '2' },
      optionalDependencies: { d: '4' }
    });
    expect(
      removePackageJsonDependencies(
        {
          dependencies: { a: '1', b: '2' },
          devDependencies: { c: '3', d: '4' }
        },
        { dependencies: ['a'], devDependencies: ['c'] }
      )
    ).toEqual({
      dependencies: { b: '2' },
      devDependencies: { d: '4' }
    });
  });
});

const createOneEachDepPkg = () => ({
  name: 'test',
  dependencies: { a: '1' },
  devDependencies: { b: '2' },
  peerDependencies: { c: '3' },
  optionalDependencies: { d: '4' }
});
