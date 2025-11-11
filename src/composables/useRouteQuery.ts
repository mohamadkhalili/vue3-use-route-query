import { ref, watch, computed } from 'vue';

// Global variables for route and router instances
let routeGetter: any = undefined;
let router: any = undefined;

// Create a global parameter object for browser environment
let globalParam = {}
if (typeof window !== 'undefined') {
    globalParam = window
}

// Initialize a queue for batch processing query parameters
// This prevents multiple rapid router updates
(globalParam as any).paramsQueue = {};
let timer: any = null;

/**
 * Adds query parameters to a queue for batch processing
 * This function debounces multiple rapid parameter changes
 * @param param - The query parameters to add
 * @param navigationType - Whether to use 'push' or 'replace' for navigation
 */
(globalParam as any).addQueryParam = function (param: any, navigationType: 'push' | 'replace') {
    (globalParam as any).paramsQueue = { ...(globalParam as any).paramsQueue, ...param };
    if (timer === null) {
        // Debounce timer: wait 30ms to batch multiple parameter changes
        timer = setTimeout(() => {
            processParams((globalParam as any).paramsQueue, navigationType);
            (globalParam as any).paramsQueue = {};
            timer = null;
        }, 30);
    }
}

/**
 * Processes batched query parameters and updates the router
 * @param params - The query parameters to process
 * @param navigationType - Whether to use 'push' or 'replace' for navigation
 */
function processParams(params: any, navigationType: 'push' | 'replace') {
    // Get current route dynamically
    const currentRoute = routeGetter ? routeGetter() : null;

    if (router && currentRoute && params) {
        if (navigationType === 'push') {
            router.push({ query: { ...currentRoute?.query, ...params } }).catch((err: any) => console.error('Router push error:', err));
        } else {
            router.replace({ query: { ...currentRoute?.query, ...params } }).catch((err: any) => console.error('Router replace error:', err));
        }
    }
}

// Type definitions for query parameters
export type typeQuery = boolean | number | string | Array<string> | Array<number> | Array<any> | undefined
export type typeQueryValues =
    | 'boolean'
    | 'number'
    | 'string'
    | 'Array'
    | 'Array<number>'
    | 'Array<string>'
    | 'Array<object>';
export type QueryTypeValues =
    | 'boolean'
    | 'number'
    | 'string'
    | 'Array'
    | 'Array<number>'
    | 'Array<string>'
    | 'Array<object>';
type QueryTypeMap = {
    boolean: boolean;
    number: number;
    string: string;
    Array: unknown[];
    'Array<number>': number[];
    'Array<string>': string[];
    'Array<object>': object[];
};

/**
 * Encodes a boolean value to a string for URL query parameters
 * @param value - The boolean value to encode
 * @returns The encoded string ('true' or 'false') or undefined
 */
function encodeBoolean(value: boolean | undefined): string | undefined {
    if (value === undefined) return undefined;
    return value ? 'true' : 'false';
}

/**
 * Decodes a string value from URL query parameters to a boolean
 * @param value - The string value to decode
 * @returns The decoded boolean value or undefined
 */
function decodeBoolean(value: string | undefined): boolean | undefined {
    if (!value) return undefined;
    return value === 'true';
}

/**
 * Encodes a number value for URL query parameters
 * @param value - The number value to encode
 * @returns The encoded number or undefined
 */
function encodeNumber(value: number | undefined): number | undefined {
    if (value === undefined) return undefined;
    return value;
}

/**
 * Decodes a string value from URL query parameters to a number
 * @param value - The string value to decode
 * @returns The decoded number value or undefined
 */
function decodeNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    return Number(value);
}

/**
 * Encodes a string value for URL query parameters
 * @param value - The string value to encode
 * @returns The encoded string or undefined
 */
function encodeString(value: string | undefined): string | undefined {
    if (value === undefined) return undefined;
    return String(value);
}

/**
 * Decodes a string value from URL query parameters
 * @param value - The string value to decode
 * @returns The decoded string value or undefined
 */
function decodeString(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return String(value);
}

/**
 * Encodes an array to a delimited string for URL query parameters
 * @param value - The array to encode
 * @param delimiter - The delimiter to use (default: ',')
 * @returns The encoded string or undefined
 */
function encodeArray(value: (string | number)[] | undefined, delimiter: string = ','): string | undefined {
    if (!value || value.length === 0) return undefined;
    return value.join(delimiter);
}

/**
 * Decodes a delimited string from URL query parameters to an array
 * @param value - The string value to decode
 * @param initialValue - The initial array value for fallback
 * @param delimiter - The delimiter to use (default: ',')
 * @returns The decoded array or undefined
 */
function decodeArray(value: string | undefined, initialValue: Array<string> | Array<number> | undefined, delimiter: string = ','): string[] | undefined {
    if (!value) return Array.isArray(initialValue) ? initialValue.map(String) : undefined;
    return value.split(delimiter);
}

/**
 * Encodes an array of objects to a delimited JSON string for URL query parameters
 * @param value - The array of objects to encode
 * @param delimiter - The delimiter to use (default: ',')
 * @returns The encoded string or undefined
 */
function encodeArrayObject(value: any, delimiter: string = ','): string | undefined {
    if (!value) return undefined;
    if (!Array.isArray(value)) {
        value = [value];
    }
    const result = value.map((item: any) =>
        encodeURIComponent(JSON.stringify(item))
    );
    if (result.length === 0) return undefined;
    return result.join(delimiter);
}

/**
 * Decodes a delimited JSON string from URL query parameters to an array of objects
 * @param value - The string value to decode
 * @param initialValue - The initial array value for fallback
 * @param delimiter - The delimiter to use (default: ',')
 * @returns The decoded array of objects or undefined
 */
function decodeArrayObject(value: string | undefined, initialValue: any[] | undefined, delimiter: string = ','): any[] | undefined {
    if (!value) return initialValue;
    const items = value.split(delimiter);
    return items.map((item: string) => JSON.parse(decodeURIComponent(item)));
}

/**
 * Encodes a query value based on its type
 * @param value - The value to encode
 * @param type - The type of the value
 * @param delimiter - The delimiter for array types (default: ',')
 * @returns The encoded value or undefined
 */
export function encodeQueryValue(
    value: typeQuery,
    type: typeQueryValues,
    delimiter: string = ','
): string | number | undefined {
    switch (type) {
        case 'boolean':
            return encodeBoolean(value as boolean | undefined);
        case 'number':
            return encodeNumber(value as number | undefined);
        case 'string':
            return encodeString(value as string | undefined);
        case 'Array':
        case 'Array<string>':
        case 'Array<number>':
            return encodeArray(value as (number[] | string[]) | undefined, delimiter);
        case 'Array<object>':
            return encodeArrayObject(value, delimiter);
        default:
            console.warn('encodeQueryValue: Unknown type provided');
            return undefined;
    }
}

/**
 * Decodes a query value based on its type
 * @param rawValue - The raw string value from the URL
 * @param type - The expected type of the value
 * @param initialValue - The initial value for fallback
 * @param delimiter - The delimiter for array types (default: ',')
 * @returns The decoded value
 */
export function decodeQueryValue(
    rawValue: string | undefined,
    type: typeQueryValues,
    initialValue: typeQuery,
    delimiter: string = ','
): typeQuery {
    switch (type) {
        case 'boolean':
            return decodeBoolean(rawValue);
        case 'number':
            return decodeNumber(rawValue);
        case 'string':
            return decodeString(rawValue);
        case 'Array':
        case 'Array<string>':
        case 'Array<number>':
            return decodeArray(rawValue, initialValue as string[] | number[] | undefined, delimiter);
        case 'Array<object>':
            return decodeArrayObject(rawValue, initialValue as any[] | undefined, delimiter);
        default:
            console.warn('decodeQueryValue: Unknown type provided');
            return initialValue;
    }
}

/**
 * Vue 3 / Nuxt 3 Composable for syncing reactive values with URL query parameters
 * 
 * @param key - The query parameter key to sync with
 * @param initialValue - The initial value if no query parameter exists
 * @param config - Configuration object
 * @param config.type - The data type of the query parameter
 * @param config.navigationType - Whether to use 'push' or 'replace' for router navigation
 * @param config.delimiter - The delimiter for array values (default: ',')
 * 
 * @returns A reactive ref that syncs with the URL query parameter
 * 
 * @example
 * ```typescript
 * // Basic usage with string
 * const searchQuery = useRouteQuery('search', '', { type: 'string' })
 * 
 * // With number
 * const page = useRouteQuery('page', 1, { type: 'number' })
 * 
 * // With array
 * const filters = useRouteQuery('filters', [], { type: 'Array<string>' })
 * ```
 */
export function useRouteQuery<
    T extends QueryTypeValues
>(
    key: string,
    initialValue: any,
    config: {
        type: T;
        navigationType: 'push' | 'replace';
        delimiter?: string;
    } = {
            type: 'string' as T,
            navigationType: 'replace',
            delimiter: ','
        }
) {
    // Local route reference for this composable instance
    let localRoute: any = null;
    let localRouter: any = null;

    // Initialize router and route for this specific instance
    try {
        // Check for Nuxt 3 environment
        const globalContext = globalThis as any;

        // First attempt: Check for Nuxt 3 with auto-imported composables
        if (globalContext.useRoute && globalContext.useRouter) {
            localRoute = globalContext.useRoute();
            localRouter = globalContext.useRouter();

            // Store route getter function for global use
            if (!routeGetter) {
                routeGetter = globalContext.useRoute;
            }
            if (!router) {
                router = localRouter;
            }
        }
        // Second attempt: Check for Nuxt app instance
        else if (globalContext.$nuxt) {
            localRoute = globalContext.$nuxt.$router.currentRoute;
            localRouter = globalContext.$nuxt.$router;

            if (!routeGetter) {
                routeGetter = () => globalContext.$nuxt.$router.currentRoute.value;
            }
            if (!router) {
                router = localRouter;
            }
        }
        // Third attempt: Check for useNuxtApp
        else if (globalContext.useNuxtApp) {
            const nuxtApp = globalContext.useNuxtApp();
            if (nuxtApp && nuxtApp.$router) {
                localRoute = nuxtApp.$router.currentRoute;
                localRouter = nuxtApp.$router;

                if (!routeGetter) {
                    routeGetter = () => nuxtApp.$router.currentRoute.value;
                }
                if (!router) {
                    router = localRouter;
                }
            }
        }
        // Fourth attempt: Try to import from vue-router (for Vue 3 apps)
        else {
            // Try to get Vue Router from global scope first
            const VueRouter = (globalContext as any).VueRouter;
            if (VueRouter && VueRouter.useRoute && VueRouter.useRouter) {
                localRoute = VueRouter.useRoute();
                localRouter = VueRouter.useRouter();

                if (!routeGetter) {
                    routeGetter = VueRouter.useRoute;
                }
                if (!router) {
                    router = localRouter;
                }
            } else {
                // Dynamic import fallback
                import('vue-router').then((vueRouterModule) => {
                    if (vueRouterModule && vueRouterModule.useRoute && vueRouterModule.useRouter) {
                        localRoute = vueRouterModule.useRoute();
                        localRouter = vueRouterModule.useRouter();

                        if (!routeGetter) {
                            routeGetter = vueRouterModule.useRoute;
                        }
                        if (!router) {
                            router = localRouter;
                        }
                    }
                }).catch(() => {
                    console.warn('Vue Router is not available. The composable will return a simple ref without query sync.');
                });
            }
        }
    } catch (error) {
        console.warn('Failed to initialize router. Make sure you are using this composable inside a Vue/Nuxt component setup.', error);
    }

    // If router is still not available, return a simple ref
    if (!localRouter || !localRoute) {
        console.warn(`useRouteQuery: Router not available. Returning a simple ref for key "${key}".`);
        return ref(initialValue);
    }

    // Create reactive reference for the query value
    const queryValue = ref<QueryTypeMap[T]>(initialValue);

    // Create computed property to get current route query value
    const currentQueryValue = computed(() => {
        // Handle both reactive route object and route ref
        const route = typeof localRoute === 'function' ? localRoute() : localRoute;
        const routeValue = route?.value || route;
        return routeValue?.query?.[key];
    });

    // Initialize value from existing query parameter if present
    const initValue = currentQueryValue.value;
    if (initValue) {
        let decoded = decodeQueryValue(initValue as string, config.type, initialValue, config.delimiter);

        // Special handling for number arrays to ensure correct type
        if (config.type === 'Array<number>' && Array.isArray(decoded)) {
            queryValue.value = decoded.map(Number);
        } else {
            queryValue.value = decoded;
        }
    }

    // Flag to prevent infinite loop between watchers
    let isUpdatingFromRoute = false;
    let isUpdatingFromLocal = false;

    // Watch for local value changes and update URL
    watch(
        queryValue,
        (newVal) => {
            if (isUpdatingFromRoute) {
                isUpdatingFromRoute = false;
                return;
            }

            isUpdatingFromLocal = true;
            let encodedVal = encodeQueryValue(newVal, config.type, config.delimiter);

            // Special handling for number arrays
            if (config.type === 'Array<number>' && Array.isArray(newVal)) {
                encodedVal = encodeArray(newVal, config.delimiter);
            }

            // Add to queue for batch processing
            (globalParam as any).addQueryParam(
                { [key]: encodedVal },
                config.navigationType
            );
        },
        { deep: true }
    );

    // Watch for URL query changes and update local value
    watch(
        currentQueryValue,
        (newVal: any) => {
            if (isUpdatingFromLocal) {
                isUpdatingFromLocal = false;
                return;
            }

            // Decode the new value from URL
            let decoded = decodeQueryValue(newVal, config.type, initialValue, config.delimiter);

            // Special handling for number arrays
            if (config.type === 'Array<number>' && Array.isArray(decoded)) {
                decoded = decoded.map(Number);
            }

            // Only update if the value actually changed
            const currentValue = queryValue.value;
            const hasChanged = JSON.stringify(currentValue) !== JSON.stringify(decoded);

            if (hasChanged) {
                isUpdatingFromRoute = true;
                queryValue.value = decoded as QueryTypeMap[T];
            }
        },
        { immediate: true, flush: 'sync' }
    );

    // Initialize query parameter if not present but initial value is provided
    if (!currentQueryValue.value && initialValue !== undefined && localRouter) {
        const route = typeof localRoute === 'function' ? localRoute() : localRoute;
        const routeValue = route?.value || route;

        // Use navigation type from config
        if (config.navigationType === 'push') {
            localRouter
                .push({ query: { ...routeValue?.query } })
                .catch((err: any) => console.error('Router push error during initialization:', err));
        } else {
            localRouter
                .replace({ query: { ...routeValue?.query } })
                .catch((err: any) => console.error('Router replace error during initialization:', err));
        }
    }

    return queryValue;
}

// Type declarations for global scope
declare global {
    interface Window {
        __NUXT__?: any;
    }
}