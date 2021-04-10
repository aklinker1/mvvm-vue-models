import { Ref } from "vue";

type WrapRefs<T extends Array<any>> = { [Key in keyof T]: Ref<T[Key]> };

const modelKeys = new Set<string>();

interface UseViewModel<A extends any[], S> {
    (...args: WrapRefs<A>): S;
}

export function defineVueModel<A extends any[], S>(
  modelKey: string,
  setup: (...args: A) => S
): UseViewModel<A, S> {
  if (modelKeys.has(modelKey)) {
    console.warn(`Multiple view models defined as \"${modelKey}\"`);
  } else {
    modelKeys.add(modelKey);
  }

  return function (...args) {
    const unwrappedArgs = args.map(arg => arg.value) as A;
    return setup(...unwrappedArgs);
  };
}
