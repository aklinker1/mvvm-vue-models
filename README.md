# MVVM Vue Models

```bash
yarn add mvvm-vue-models
# Or
npm i --save mvvm-vue-models
```

A Model-View-ViewModel state management solution... but what does that even mean?

**This library provides utilities to create custom composition functions with managed state**.

```ts
import { defineViewModel } from 'mvvm-vue-models';

export const useCountViewModel = defineViewModel({
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

The state returned from the `setup` function is shared accross all components that call `useCountViewModel()` (just like how Vuex's state is shared between components)

```vue
<script lang="ts">
import { defineComponent } from 'vue';
import { useCountViewModel } from './CountViewModel.ts';

export default defineComponent({
  setup() {
    return useCountViewModel();
  };
});
</script>
```

### Features

- Full typescript support 🎉
- The same syntax as the Composition API 👏
- [Parameterized state](#parameterized-state) 🤖
- Built-in [persistence](#persistence)  💾

## Docs

### View Model Names

`defineViewModel` requires a name. Behind the scenes, the state is saved as a `Map<ViewModel.name, ViewModel.state>` and whenever you call `use*ViewModel`, the state is pulled out of that object based on the `name` property. 

```ts
export const useSomeViewModel = defineViewModel({
  name: "some-name",
  setup() {
    // ...
  },
});
```

If the name you provide is not unique, you will get a warning in the developer console. This is because you're overwritting the state at that name with two confliting sets of data.

### Parameterized State

A view model can be "parameterized" by adding arguments to the `setup` function.

```ts
import { Ref } from 'vue';
import { defineViewModel } from 'mvvm-vue-models';

export const useTodoViewModel = defineViewModel({
  name: "todo",
  setup(id: Ref<number>) {
    const todo = ref<Todo | undefined>();
    // ...
    return {
      todo,
    };
  },
});
```

> All parameters need to be of type `Ref`, otherwise the view model will not be able to react to changes

Now the view model's state is only be shared when `useTodoViewModel` is called with the same set of arguments.

```ts
const { todo: todoA } = useTodoViewModel(ref(1));
const { todo: todoB } = useTodoViewModel(ref(1));
const { todo: todoC } = useTodoViewModel(ref(2));

todoA === todoB // -> true
todoC !== todoA // -> true
todoC !== todoB // -> true
```

Since `todoA` and `todoB` share the same id, 1, the returned todos are the same! But because `todoC` is using a different id, 2, it's not equal to the others.

#### Parameterization Caveots

- Argument types must be uniquely serailizable to a string

  > State is kept separate by creating a hash based on the value of each arguments' `toString()`. Passing in a `Ref<Object>` will not work because every object's `toString()` results in `"[object Object]"`, which is not unique.
  > 
  > Basic types such as `number`, `string`, and `boolean` are prefered as arguments. But there are work arounds:
  >
  > 1. If you're using classes, you can override the `toString` method to return an ID or some other unique representation
  > 1. If you're using plain objects, you can create a computed ref based on that object's id or some other unique representation

- Don't over parameterize your view model

  > Only include parameters that, when any are changed, should result in separate states

### Persistence

By default, all state is cached in memory. When you close or reload the page, that cache is cleared and state forgotten.

To save the state of a view model to `sessionStorage` or `localStorage`, include the `persistence` object when defining your view model:

```ts
const usePersistedViewModel = defineViewModel({
  name: "example",
  persistence: {
    storage: localStorage,
  },
  // ...
});
```

By default, all `ref`'s are persisted and restored. To limit what is persisted or how values are restored, checkout the [`PersistenceOptions` type](https://github.com/aklinker1/mvvm-vue-models/blob/main/src/library/persistence.ts).

> `computed` refs and functions will never be stored because they are based on their definitions

### Accessing State Outside a Component

Sometimes, you need to access the state from inside the scope of something other than a component. For example, in a router hook to check if a user is authenticated and can access a certain page.

In this case, you can get the current state from a view model, but it won't be reactive.

```ts
const state = useAuthViewModel.getState();
if (!state?.isLoggedIn) {
  // Redirect to the forebidden, unauthorized, or login URL
}
```

The `getState` method will return `undefined` if:

- `use*ViewModel` has not been called yet
- AND there was no persisted state

### Enabling the Logger

By default, logs are disabled. It can be useful to enable logs to see when state is being persisted, what gets restored, etc.

In your application entry point, usually `main.ts`, simply enable logs:

```ts
import { logger } from 'mvvm-vue-models';

logger.setEnabled(true);
```

<br />

## Philosophy

Why not just use Vuex, Redux, Mobx, or any of the other single store state management solutions out there?

Having a single, large object where all the state for your application is stored is not a scalable approach. Yes, it works fine for small applications, but not for much longer as the application grows, it becomes a thorn in the developers side: lots of boilerplate, tests that have little value, etc. Not only is it a point point for developers, but things like account info, search results, local edits, etc are not related, and should not be related (same files) in the codebase.

> No, Vuex modules do not solve these problem. Adding solutions ontop of these libraries just makes the situation more complex, harder to read/understand, and mroe difficult for new developers to pick up.

The solution isn't adding libraries ontop of the existing state managment libraries, it's to **rethink how state should be managed in the first place**. Here's a good [presentation by the creator of Vuex](https://www.youtube.com/watch?v=ajGglyQQD0k) on why Vuex v5 is going to be completely different, with no global store.

`vue-models` was built by developer who loves Android's ViewModels, saw this presentation on Vuex 5, was working on a React project with a MASSIVE Redux store for work, and got sick of it.

Here are the guiding principles for `vue-models`:

- No single global store
- Shared, localized state
- No boilerplate from things like actions/mutations/getters
