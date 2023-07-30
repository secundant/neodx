# Common utilities

Here's a list of common utilities that are internally used in our top-level APIs, but can be useful for you as well.

## `isPaintGradient`

Accepts [Paint](https://www.figma.com/developers/api#paint-type) object and returns `true` if it's an any gradient.

```typescript
if (isPaintGradient(paint)) {
  // ...
}
```

## `isPaintSolid`

Accepts [Paint](https://www.figma.com/developers/api#paint-type) object and returns `true` if it's a solid color.

```typescript
if (isPaintSolid(paint)) {
  // ...
}
```

## `isEffectShadow`

Accepts [Effect](https://www.figma.com/developers/api#effect-type) object and returns `true` if it's a shadow.

```typescript
if (isEffectShadow(effect)) {
  // ...
}
```

## `isEffectBlur`

Accepts [Effect](https://www.figma.com/developers/api#effect-type) object and returns `true` if it's a blur.

```typescript
if (isEffectBlur(effect)) {
  // ...
}
```

## `getColor`

Returns [colord](https://github.com/omgovich/colord) instance for passed [Color](https://www.figma.com/developers/api#color-type), which provides high-level color manipulation API.

```typescript
const color = getColor(paint.color);

color.toHex(); // #ff0000
```

## `parseFileIdFromLink`

Accepts Figma link and returns file id.

```typescript
const fileId = parseFileIdFromLink(
  'https://www.figma.com/file/heReIsAKey?type=design&node-id=1112-222......'
);

console.log(fileId); // heReIsAKey
```
