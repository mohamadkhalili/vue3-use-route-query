import { reactive, readonly, ref } from 'vue';
import {default as SnackbarMessage} from './components/SnackbarMessage.vue';
import type { status, Snackbar } from './plugins/types'

export const snackbarState: Snackbar = reactive({
  status: 'info',
  message: '',
  visible: false,
});

const snackbarsStack = ref<Array<{ status: status, message: string, time: number }>>([]);

let runningStatus: boolean = false

function runningFunction() {
  runningStatus = true
  snackbarState.message = snackbarsStack.value[0].message
  snackbarState.status = snackbarsStack.value[0].status
  snackbarState.visible = true;
  setTimeout(() => {
    snackbarState.visible = false;
    snackbarsStack.value.shift()

    if (snackbarsStack.value.length > 0) {
      setTimeout(() => {
        runningFunction()
      }, 200)
    }
    else
      runningStatus = false
  }, snackbarsStack.value[0].time);
}

const useSnackbar = () => {
  const show = (message: string, status: status = 'info', time: number = 3000) => {
    snackbarsStack.value.push({ message: message, status: status, time: time })
    if (!runningStatus)
      runningFunction()
  };
  return { show };
};

const SnackbarParam = readonly(useSnackbar())

export {SnackbarMessage as SnackbarComponent, SnackbarParam }