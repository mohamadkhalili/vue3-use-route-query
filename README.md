# vue3-snackbar-reactive

`vue3-snackbar-reactive` is a Vue 3 component designed for displaying snackbar notifications. It is reactive and easily configurable, allowing for the display of information, success, error, and warning messages. This guide will cover how to install and use `vue3-snackbar-reactive` in your Vue 3 project.

## Installation

Before using `vue3-snackbar-reactive`, ensure it is installed and properly imported into your Vue application.

### Importing Component and Styles

First, import the `SnackbarComponent` and `SnackbarParam` into your project. Additionally, import the stylesheet to ensure the snackbar is displayed correctly.

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { SnackbarComponent, SnackbarParam } from '@/plugins/dist/index';
import '@/plugins/dist/style.css';

const app = createApp(App);

// Register the SnackbarMessage component globally
app.component('SnackbarMessage', SnackbarComponent);

// Provide the SnackbarParam to make it available throughout the application
app.provide('snackbar', SnackbarParam);

app.mount('#app');