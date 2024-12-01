// src/index.ts
import { App } from 'vue';
import { useRouteQuery } from './composables/useRouteQuery';

export default {
    install(app: App) {
        // Optionally register global components or properties here
    },
};

export { useRouteQuery };
