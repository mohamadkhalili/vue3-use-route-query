import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { SnackbarComponent, SnackbarParam } from '.'

const app = createApp(App)

app.component('SnackbarMessage', SnackbarComponent);
app.provide('snackbar', SnackbarParam);
app.mount('#app')
