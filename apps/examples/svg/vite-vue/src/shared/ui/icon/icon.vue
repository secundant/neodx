<script setup lang="ts">
import clsx from 'clsx';
import { computed, type SVGAttributes } from 'vue';
import { sprites, type SpritesMeta } from './sprite.gen';

/** Icon props extending SVG props and requiring specific icon name */
interface IconProps extends /* @vue-ignore */ SVGAttributes {
  name: IconName;
}

/** Represents all possible icon names as the `<sprite name>/<symbol name>` string */
export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}/${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

const props = defineProps<IconProps>();

/** Safe wrapper for extracting icon metadata */
const getIconMeta = (name: IconName) => {
  const [spriteName, iconName] = name.split('/');
  const item = sprites.experimental_get(spriteName!, iconName!, config);

  if (!item) {
    // Prevents crashing when icon name is invalid by returning a default icon
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('common', 'help', config)!;
  }
  return item;
};

const config = {
  baseUrl: '/sprites/'
};

const meta = computed(() => {
  const meta = getIconMeta(props.name);
  const { width, height } = meta.symbol;

  return {
    ...meta,
    className: clsx(
      {
        /**
         * We want to control the icon's size based on its aspect ratio because we're scaling it
         * by the minimum value of width and height to prevent layout explosion.
         *
         * Also, different classes were chosen to avoid CSS overrides collisions.
         *
         * @see https://github.com/secundant/neodx/issues/92
         */
        'icon-x': width > height,
        'icon-y': width < height,
        icon: width === height
      },
      props.class
    )
  };
});
</script>

<template>
  <svg
    v-bind="props"
    :class="meta.className"
    :viewBox="meta.symbol.viewBox"
    focusable="false"
    aria-hidden="true"
  >
    <use :href="meta.href" />
  </svg>
</template>
