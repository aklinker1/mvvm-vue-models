import { Ref } from "vue";

export function getRefValue<T>(ref: Ref<T | undefined>): T | undefined {
  return ref.value == null ? undefined : JSON.parse(JSON.stringify(ref.value));
}
