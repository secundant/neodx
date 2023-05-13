import { invariant } from '@neodx/std';
import type {
  AnyNode,
  Effect,
  EffectBlur,
  EffectShadow,
  NodeByType,
  NodeType,
  Paint,
  PaintGradient,
  PaintImage,
  PaintSolid
} from './figma.h';
import { EffectType, PaintType } from './figma.h';

export const parseFileIdFromLink = (link: string) => {
  const id = link.match(/https:\/\/www\.figma\.com\/file\/([^/]+)/)?.[1];

  invariant(id, `Invalid Figma link: ${link}`);

  return id;
};

export const isEffectShadow = (effect: Effect): effect is EffectShadow =>
  effect.type === EffectType.DROP_SHADOW || effect.type === EffectType.INNER_SHADOW;

export const isEffectBlur = (effect: Effect): effect is EffectBlur =>
  effect.type === EffectType.BACKGROUND_BLUR || effect.type === EffectType.LAYER_BLUR;

export const isPaintSolid = (paint: Paint): paint is PaintSolid => paint.type === PaintType.SOLID;

export const isPaintGradient = (paint: Paint): paint is PaintGradient =>
  paint.type === PaintType.GRADIENT_ANGULAR ||
  paint.type === PaintType.GRADIENT_DIAMOND ||
  paint.type === PaintType.GRADIENT_LINEAR ||
  paint.type === PaintType.GRADIENT_RADIAL;

export const isPaintImage = (paint: Paint): paint is PaintImage => paint.type === PaintType.IMAGE;

export const isNodeType = <Type extends NodeType>(
  node: AnyNode,
  type: Type
): node is NodeByType<Type> => node.type === type;
