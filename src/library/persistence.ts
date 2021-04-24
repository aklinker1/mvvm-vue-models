import { isRef, UnwrapRef } from "vue";
import logger from "./logger";
import { getRefValue } from "./utils";

export interface PersistenceOptions<TState> {
  storage: Storage;
  keysToPersist?: Array<keyof TState>;
  restoreFields?: Partial<
    {
      [key in keyof TState]: (value: any) => UnwrapRef<TState[key]>;
    }
  >;
}

export function managePersistedState<TState>({
  storage,
  keysToPersist,
  restoreFields,
}: PersistenceOptions<TState>) {
  const getKeysToPersist = (state: TState): Array<keyof TState> =>
    keysToPersist ??
    ((Object.entries(state) as unknown) as Array<keyof TState>);

  return {
    restorePersistedRefs(argsPath: string, state: TState): void {
      const stateString = storage.getItem("VIEW_MODEL." + argsPath);
      if (stateString == null) {
        logger.log(`State not persisted, skipping restore for ${argsPath}`);
        return undefined;
      }
      const persistedUnwrappedState: UnwrapRef<TState> = JSON.parse(
        stateString
      );

      const restoredEntries: [keyof TState, any][] = [];
      getKeysToPersist(state).forEach((key) => {
        const ref = state[key];
        if (isRef(ref)) {
          const persistedValue = (persistedUnwrappedState as any)[key];
          ref.value =
            persistedValue == null
              ? persistedValue
              : restoreFields?.[key]?.(persistedValue) ?? persistedValue;
          restoredEntries.push([key, getRefValue(ref)]);
        }
      });
      logger.info(`Restoring state for ${argsPath}`, {
        state: JSON.parse(stateString),
        restoredRefs: restoredEntries,
      });
    },

    persistState(argsPath: string, state: TState): void {
      const valueToSave: any = {};
      getKeysToPersist(state).forEach((key) => {
        const ref = state[key];
        if (!isRef(ref)) return;

        valueToSave[key] = getRefValue(ref);
      });
      logger.info(`Persisting state for ${argsPath}`, valueToSave);
      storage.setItem("VIEW_MODEL." + argsPath, JSON.stringify(valueToSave));
    },
  };
}
