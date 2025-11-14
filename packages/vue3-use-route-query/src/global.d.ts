// Global type declarations for vue3-use-route-query
declare global {
    interface Window {
        __NUXT__?: any;
        paramsQueue?: any;
        addQueryParam?: (param: any, navigationType: 'push' | 'replace') => void;
    }
}

export { };
