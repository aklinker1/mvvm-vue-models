import { computed, reactive, Ref, watch, watchEffect } from "vue";
import { managePersistedState, PersistenceOptions } from "./persistence";

type Arg = number | string | { toString: () => string };

type WrapRefs<T extends Array<Arg>> = { [Key in keyof T]: Ref<T[Key]> };

const modelNames = new Set<string>();

interface UseViewModel<A extends Arg[], S> {
  (...args: WrapRefs<A>): S;
}

export function defineVueModel<A extends Arg[], S>(options: {
  name: string;
  setup: (...args: A) => S;
  persistence?: PersistenceOptions<S>;
}): UseViewModel<A, S> {
  const { name: vueModelName, setup, persistence } = options;

  // Warn if model keys are the same
  if (modelNames.has(vueModelName)) {
    console.warn(`Multiple view models defined as \"${vueModelName}\"`);
  } else {
    modelNames.add(vueModelName);
  }

  const managedPersistence =
    persistence && managePersistedState<S>(persistence);
  const restorePersistedRefs = managedPersistence?.restorePersistedRefs;
  const persistState = managedPersistence?.persistState;

  const cachedStates: Record<string, S | undefined> = {};
  return function (...args) {
    const getUnwrappedArgs = () => args.map((arg) => arg.value) as A;
    const unwrappedArgs = computed(getUnwrappedArgs);

    const getArgsPath = (customArgs: A) => {
      const argStringValues = customArgs.map((arg) => arg.toString());
      return [vueModelName, ...argStringValues].join(".");
    };
    const argsPath = computed(() => getArgsPath(unwrappedArgs.value));

    const getState = (argsPath: string) => {
      const state = cachedStates[argsPath] ?? setup(...unwrappedArgs.value);
      if (cachedStates[argsPath] == null) {
        cachedStates[argsPath] = state;
        restorePersistedRefs?.(argsPath, state);
      }
      return state;
    };
    const state = getState(argsPath.value);

    watch(argsPath, (newArgsPath, oldArgsPath) => {
      const newState = getState(newArgsPath);
      for (const key in newState) {
        const value = newState[key];
        state[key] = value;
      }
    });
    watchEffect(() => {
      console.log("Something changed");
      persistState?.(argsPath.value, state);
    });
    return state;
  };
}
