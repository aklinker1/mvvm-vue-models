import { computed, isRef, Ref, watch, watchEffect } from "vue";
import { managePersistedState, PersistenceOptions } from "./persistence";
import { getRefValue } from "./utils";

/**
 * The allowed types that can be passed as parameters to the view model's `setup` method.
 */
type Param = number | string | { toString: () => string };

/**
 * The raw values of all refs in an object.
 *
 * @example
 * interface State {
 *   value: Ref<number>;
 *   someFunc(): void;
 * }
 * // PersistedState<State> is equivalent to
 * interface EquivalentPersistedState {
 *   value: number;
 * }
 */
type WrapRefs<T extends Array<Param>> = { [Key in keyof T]: Ref<T[Key]> };

const modelNames = new Set<string>();

/**
 * The result of `defineViewModel`.
 */
export interface UseViewModel<TParams extends Param[], TState> {
  (...args: WrapRefs<TParams>): TState;
  getState(...args: TParams): PersistedState<TState> | undefined;
}

/**
 * The raw values of all refs in an object.
 *
 * @example
 * interface State {
 *   value: Ref<number>;
 *   someFunc(): void;
 * }
 * // PersistedState<State> is equivalent to
 * interface EquivalentPersistedState {
 *   value: number;
 * }
 */
export type PersistedState<TState> = {
  [key in keyof TState]: TState[key] extends Ref<infer T> ? T : never;
};

export function defineViewModel<TParams extends Param[], TState>(options: {
  name: string;
  setup: (...args: TParams) => TState;
  persistence?: PersistenceOptions<TState>;
}): UseViewModel<TParams, TState> {
  const { name: viewModelName, setup, persistence } = options;

  // Warn if model keys are the same
  if (modelNames.has(viewModelName)) {
    console.warn(`Multiple view models defined as \"${viewModelName}\"`);
  } else {
    modelNames.add(viewModelName);
  }

  const managedPersistence =
    persistence && managePersistedState<TState>(persistence);
  const restorePersistedRefs = managedPersistence?.restorePersistedRefs;
  const persistState = managedPersistence?.persistState;

  const cachedStates: Record<string, TState | undefined> = {};

  function useViewModel(...args: WrapRefs<TParams>) {
    const getUnwrappedArgs = () => args.map((arg) => arg.value) as TParams;
    const unwrappedArgs = computed(getUnwrappedArgs);

    const getArgsPath = (customArgs: TParams) => {
      const argStringValues = customArgs.map((arg) => arg.toString());
      return [viewModelName, ...argStringValues].join(".");
    };
    const argsPath = computed(() => getArgsPath(unwrappedArgs.value));

    const getState = (argsPath: string) => {
      const state = cachedStates[argsPath] ?? setup(...unwrappedArgs.value);
      if (cachedStates[argsPath] == null) {
        cachedStates[argsPath] = state;
      }
      restorePersistedRefs?.(argsPath, state);
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
  }

  useViewModel.getState = (
    ...args: TParams
  ): PersistedState<TState> | undefined => {
    const argsPath = [viewModelName, ...args.map((arg) => arg.toString())].join(
      "."
    );
    const cachedState = cachedStates[argsPath];
    if (cachedState) {
      const state = {} as PersistedState<TState>;
      Object.entries(cachedState).forEach(([key, ref]) => {
        if (ref != null && isRef(ref)) {
          (state as any)[key] = getRefValue(ref);
        }
      });
      return state;
    }
    if (persistence?.storage) {
      const stateString = persistence.storage.getItem(argsPath);
      if (stateString != null) return JSON.parse(stateString);
    }
    return undefined;
  };

  return useViewModel;
}
