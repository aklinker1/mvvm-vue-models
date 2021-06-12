import { UnwrapRef } from 'vue';
import logger from './logger';
import { deepCopy, getRefValue, isEditableRef } from './utils';

export interface PersistenceOptions<TState> {
  /**
   * The storage solution for persisting your state
   */
  storage: Storage;
  /**
   * A list of `ref` keys to persist.
   *
   * - `undefined` &rarr; All keys are saved
   * - `[]` &rarr; No keys are saved
   * - `["key1"]` &rarr; Only `key1` will be saved
   */
  keysToPersist?: Array<keyof TState>;
  /**
   * If you are persisting fields that cannot be `JSON.stringify`-ed, this function lets you setup
   * custom restore functions
   */
  restoreFields?: Partial<
    {
      [key in keyof TState]: (value: any) => UnwrapRef<TState[key]>;
    }
  >;
  /**
   * The number of ms to delay for before persisting the state
   */
  // delay?: number;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function managePersistedState<TState>({
  storage,
  keysToPersist,
  restoreFields,
}: PersistenceOptions<TState>) {
  const getKeysToPersist = (state: TState): Array<keyof TState> => {
    if (keysToPersist != null) return keysToPersist;

    return Object.entries(state).reduce((keys, [key, ref]) => {
      if (isEditableRef(ref)) {
        keys.push(key as keyof TState);
      }
      return keys;
    }, [] as Array<keyof TState>);
  };

  return {
    restorePersistedRefs(argsPath: string, state: TState): void {
      const stateString = storage.getItem('VIEW_MODEL.' + argsPath);
      if (stateString == null) {
        logger.log(`State not persisted, skipping restore for "${argsPath}"`);
        return undefined;
      }
      const persistedUnwrappedState: UnwrapRef<TState> = JSON.parse(stateString);

      // @ts-expect-error: {} cannot not match all the keys in `keyof TState`
      const restoredRefs: Record<keyof TState, any> = {};
      const originalState = deepCopy(state);
      getKeysToPersist(state).forEach(key => {
        const ref = state[key];
        if (isEditableRef(ref)) {
          const persistedValue = (persistedUnwrappedState as any)[key];
          const restoredValue = restoreFields?.[key]?.(persistedValue) ?? persistedValue;
          logger.info(
            'Restoring',
            key,
            'to',
            restoredValue,
            'from persisted',
            persistedUnwrappedState,
          );
          ref.value = restoredValue;
          restoredRefs[key] = restoredValue;
        }
      });
      const newState = deepCopy(state);
      logger.info(`Restored state for "${argsPath}"`, {
        originalState,
        newState,
        restoredRefs,
      });
    },

    persistState(argsPath: string, state: TState): void {
      logger.group(`Persisting state for "${argsPath}"`);
      const keys = getKeysToPersist(state);
      logger.info('Keys to persist:', keys);
      const valueToSave = keys.reduce((map, key) => {
        const ref = state[key];
        if (!isEditableRef(ref)) return;

        map[key] = getRefValue(ref);
        return map;
      }, {} as any);
      logger.info('Persisted state:', valueToSave);
      storage.setItem('VIEW_MODEL.' + argsPath, JSON.stringify(valueToSave));
      logger.endGroup();
    },
  };
}
