<template>
  <span class="cursor-pointer">
    {{ checked ? '✅' : '⬜' }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    checked: Boolean,
  },
});
</script>
