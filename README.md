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

### Parameterized State

A view model can be "parameterized" by adding arguments to the setup function.

```ts
export const useTodoViewModel = defineViewModel({
  name: "todo",
  setup(
    // All parameters need to be of type `Ref`, otherwise the view model will not be able to react to changes
    id: Ref<number>
  ) {
    const todo = ref<Todo | undefined>();
    // ...
    return {
      todo,
    };
  },
});
```

Now, this view model's state will be shared between all instances with the same combination of parameters.

> For view models with 0 arguments, the state is shared between all view model instances.

Looking at the code below, since `todoA` and `todoB` share the same parameter, the returned state is the exact same.

```ts
const todoId1 = ref(1);
const todoId2 = ref(2);

const { todo: todoA } = useTodoViewModel(todoId1);
const { todo: todoB } = useTodoViewModel(todoId1);
const { todo: todoC } = useTodoViewModel(todoId2);

todoA === todoB // -> true
```

But because `todoC` is using a different parameter, it's not equal to the other todos.

```ts
todoC === todoA // -> false
todoC === todoB // -> false
```

Caveots:

- Argument types must be uniquely serailizable to a string

  > State is kept separate by creating a hash based on the value of each argument's `toString` function. Passing in a `Ref<Object>` will not work because every object's `toString()` results in `"[object Object]"`, which is not unique.
  >
  > If you're using classes, you can override the `toString` method to return an ID or something else unique.
  >
  > If you're using plain objects, you can create a computed ref based on that object's id or some other unique string to represent the object.

- Don't over parameterize your view model

  > Only include parameters that, when any are changed, should result in separate state

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

### Enabling the Logger

By default, logs are disabled. It can be useful to enable logs to see when state is being persisted, what gets restored, etc. In your application entry point, usually `main.ts`, simply enable logs:

```ts
import { logger } from 'mvvm-vue-models';

logger.setEnabled(true);
```
