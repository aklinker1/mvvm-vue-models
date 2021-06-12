<template>
  <div class="flex flex-col max-w-md mt-16 mx-auto space-y-4">
    <div class="flex">
      <input
        class="bg-white text-black px-3 py-2 rounded-l flex-1"
        type="text"
        v-model="username"
        placeholder="Username"
      />
      <button
        :disabled="!username"
        class="uppercase font-bold px-3 py-2 rounded-r"
        :class="{
          'bg-blue-500': !!username,
          'bg-gray-700 text-opacity-30 text-white': !username,
        }"
        @click="increment(1)"
      >
        Increment
      </button>
    </div>
    <p v-if="!!username" class="text-center">Count: {{ count }} (next: {{ nextNumber }})</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useCountViewModel } from '../state/CountViewModel';

export default defineComponent({
  setup() {
    const username = ref('');
    const { count, nextNumber, increment } = useCountViewModel(username);
    return {
      username,
      count,
      nextNumber,
      increment,
    };
  },
});
</script>
