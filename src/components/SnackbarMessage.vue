<template>
  <teleport to="body">
    <slot name="default" :message="snackbarState.message" :status="snackbarState.status"
      :visible="snackbarState.visible"></slot>
    <div v-if="!$slots.default" v-show="snackbarState.visible" :class="`snackbar ${snackbarState.status}`">
      {{ snackbarState.message }}
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { snackbarState } from '../index';

// const props = defineProps<Props>();

const show = ref(false);

// Method to show the snackbar
const displaySnackbar = () => {
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, 3000); // Hide after 3 seconds
};

// Watch for changes to the message prop to trigger the snackbar display
watch(() => snackbarState.message, (newValue) => {
  if (newValue) {
    displaySnackbar();
  }
});
</script>

<style scoped>
.snackbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 16px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeInOut 3s;
}

.snackbar.success {
  background-color: #4CAF50;
}

.snackbar.error {
  background-color: #F44336;
}

.snackbar.warning {
  background-color: #FFC107;
}

.snackbar.info {
  background-color: #2196F3;
}

@keyframes fadeInOut {

  0%,
  100% {
    opacity: 0;
  }

  10%,
  90% {
    opacity: 1;
  }
}
</style>../snackbarMessagePlugin../snackbarMessage..