# Vue Models

An MVVM (Model-View-ViewModel) state management solution with full typescript support and a familiar syntax for Vue.js 3!

```ts
const useCountViewModel = defineViewModel({
  name: "count",
  setup() {
    const count = ref(0);
    const increment = () => {
      count.value++;
    };

    return {
      count,
      increment
    };
  },
});
```

### Features

#### A Familiar Syntax

You don't have to learn anything new if you're already familiar with the Composition API

#### Parameterized State

When a vue model requires parameters, like an id, each combination of parameters is has it's own state - no need to make maps of ids to state.

#### Built-in Persistence

By default, all state is cached and reset when the page is reloaded, but solutions for persisting state using `sessionStorage` and `localStorage` included!

#### Cleaner Code

Just like the composition API, related logic is in a single place, a single file, instead of spread out across multiple files with other, unrelated code all around it

<br />

## Philosophy

Why not just use Vuex, Redux, Mobx, or any of the other single store state management solutions out there?

Having a single, large object where all the state for your application is stored is not a scalable approach. Yes, it works fine for small applications, but not for much longer as the application grows. Why are things like account info, search results, local edits, etc in the same place? What do they have to do with each other.

> And no, Vuex modules do not solve these problem

Here's a good [presentation by the creator of Vuex](https://www.youtube.com/watch?v=ajGglyQQD0k) on why Vuex v5 is going to be completely different, with no global store.

`vue-models` was built by developer who loves Android's ViewModels, saw this presentation on Vuex 5, was working on a React project with a massive Redux store for work, and realized that there is a better way.

Here are the guiding principles for `vue-models`:

- No single global store
- Shared, localized state
- No boilerplate from things like actions/mutations/getters

<br />

## Get Started

Similar to components, before you can use it, you need to define it! Lets look at the view model for a simple counter.

```ts
// countViewModel.ts
import { defineViewModel } from 'vue-models';

export const useCountViewModel = defineViewModel({
  // The name is used to uniquly identify this view model from others that are defined
  name: "count",
  setup() {
    const count = ref(0);
    const increment = () => {
      count.value++;
    };

    return {
      count,
      increment
    };
  },
});
```

After defining the view model, simply use it in a component like any other custom composition function!

```vue
<template>
  <p>{{ count }}</p>
  <button @click="increment">Increment</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCountViewModel } from './countViewModel';

export default defineComponent({
  setup() {
    // You can destructure anything that was returned from the setup function
    const { count, increment } = useCountViewModel();
    
    // Pull in other view models or do other things...
    
    return {
      count,
      increment,
      // ...
    };
  },
});
</script>
```

View model state is shared between all instances that use it. So for example, if you wanted 2 counters, 

### Parameterized State

A view model can be parameterized by adding arguments to the setup function.

```ts
export const useTodoViewModel = useVueModel({
  name: "todo",
  setup(id: number) {
    const todo = ref<Todo | undefined>();
    // ...
    return {
      todo,
    };
  },
});
```

Even though the `setup` function is defined to accept a plain `number`, you actually need to pass in a `Ref<number>` when using the view model in a component. In this case, we're using `vue-router` and the todo's ID is apart of the URL:

```ts
function useRouteParam<T>(param: string): Ref<T> {
  const route = useRoute();
  const paramValue = ref<T>(route.params[param]);
  watch(
    () => route.params,
    (newParams) => {
      paramValue.value = newParams[param];
    }
  );
  return paramValue;
}

export default defineComponent({
  setup() {
    // Get the `Ref<number>`
    const todoIdString = useRouteParam<string>('todoId');
    const todoId = computed(() => Number(todoIdString.value));
    
    // Pass in the `Ref<number>`
    const { todo } = useTodoViewModel(todoId);
    
    ...
  },
});
```

> By passing in the `Ref` instead of the plain value, the view model is able to react when the arguments are changed and update the state to match the state for the new combination of arguments.

A view model's state is shared between all instances with the same combination of arguments. Keep this in in mind because **parameters can be abused by over parameterizing the view model**. The only parameters that should be passed in are ones that need separate state.

```ts
const todoId1 = ref(1);
const todoId2 = ref(2);

const { todo: todoA } = useTodoViewModel(todoId1);
const { todo: todoB } = useTodoViewModel(todoId1);
const { todo: todoC } = useTodoViewModel(todoId2);

// `todoA` is the exact same object as `todoB` because their parameters are equal
console.log(todoA === todoB); // -> true

// `todoC` is different because it's parameter value is different
console.log(todoA === todoC); // -> false
console.log(todoB === todoC); // -> false
```

Parameters also have to be serializable to a string. You cannot simply pass in an object and expect parameterization to work. State is kept secret by creating a hash based on the value of each param's `toString` function. Without a `toString` method, the object could result in `"[object Object]"` instead of some kind of identifier inside the object. `string`s, `number`s, and `boolean`s all work without a custom `toString` function.


### Persistence

To persist a view model, include the `persistence` object when defining your view model.


```ts
const useCountViewModel = defineViewModel({
  name: "count",
  persistence: {
    storage: localStorage,
  },
  setup() {
    const count = ref(0);
    const increment = () => {
      count.value++;
    };

    return {
      count,
      increment
    };
  },
});
```

By default, all `ref`'s are persisted and restored. `computed` refs don't need to be stored because they will be recomputed once the ref's they are based off of is restored.

### Getting State from Outside a Component

Sometimes, you need to access the state from inside the scope of something other than a component. For example, in a router hook to check if a user is authenticated before going to the URL or redirecting them to the login.

In this case, you can get the current state from a view model, but it won't be reactive.

```ts
const state = useAuthViewModel.getState();
console.log(state?.isLoggedIn);
```

In this case, if `useAuthViewModel` hasn't been called from a component or it's not persisted to local storage or sessions storage, the resulting state will be `undefined`.

> `getState` also requires parameters when your view model is parameterized.
