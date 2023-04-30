import { buildAndAnalyze, type TestBuildParams } from '../src/__tests__/testing-utils';

const root = new URL('./build-entries', import.meta.url).pathname;
const createBuildPlans = (name: string, ssr: boolean, entryFile: string): TestBuildParams[] => [
  {
    name: `${name}: development`,
    mode: 'development',
    ssr,
    root,
    entryFile
  },
  {
    name: `${name}: production`,
    mode: 'production',
    ssr,
    root,
    entryFile
  }
];
const createIsomorphicBuildPlans = (name: string): TestBuildParams[] => [
  ...createBuildPlans(`${name} - node`, true, `${name}.ts`),
  ...createBuildPlans(`${name} - browser`, false, `${name}.ts`)
];

const buildPlans = [
  ...createIsomorphicBuildPlans('neodx'),
  ...createIsomorphicBuildPlans('pino'),
  ...createIsomorphicBuildPlans('bunyan'),
  ...createIsomorphicBuildPlans('loglevel')
];

const matrix = [];

for (const plan of buildPlans) {
  try {
    matrix.push(await buildAndAnalyze(plan));
  } catch (error) {
    console.log(`Failed at ${plan.name}:`, plan);
    throw error;
  }
}

console.table(matrix.map(({ name, size, gzip }) => ({ name, size, gzip })));
