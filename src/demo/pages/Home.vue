<template>
  <div class="mx-auto max-w-screen-sm py-8">
    <todo-list />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TodoList from "../components/TodoList.vue";

export default defineComponent({
  components: { TodoList },
  setup() {

  }
});
</script>
