# vue3-snackbar-reactive

`vue3-snackbar-reactive` is a lightweight, reactive snackbar/notification component designed for Vue 3 applications. It offers a simple and flexible way to display temporary messages to the user, such as information, success, error, and warning notifications.

## Installation

First, install vue3-snackbar-reactive via npm or yarn:

```javascript
npm install vue3-snackbar-reactive
# or
yarn add vue3-snackbar-reactive

```


## Setup

To use vue3-snackbar-reactive in your Vue 3 project, follow these steps:

1- Import the SnackbarComponent and SnackbarParam in your main app file (e.g., main.js or main.ts).

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { SnackbarComponent, SnackbarParam } from 'vue3-snackbar-reactive';
import 'vue3-snackbar-reactive/styles';

const app = createApp(App);
```
2- Register the SnackbarComponent and provide the SnackbarParam.

```javascript
app.component('SnackbarMessage', SnackbarComponent);
app.provide('snackbar', SnackbarParam);
```
3-a- Add the <snackbarMessage/> component to the main layout of your project or wherever you want the snackbar notifications to appear.

```javascript
<template>
  <div>
    <!-- Your app's content -->
    <snackbarMessage/>
  </div>
</template>
```

## Usage

To display a snackbar/notification, you need to inject the snackbar into your component and use its show method. The show method allows you to specify the message, status (info, success, error, warning), and display time.

1- Import inject from Vue within the component you want to display the notification.

```javascript
import { inject } from 'vue';
```
2- Use inject to access the snackbar in the setup function.

```javascript
setup() {
  const snackbar = inject('snackbar');

  return {
    // Other setup properties
    snackbar,
  };
}
```
3- Use the snackbar.show method to display a notification.

```javascript
// Example: Displaying an information message for 3 seconds
snackbar.show('This is an info message.', 'info', 3000);

// Example: Displaying a success message
snackbar.show('Operation successful!', 'success');
```

The show method parameters are:

    message: The message to display.
    status: The type of notification (info, success, error, warning). Default is info.
    time: The display duration of the message in milliseconds. Default is 3000ms.

## Advanced Usage with Slots

vue3-snackbar-reactive supports slot usage for custom notification rendering. If you opt not to use a slot, the component uses its default internal rendering mechanism. Here's how to engage with slots for a personalized touch:

### Slot Props

The <snackbarMessage/> slot exposes three properties:

    message: string - The notification message.
    status: 'info' | 'success' | 'error' | 'warning' - The notification type.
    visible: boolean - The visibility state of the notification.

### Example

Incorporate the <snackbarMessage/> component with a slot to tailor its display:


```javascript
<snackbarMessage>
  <template v-slot:default="{ message, status, visible }">
    <div v-if="visible" :class="`snackbar snackbar-${status}`">
      {{ message }}
    </div>
  </template>
</snackbarMessage>
```

### Styling the Snackbar
You can style the snackbar based on the status prop to differentiate between info, success, error, and warning messages:
```css
.snackbar {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  color: #fff;
}

.snackbar-info { background-color: #2196F3; }
.snackbar-success { background-color: #4CAF50; }
.snackbar-error { background-color: #F44336; }
.snackbar-warning { background-color: #FFC107; }
```
Using slots allows you to craft a more detailed and user-centric notification system within your Vue 3 application, enhancing the UX with tailored messaging and styles.
