import { isRef, UnwrapRef } from "vue";

export interface PersistenceOptions<TState> {
  storage: Storage;
  keysToPersist?: Array<keyof TState>;
  restoreFields?: Partial<
    {
      [key in keyof TState]: (value: any) => UnwrapRef<TState[key]>;
    }
  >;
}

function getRefValue<T>(ref: Ref<T | undefined>): T | undefined {
  return ref.value == null ? undefined : JSON.parse(JSON.stringify(ref.value));
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
      const stateString = storage.getItem(argsPath);
      console.log(argsPath, { stateString });
      if (stateString == null) return undefined;
      const persistedUnwrappedState: UnwrapRef<TState> = JSON.parse(
        stateString
      );

      getKeysToPersist(state).forEach((key) => {
        const ref = state[key];
        if (isRef(ref)) {
          const persistedValue = (persistedUnwrappedState as any)[key];
          ref.value = restoreFields?.[key]?.(persistedValue) ?? persistedValue;
        }
      });
    },

    persistState(argsPath: string, state: TState): void {
      const valueToSave: any = {};
      getKeysToPersist(state).forEach((key) => {
        const ref = state[key];
        if (!isRef(ref)) return;

        valueToSave[key] = getRefValue(ref);
      });
      storage.setItem(argsPath, JSON.stringify(valueToSave));
    },
  };
}
