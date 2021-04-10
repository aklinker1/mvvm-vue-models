<template>
  <div class="bg-gray-600 bg-opacity-50 absolute inset-0">
    <router-link to="/" class="w-full h-full flex items-center justify-center" :draggable="false">
      <div class="bg-gray-800 rounded-lg p-8 shadow-md cursor-default" @click.prevent.stop>
        <router-view />
      </div>
    </router-link>
  </div>
</template>
