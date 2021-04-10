import { computed, Ref, shallowRef, UnwrapRef, watch } from "vue";

type Arg = number | string | { toString: () => string };

type WrapRefs<T extends Array<Arg>> = { [Key in keyof T]: Ref<T[Key]> };

const modelKeys = new Set<string>();

interface UseViewModel<A extends Arg[], S> {
  (...args: WrapRefs<A>): S;
}

export function defineVueModel<A extends Arg[], S>(
  modelKey: string,
  setup: (...args: A) => S
): UseViewModel<A, S> {
  // Warn if model keys are the same
  if (modelKeys.has(modelKey)) {
    console.warn(`Multiple view models defined as \"${modelKey}\"`);
  } else {
    modelKeys.add(modelKey);
  }

  const cachedStates: Record<string, S | undefined> = {};
  return function (...args) {
    const getUnwrappedArgs = () => args.map((arg) => arg.value) as A;
    const unwrappedArgs = computed(() => getUnwrappedArgs());

    const getArgsPath = (customArgs: A) => {
      const argStringValues = customArgs.map((arg) => arg.toString());
      return [modelKey, ...argStringValues].join(".");
    };
    const argsPath = computed(() => getArgsPath(unwrappedArgs.value));

    const getState = (argsPath: string) => {
      const cached = cachedStates[argsPath];
      if (cached != null) return cached;
      return (cachedStates[argsPath] = setup(...unwrappedArgs.value));
    };
    const state = getState(argsPath.value);

    watch(argsPath, (newArgsPath, oldArgsPath) => {
      const newState = getState(newArgsPath);
      for (const key in newState) {
        const value = newState[key];
        state[key] = value;
      }
    });
    return state;
  };
}
