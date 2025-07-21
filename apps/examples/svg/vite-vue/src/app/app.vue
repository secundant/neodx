<script setup lang="ts">
import Icon from '../shared/ui/icon/icon.vue';
</script>

<template>
  <div class="container mx-auto min-h-screen text-2xl py-8 flex flex-col gap-8">
    <div class="flex flex-col gap-4 text-base">
      <div class="rounded-xl border border-orange-700 bg-orange-100 text-orange-600 p-4">
        Our Vue example is quite simple and provides only an icon component implementation and a few
        examples.
        <br />
        For more advanced usage, please check the
        <a
          href="https://github.com/secundant/neodx/tree/main/apps/examples/svg/vite-react"
          class="text-blue-600 hover:underline hover:text-blue-800 visited:text-purple-600"
          target="_blank"
          >Vite + React example</a
        >.
      </div>
      <div class="flex gap-4 items-center">
        <Icon name="common/groups" class="text-xs" />
        <Icon name="common/groups" />
        <Icon name="common/chevron-up" class="text-2xl" />
        <Icon name="common/groups" class="text-4xl" />
        <Icon name="common/groups" class="text-6xl" />
      </div>
      <div class="flex gap-4 items-center">
        <Icon name="common/copy" class="text-xl" />
        <Icon
          name="common/edit"
          class-name="bg-pink-100 text-pink-700 p-2 rounded-full border border-pink-700"
        />
      </div>
      <span class="text-sm inline-flex items-center gap-2">
        <Icon name="common/filter" />
        Small description example
        <Icon name="tool/history" />
      </span>
    </div>
  </div>
</template>
