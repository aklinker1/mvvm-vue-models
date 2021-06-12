<template>
  <router-link :to="`/overlay/todo/${item.id}`" class="block cursor-default" :draggable="false">
    <li class="p-4 bg-gray-900 rounded opacity-70">
      <checkbox
        :checked="item.completed"
        class="mr-4"
        :class="{ 'opacity-50 pointer-events-none': isTogglingCompleted }"
        @click.stop.prevent="$emit('toggled', item.id)"
      />
      <span class="text-white" :class="{ 'opacity-70': item.completed }">{{ item.name }}</span>
    </li>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TodoSearchResult } from '../@types/TodoSearchResult';
import Checkbox from './Checkbox.vue';

export default defineComponent({
  components: { Checkbox },
  props: {
    item: { type: Object as PropType<TodoSearchResult>, default: undefined },
    isTogglingCompleted: Boolean,
  },
  emits: {
    toggled: (id: number) => true,
  },
});
</script>
