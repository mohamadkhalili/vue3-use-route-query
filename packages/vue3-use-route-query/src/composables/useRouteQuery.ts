import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

let route: any = undefined;
let router: any = undefined;
let globalParam = {}
if (typeof window !== 'undefined') {
    globalParam = window
}

(globalParam as any).paramsQueue = {};
let timer: any = null;

(globalParam as any).addQueryParam = function (param: any, navigationType: 'push' | 'replace') {
    (globalParam as any).paramsQueue = { ...(globalParam as any).paramsQueue, ...param };
    if (timer === null) {
        timer = setTimeout(() => {
            processParams((globalParam as any).paramsQueue, navigationType);
            (globalParam as any).paramsQueue = {};
            timer = null;
        }, 30);
    }
}

function processParams(params: any, navigationType: 'push' | 'replace') {
    if (router && route && params) {
        if (navigationType === 'push') {
            router.push({ query: { ...route?.query, ...params } }).catch((err: any) => console.error('Router push error:', err));
        } else {
            router.replace({ query: { ...route?.query, ...params } }).catch((err: any) => console.error('Router replace error:', err));
        }
    }
}

// -----------------------------------
// Supported types
// -----------------------------------
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

// -----------------------------------
// Encoding and decoding functions
// -----------------------------------
function encodeBoolean(value: boolean | undefined): string | undefined {
    if (value === undefined) return undefined;
    return value ? 'true' : 'false';
}

function decodeBoolean(value: string | undefined): boolean | undefined {
    if (!value) return undefined;
    return value === 'true';
}

function encodeNumber(value: number | undefined): number | undefined {
    if (value === undefined) return undefined;
    return value;
}

function decodeNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    return Number(value);
}

function encodeString(value: string | undefined): string | undefined {
    if (value === undefined) return undefined;
    return String(value);
}

function decodeString(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return String(value);
}

/**
 * @description Here we add delimiter as a parameter to the functions.
 */
function encodeArray(value: (string | number)[] | undefined, delimiter: string = ','): string | undefined {
    if (!value || value.length === 0) return undefined;
    return value.join(delimiter);
}

function decodeArray(value: string | undefined, initialValue: Array<string> | Array<number> | undefined, delimiter: string = ','): string[] | undefined {
    if (!value) return Array.isArray(initialValue) ? initialValue.map(String) : undefined;
    return value.split(delimiter);
}

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

function decodeArrayObject(value: string | undefined, initialValue: any[] | undefined, delimiter: string = ','): any[] | undefined {
    if (!value) return initialValue;
    const items = value.split(delimiter);
    return items.map((item: string) => JSON.parse(decodeURIComponent(item)));
}

/**
 * @description We also modify this function to support delimiter.
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
            console.warn('encodeQueryValue: unknow');
            return undefined;
    }
}

/**
 * @description We also modify this function to support delimiter.
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
            console.warn('decodeQueryValue: unknow');
            return initialValue;
    }
}

/**
 * @param {string} key 
 * @param {typeQuery} initialValue 
 * @param {{ 
 *   type: typeQueryValues, 
 *   navigationType: 'push' | 'replace',
 *   delimiter?: string
 * }} config
 * @returns {Object} 
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
            delimiter: ',', // Default value, can be changed by user if needed
        }
) {
    try {
        route = useRoute();
        router = useRouter();
    } catch (error) {
        console.warn('Vue Router not available. Make sure you are using this composable inside a Vue component with router setup.');
        return ref(initialValue);
    }

    // Additional safety check
    if (!router || !route) {
        console.warn('Router or route is not available');
        return ref(initialValue);
    }
    const queryValue = ref<QueryTypeMap[T]>(initialValue);

    if (route?.query?.[key]) {
        let rawValue = route.query[key] as string;
        let decoded = decodeQueryValue(rawValue, config.type, initialValue, config.delimiter);
        if (config.type === 'Array<number>' && Array.isArray(decoded)) {
            queryValue.value = decoded.map(Number);
        } else {
            queryValue.value = decoded;
        }
    }

    // Watch queryValue for applying changes to the URL
    watch(
        queryValue,
        (newVal) => {
            let encodedVal = encodeQueryValue(newVal, config.type, config.delimiter);
            if (config.type === 'Array<number>' && Array.isArray(newVal)) {
                // If the type is a numeric array, use encodeArray again
                encodedVal = encodeArray(newVal, config.delimiter);
            }
            (globalParam as any).addQueryParam(
                { [key]: encodedVal },
                config.navigationType
            );
        },
        { deep: true }
    );

    // Watch the current value in route.query
    watch(
        () => route?.query[key],
        (newVal: any) => {
            if (newVal !== queryValue.value) {
                let decoded = decodeQueryValue(newVal, config.type, initialValue, config.delimiter);
                if (config.type === 'Array<number>' && Array.isArray(decoded)) {
                    queryValue.value = decoded.map(Number);
                } else {
                    queryValue.value = decoded;
                }
            }
        },
        { flush: 'sync' }
    );

    // If query is empty but initialValue is defined
    if (!route?.query[key] && initialValue !== undefined && router && route) {
        if (config.navigationType === 'push') {
            router
                .push({ query: { ...route.query } })
                .catch((err: any) => console.error('Router push error:', err));
        } else {
            router
                .replace({ query: { ...route.query } })
                .catch((err: any) => console.error('Router replace error:', err));
        }
    }

    return queryValue;
}


declare global {
    interface Window {
        __NUXT__?: any;
    }
}