import { ref, watch } from 'vue';

let useRoute: any, useRouter: any
if (typeof window !== 'undefined') {
    // Check if it's a Nuxt environment
    if (window?.__NUXT__ !== undefined) {
        import('#app').then(module => {
            useRoute = module.useRoute;
            useRouter = module.useRouter;
        }).catch(err => {
            console.error('Error importing #app:', err);
        });

    } else {
        // Dynamically import for Vue 3 (non-Nuxt)
        import('vue-router').then(module => {
            useRoute = module.useRoute;
            useRouter = module.useRouter;
        });
    }
}
else {
    if (process.server) {
        import('#app').then(module => {
            useRoute = module.useRoute;
            useRouter = module.useRouter;
        }).catch(err => {
            console.error('Error importing #app:', err);
        });
    }
}

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
            router.push({ query: { ...route?.query, ...params } });
        } else {
            router.replace({ query: { ...route?.query, ...params } });
        }
    }
}

// -----------------------------------
// نوع‌های قابل پشتیبانی
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


// -----------------------------------
// توابع رمزگذاری و رمزگشایی
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
 * @description در اینجا delimiter را به‌صورت پارامتر به توابع اضافه می‌کنیم.
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
 * @description این تابع را نیز تغییر می‌دهیم تا delimiter را پشتیبانی کند.
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
 * @description این تابع را نیز تغییر می‌دهیم تا delimiter را پشتیبانی کند.
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
export function useRouteQuery(
    key: string,
    initialValue: typeQuery,
    config: {
        type: typeQueryValues;
        navigationType: 'push' | 'replace';
        delimiter?: string;
    } = {
            type: 'string',
            navigationType: 'replace',
            delimiter: ',', // به‌صورت پیش‌فرض و در صورت نیاز کاربر، می‌توان مقدار آن را تغییر داد
        }
) {
    route = useRoute();
    router = useRouter();

    const queryValue = ref<typeQuery>(initialValue);

    if (route?.query?.[key]) {
        let rawValue = route.query[key] as string;
        let decoded = decodeQueryValue(rawValue, config.type, initialValue, config.delimiter);
        if (config.type === 'Array<number>' && Array.isArray(decoded)) {
            queryValue.value = decoded.map(Number);
        } else {
            queryValue.value = decoded;
        }
    }

    // واکچ کردن مقدار queryValue برای اعمال تغییر در URL
    watch(
        queryValue,
        (newVal) => {
            let encodedVal = encodeQueryValue(newVal, config.type, config.delimiter);
            if (config.type === 'Array<number>' && Array.isArray(newVal)) {
                // اگر نوع آرایه عددی بود، مجدداً از encodeArray استفاده می‌کنیم
                encodedVal = encodeArray(newVal, config.delimiter);
            }
            (globalParam as any).addQueryParam(
                { [key]: encodedVal },
                config.navigationType
            );
        },
        { deep: true }
    );

    // واکچ کردن مقدار موجود در route.query
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

    // در صورتی که query خالی باشد ولی initialValue تعریف شده باشد
    if (!route?.query[key] && initialValue !== undefined) {
        if (config.navigationType === 'push') {
            router
                .push({ query: { ...route.query } })
                .catch((err: any) => console.error(err));
        } else {
            router
                .replace({ query: { ...route.query } })
                .catch((err: any) => console.error(err));
        }
    }

    return queryValue;
}


declare global {
    interface Window {
        __NUXT__?: any;
    }
}
