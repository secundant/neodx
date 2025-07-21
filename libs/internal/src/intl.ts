import type { SetOptional } from 'type-fest';

type OptionalRules = keyof typeof similarPlurals;
type Forms = SetOptional<Record<Intl.LDMLPluralRule, string>, OptionalRules>;

const rules = new Intl.PluralRules();
const similarPlurals = {
  two: 'few',
  few: 'many',
  many: 'other',
  zero: 'other'
} satisfies Partial<Record<Intl.LDMLPluralRule, Intl.LDMLPluralRule>>;
const getPluralForm = (current: Intl.LDMLPluralRule, forms: Forms): string =>
  forms[current] ?? getPluralForm(similarPlurals[current as OptionalRules], forms);

export const plural = (
  n: number,
  forms: SetOptional<Record<Intl.LDMLPluralRule, string>, OptionalRules>
) => getPluralForm(rules.select(n), forms).replace('%d', n.toString());

const sortingCollator = new Intl.Collator('en');

export const compare = {
  by:
    <T>(fn: (value: T) => string, compareFn: (a: string, b: string) => number) =>
    (a: T, b: T) =>
      compareFn(fn(a), fn(b)),
  locale: sortingCollator.compare.bind(sortingCollator)
};
