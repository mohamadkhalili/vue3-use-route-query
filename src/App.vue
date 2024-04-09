<template>
  <SnackbarMessage />

  <div class="home">
    <button @click="show('success')">Show Success</button>
    <button @click="show('error')">Show Error</button>
    <button>Request API</button>
  </div>
</template>

<script setup lang="ts">
// import SnackbarMessage from "@/components/SnackbarMessage.vue";
import { inject } from "vue"

const globalSnackbar: any = inject('snackbar');

function show(status: string) {
  globalSnackbar.show('Your action was successful.', status);
  
}
</script>
