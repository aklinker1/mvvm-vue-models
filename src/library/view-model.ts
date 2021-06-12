import { computed, isRef, reactive, Ref, watch } from 'vue';
import logger from './logger';
import { managePersistedState, PersistenceOptions } from './persistence';
import { getRefValue, isEditableRef } from './utils';

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
  setup: (...args: WrapRefs<TParams>) => TState;
  persistence?: PersistenceOptions<TState>;
}): UseViewModel<TParams, TState> {
  const { name: viewModelName, setup, persistence } = options;

  // Warn if model keys are the same
  if (modelNames.has(viewModelName)) {
    logger.warn(`Multiple view models defined as "${viewModelName}"`);
  } else {
    modelNames.add(viewModelName);
  }

  const managedPersistence = persistence && managePersistedState<TState>(persistence);
  const restorePersistedRefs = managedPersistence?.restorePersistedRefs;
  const persistState = managedPersistence?.persistState;
  const persistStateWithDelay = managedPersistence?.persistState;

  const cachedStates: Record<string, TState | undefined> = {};

  function useViewModel(...args: WrapRefs<TParams>) {
    const reactiveArgs = reactive(args) as WrapRefs<TParams>;
    const unwrappedArgs = computed<TParams>(() => {
      const unwrappedArgs = reactiveArgs.map(arg => arg.value) as TParams;
      // remove extra args that weren't defined by the setup function (function.length = number of defined args)
      unwrappedArgs.length = setup.length;
      return unwrappedArgs;
    });

    const getArgsPath = (customArgs: TParams) => {
      const argStringValues = customArgs.map(arg => arg.toString());
      return [viewModelName, ...argStringValues].join('.');
    };
    const argsPath = computed(() => getArgsPath(unwrappedArgs.value));

    const getState = (currentArgsPath: string) => {
      logger.group(`Getting view model for "${currentArgsPath}"`);
      let state: TState;
      const cachedState = cachedStates[currentArgsPath];
      if (cachedState != null) {
        logger.info('Cache present, reusing cached state:', cachedState);
        state = cachedState;
      } else {
        state = setup(...reactiveArgs);
        logger.info('No cached state found, called setup:', state);
      }
      restorePersistedRefs?.(currentArgsPath, state);
      if (cachedState == null) {
        cachedStates[currentArgsPath] = state;
        logger.info('Added new state to cache');
      }
      logger.info('Initial state:', state);
      logger.endGroup();
      return state;
    };
    const state = getState(argsPath.value);
    // @ts-expect-error: state is an object
    const reactiveState = reactive(state);

    watch(argsPath, (newArgsPath, oldArgsPath) => {
      persistState?.(oldArgsPath, state);
      const newState = getState(newArgsPath);
      logger.group(`Parameters changed: "${oldArgsPath}" → "${newArgsPath}"`);
      for (const key in newState) {
        const value = newState[key];
        const castReactiveState = reactiveState as TState;
        if (isEditableRef(value)) {
          logger.info(`Updated ref "${key}":`, {
            old: castReactiveState[key],
            new: value.value,
          });
          castReactiveState[key] = value.value;
        } else if (typeof castReactiveState[key] === 'function') {
          logger.info(`Skipping "${key}" because it's a function`);
        } else if (!isRef(value)) {
          logger.info(`Updated value "${key}":`, {
            old: castReactiveState[key],
            new: value,
          });
          castReactiveState[key] = value;
        } else {
          logger.info(`Skipping "${key}" because it's computed`);
        }
      }
      logger.endGroup();
    });
    watch(reactiveState, () => {
      persistStateWithDelay?.(argsPath.value, state);
    });
    return state;
  }

  useViewModel.getState = (...args: TParams): PersistedState<TState> | undefined => {
    const currentArgsPath = [viewModelName, ...args.map(arg => arg.toString())].join('.');
    const cachedState = cachedStates[currentArgsPath];
    if (cachedState) {
      const state = {} as PersistedState<TState>;
      Object.entries(cachedState).forEach(([key, ref]) => {
        if (ref != null && isRef(ref)) {
          // @ts-expect-error: map key and assignment issue
          state[key] = getRefValue(ref);
        }
      });
      return state;
    }
    if (persistence?.storage) {
      const stateString = persistence.storage.getItem(currentArgsPath);
      if (stateString != null) return JSON.parse(stateString);
    }
    return undefined;
  };

  return useViewModel;
}
