import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import { useTodoViewModel } from './state/TodoViewModel';
import { logger } from '../library';

logger.setEnabled(true);

createApp(App).use(router).mount('#app');

console.log('Todo 1 state on load', useTodoViewModel.getState(1));
setTimeout(() => {
  console.log('Todo 1 state 10 seconds later', useTodoViewModel.getState(1));
}, 10000);
