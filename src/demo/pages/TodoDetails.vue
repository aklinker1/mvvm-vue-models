<template>
  <div class="w-96 space-y-4">
    <template v-if="todo">
      <div
        class="flex items-center"
        :class="{ 'pointer-events-none opacity-50': isTogglingCompleted }"
      >
        <checkbox :checked="todo.completed" class="mr-6 text-xl" @click="toggleCompleted" />
        <h1 class="text-xl font-bold">{{ todo.name }}</h1>
      </div>
      <div>
        <p class="text-sm opacity-70 font-bold mb-1">Notes</p>
        <p>{{ todo.notes }}</p>
      </div>
      <div>
        <p class="text-sm opacity-70 font-bold mb-1">Created Date</p>
        <p>{{ todo.createdAt.toUTCString() }}</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import Checkbox from '../components/Checkbox.vue';
import { useTodoViewModel } from '../state/TodoViewModel';

export default defineComponent({
  components: { Checkbox },
  props: {
    todoId: { type: String, required: true },
  },
  setup(props) {
    const todoId = computed(() => Number(props.todoId));
    const { todo, isLoading, loadTodo, toggleCompleted, isTogglingCompleted } =
      useTodoViewModel(todoId);

    onMounted(() => {
      if (todo.value == null) loadTodo();
    });

    return {
      todo,
      isLoading,
      toggleCompleted,
      isTogglingCompleted,
    };
  },
});
</script>
