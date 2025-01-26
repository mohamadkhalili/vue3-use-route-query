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
            router.push({ query: { ...route.query, ...params } });
        } else {
            router.replace({ query: { ...route.query, ...params } });
        }
    }
}

export type typeQuery = boolean | number | string | Array<string> | Array<number> | undefined
export type typeQueryValues =
    | 'boolean'
    | 'number'
    | 'string'
    | 'Array'
    | 'Array<number>'
    | 'Array<string>'
    | 'Array<object>';


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
    return value;
}

function decodeString(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return value;
}

function encodeArray(value: string[] | number[] | undefined): string | undefined {
    if (!value || value.length === 0) return undefined;
    return value.join(',');
}

function decodeArray(value: string | undefined): string[] | undefined {
    if (!value) return [];
    return value.split(',');
}

function encodeArrayObject(value: any): string | undefined {
    if (!value) return undefined;
    if (!Array.isArray(value)) {
        value = [value];
    }
    const result = value.map((item: any) =>
        encodeURIComponent(JSON.stringify(item))
    );
    if (result.length === 0) return undefined;
    return result.join(',');
}

function decodeArrayObject(value: string | undefined): any[] | undefined {
    if (!value) return [];
    const items = value.split(',');
    return items.map((item: string) => JSON.parse(decodeURIComponent(item)));
}

export function encodeQueryValue(value: typeQuery, type: typeQueryValues): string | number | undefined {
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
            return encodeArray(value as number[] | string[] | undefined);
        case 'Array<object>':
            return encodeArrayObject(value);
        default:
            console.warn('encodeQueryValue: unknow');
            return undefined;
    }
}

export function decodeQueryValue(
    rawValue: string | undefined,
    type: typeQueryValues,
    initialValue: typeQuery
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
            return decodeArray(rawValue);
        case 'Array<object>':
            return decodeArrayObject(rawValue);
        default:
            console.warn('decodeQueryValue: unknow');
            return initialValue;
    }
}

/**
 * @param {string} key 
 * @param {typeQuery} initialValue 
 * @param {{ type: typeQueryValues, navigationType: 'push' | 'replace'}} config
 * @returns {Object} 
 */
export function useRouteQuery(
    key: string,
    initialValue: typeQuery,
    config: { type: typeQueryValues; navigationType: 'push' | 'replace' } = {
        type: 'string',
        navigationType: 'replace',
    }
) {
    route = useRoute();
    router = useRouter();

    const queryValue = ref<typeQuery>(initialValue);

    if (route.query?.[key]) {
        let rawValue = route.query[key] as string;
        let decoded = decodeQueryValue(rawValue, config.type, initialValue);

        if (config.type === 'Array<number>' && Array.isArray(decoded)) {
            queryValue.value = decoded.map(Number);
        }
        else {
            queryValue.value = decoded;
        }
    }

    watch(
        queryValue,
        (newVal) => {
            let encodedVal = encodeQueryValue(newVal, config.type);
            if (config.type === 'Array<number>' && Array.isArray(newVal)) {
                encodedVal = encodeArray(newVal);
            }

            (globalParam as any).addQueryParam(
                { [key]: encodedVal },
                config.navigationType
            );
        },
        { deep: true }
    );

    watch(
        () => route.query[key],
        (newVal: any) => {
            if (newVal !== queryValue.value) {
                let decoded = decodeQueryValue(newVal, config.type, initialValue);

                if (config.type === 'Array<number>' && Array.isArray(decoded)) {
                    queryValue.value = decoded.map(Number);
                } else {
                    queryValue.value = decoded;
                }
            }
        },
        { flush: 'sync' }
    );

    if (!route.query[key] && initialValue !== undefined) {
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
