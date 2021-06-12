import { defineViewModel } from '../../library';
import { computed, ref, Ref } from 'vue';

export const useCountViewModel = defineViewModel({
  name: 'Count',
  persistence: {
    storage: localStorage,
  },
  setup(username: Ref<string>) {
    const count = ref<number>(0);
    const nextNumber = computed(() => count.value + 1);
    const increment = (by = 1) => {
      console.log(`Incremented ${username.value} by ${by}`);
      count.value += by;
    };

    return {
      count,
      nextNumber,
      increment,
    };
  },
});
