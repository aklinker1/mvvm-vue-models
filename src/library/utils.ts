import { isReadonly, isRef, Ref } from "vue";

export function getRefValue<T>(ref: Ref<T | undefined>): T | undefined {
  return ref.value == null ? undefined : deepCopy(ref.value);
}

export function isEditableRef(ref: unknown): ref is Ref<any> {
  return isRef(ref) && !isReadonly(ref);
}

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
