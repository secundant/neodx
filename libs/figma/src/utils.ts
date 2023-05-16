import { invariant } from '@neodx/std';
import { colord } from 'colord';
import type {
  AnyNode,
  Color,
  Effect,
  EffectBlur,
  EffectShadow,
  NodeByType,
  NodeType,
  Paint,
  PaintGradient,
  PaintImage,
  PaintSolid
} from './core';
import { EffectType, PaintType } from './core';
import type { GraphNode } from './graph';

export const isFigmaLink = (link: string) => /^https:\/\/www\.figma\.com\/file\/[^/]+/.test(link);
export const parseFileIdFromLink = (link: string) => {
  const id = link.match(/https:\/\/www\.figma\.com\/file\/([^/]+)/)?.[1];

  invariant(id, `Invalid Figma link: ${link}`);

  return id;
};

export const getGraphNodeName = (node: GraphNode<AnyNode>) => node.source.name;

export const getColor = ({ r, g, b, a }: Color) =>
  colord({
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a
  });

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
