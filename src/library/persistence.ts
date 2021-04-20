import { isRef, Ref, UnwrapRef } from "vue";

export interface PersistenceOptions<S> {
  storage: Storage;
  keysToPersist?: Array<keyof S>;
  restoreFields?: Partial<
    {
      [key in keyof S]: (value: any) => UnwrapRef<S[key]>;
    }
  >;
}

function getRefValue<T>(ref: Ref<T | undefined>): T | undefined {
  return ref.value == null ? undefined : JSON.parse(JSON.stringify(ref.value));
}

export function managePersistedState<S>({
  storage,
  keysToPersist,
  restoreFields,
}: PersistenceOptions<S>) {
  const getKeysToPersist = (state: S): Array<keyof S> =>
    keysToPersist ?? ((Object.entries(state) as unknown) as Array<keyof S>);

  return {
    restorePersistedRefs(argsPath: string, state: S): void {
      const stateString = storage.getItem(argsPath);
      console.log(argsPath, { stateString });
      if (stateString == null) return undefined;
      const persistedUnwrappedState: UnwrapRef<S> = JSON.parse(stateString);

      getKeysToPersist(state).forEach((key) => {
        const ref = state[key];
        if (isRef(ref)) {
          const persistedValue = (persistedUnwrappedState as any)[key];
          ref.value = restoreFields?.[key]?.(persistedValue) ?? persistedValue;
        }
      });
    },

    persistState(argsPath: string, state: S): void {
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
