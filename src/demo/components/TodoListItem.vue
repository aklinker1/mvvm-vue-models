<template>
  <router-link
    :to="`/overlay/todo/${item.id}`"
    class="block cursor-default"
    :draggable="false"
  >
    <li class="p-4 bg-gray-900 rounded opacity-70">
      <checkbox
        :checked="item.completed"
        class="mr-4"
        :class="{ 'opacity-50 pointer-events-none': isTogglingCompleted }"
        @click.stop.prevent="toggleCompletedAndUpdateList"
      />
      <span class="text-white" :class="{ 'opacity-70': item.completed }">{{
        item.name
      }}</span>
    </li>
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useTodoViewModel } from "../state/TodoViewModel";
import Checkbox from "./Checkbox.vue";

export default defineComponent({
  components: { Checkbox },
  props: {
    item: { type: Object as PropType<TodoSearchResult>, default: undefined },
  },
  emits: ["updateList"],
  setup(props, { emit }) {
    const todoId = computed(() => props.item.id);
    const { toggleCompleted, isTogglingCompleted } = useTodoViewModel(todoId);

    const toggleCompletedAndUpdateList = async () => {
      await toggleCompleted()
      emit("updateList");
    } 

    return {
      toggleCompletedAndUpdateList,
      isTogglingCompleted
    }
  },
});
</script>
