# Vue Models

An MVVM (Model-View-ViewModel) state management solution with full typescript support for Vue.js 3!

```ts
const useViewModel = defineVueModel("my-view-model", () => {
  const someState = ref("some-state");
  return {
    someState,
  };
});
```

Features:

- **A localized approach to state management**: Instead of a single, large store with everything in it, create little bundles of logic geared toward a specific purpose
- **Cleaner code**: Just like the composition API, all relevant logic is in a single place, a single file, instead of spread out across multiple files with other, unrelated code all around it
- **Exact same syntax as the Composition API**: You don't have to learn anything new if you're already familiar with the Composition API
- **Builtin utilities for persisting state**: By default, all state is stored in the `SessionStorage`, but solutions for using the `LocalStorage` and _syncing state between tabs_ is also included!
- **Parameterized state**: When parameters are used in the setup method, different parameter combinations result in separately managed state

## More Examples!

Here are some examples for common UI patterns, and how they are accomplished using this library.

### Basic List of Items

```ts
const useTodoListViewModel = defineVueModel("todos", () => {
  const todos = ref<Todo[]>([]);
  const requestState = ref(RequestState.SUCCESS);
  const loadTodos = () => {
    try {
      requestState.value = RequestState.LOADING;
      todos.value = await axios.get("/api/todos");
      requestState.value = RequestState.SUCCESS;
    } catch (err) {
      todos.value = [];
      requestState.value = RequestState.FAILURE;
    }
  };

  return {
    todos,
    loadTodos,
  };
});
```

```ts
export default defineComponent(() => {
  const { todos, loadTodos, requestState } = useTodoListViewModel();

  onMount(loadTodos);

  return {
    todos,
    loadTodos,
  };
});
```

### Managing Individual Items by ID

This will store each item in a separate state!

```ts
const useTodoViewModel = defineViewModel("todo", (id: number) => {
    const todo = ref<Todo | undefined>(undefined);
    const name = computed(() => todo.name ?? "No name");

    const loadTodo = () => {
        todo.value = // ...
    };
    const saveTodo = () => {
        // ...
    };
    const deleteTodo = () => {
        // ...
    };

    return {
        todo,
        name,
        loadTodo,
        saveTodo,
        deleteTodo,
    }
})
```

The caveat with parameterized view models is that while the setup function shouldn't use reactive parameters, you have to pass in reactive values when using it in a component.

Here we're using `vue-router` and pulling the `todoId` from the url:

```ts
// Small wrapper to make the url param reactive
function useRouteParam<T>(param: string): Ref<T> {
    const route = useRoute();
    const paramValue = ref<T>(route.params[param]);
    watch(
        () => route.params,
        (newParams) => (paramValue.value = newParams.[param])
    );
    return paramValue;
}

// Use the reactive prop in the component's setup method
export default defineComponent(() => {
    const todoId = useRouteParam<number>("todoId");
    const { todo, name, loadTodo } = useTodoViewModel(todoId);
    watch(todoId, loadTodo);

    return {
        name,
    }
})
```

This is done because internally, the function returned by `defineVueModel` listens for changes to any of those parameters, and manages each combination of parameters as separate states.

### Search

Using parameterized Vue Models again, but this time to cache results based on some search string:

```ts
const useTodoListViewModel = defineVueModel(
  "todo-search",
  (searchText: string) => {
    const searchResults = ref<Todo[]>([]);
    const requestState = ref(RequestState.SUCCESS);
    const search = () => {
      try {
        requestState.value = RequestState.LOADING;
        searchResults.value = await axios.get("/api/todos", {
          params: { search: searchText },
        });
        requestState.value = RequestState.SUCCESS;
      } catch (err) {
        searchResults.value = [];
        requestState.value = RequestState.FAILURE;
      }
    };

    return {
      searchResults,
      search,
    };
  }
);
```

```vue
<template>
  <div>
    <input type="text" v-model="searchText" />
    <ul>
      <li v-for="searchResult of SearchResults" ... />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent(() => {
  const searchText = ref("");
  const { search, searchResults, requestState } = useTodoListViewModel();

  const timeout = ref<number | undefined>(undefined);
  watch(searchText, () => {
    if (timeout.value) clearTimeout(timeout);
    timeout.value = setTimeout(search, 500);
  });

  return {
    searchText,
    searchResults,
  };
});
</script>
```
