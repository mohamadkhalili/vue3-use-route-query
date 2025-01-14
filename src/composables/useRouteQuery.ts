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
    if (router && route && params)
        if (navigationType === 'push')
            router.push({ query: { ...route.query, ...params } })
        else
            router.replace({ query: { ...route.query, ...params } })

}


export type typeQuery = boolean | number | string | Array<string> | Array<number> | undefined
export type typeQueryValues = 'Boolean' | 'Integer' | 'Float' | 'String' | 'Array' | 'Array<number>' | 'Array<string>' | 'Array<object>' // next feature | 'Map'
/**
 * A composable to get and set URL query parameters reactively.
 * @param {string} key - The name of the query parameter.
 * @param {string} initialValue - The initial value of the query parameter if not already set.
 * @returns {Object} - Contains the query parameter's reactive value.
 */

export function useRouteQuery(key: string, initialValue: typeQuery, config: { type: typeQueryValues, navigationType: 'push' | 'replace' } = { type: 'String', navigationType: 'replace' }) {

    route = useRoute();
    router = useRouter();

    const queryValue = ref(initialValue);
    if (route.query?.[key])
        if (config?.type === 'Array')
            queryValue.value = (route.query?.[key] as string)?.split(',')
        else if (config?.type === 'Array<number>')
            queryValue.value = (route.query?.[key] as string)?.split(',').map(Number)
        else if (config?.type === 'Array<string>')
            queryValue.value = (route.query?.[key] as string)?.split(',')
        else if (config?.type === 'Array<object>')
            queryValue.value = ((route.query?.[key] as string)?.split(','))?.map((item) => JSON.parse(decodeURIComponent(item)));
        else
            queryValue.value = route.query?.[key] as any

    watch(queryValue, () => {
        // let newQuery: any = undefined
        switch (config?.type) {
            case 'Boolean':
                // newQuery = { ...route.query, [key]: queryValue.value ? 'true' : 'false' };
                (globalParam as any).addQueryParam({ [key]: queryValue.value ? 'true' : 'false' }, config?.navigationType);
                break;
            case 'Integer':
                // newQuery = { ...route.query, [key]: queryValue.value };
                (globalParam as any).addQueryParam({ [key]: queryValue.value }, config?.navigationType);
                break;
            case 'Float':
                // newQuery = { ...route.query, [key]: queryValue.value };
                (globalParam as any).addQueryParam({ [key]: queryValue.value }, config?.navigationType);
                break;
            case 'String':
                // newQuery = { ...route.query, [key]: queryValue.value };
                (globalParam as any).addQueryParam({ [key]: queryValue.value }, config?.navigationType);
                break;
            case 'Array':
                // newQuery = { ...route.query, [key]: queryValue.value && (queryValue.value as string[])?.length > 0 ? (queryValue.value as string[])?.join(',') : undefined };
                (globalParam as any).addQueryParam({ [key]: queryValue.value && (queryValue.value as string[])?.length >= 0 ? (queryValue.value as string[])?.join(',') : undefined }, config?.navigationType);
                break;
            case 'Array<number>':
                // newQuery = { ...route.query, [key]: queryValue.value && (queryValue.value as number[])?.length > 0 ? (queryValue.value as number[])?.join(',') : undefined };
                (globalParam as any).addQueryParam({ [key]: queryValue.value && (queryValue.value as number[])?.length >= 0 ? (queryValue.value as number[])?.join(',') : undefined }, config?.navigationType);
                break;
            case 'Array<string>':
                // newQuery = { ...route.query, [key]: queryValue.value && (queryValue.value as string[])?.length > 0 ? (queryValue.value as string[])?.join(',') : undefined };
                (globalParam as any).addQueryParam({ [key]: queryValue.value && (queryValue.value as string[])?.length >= 0 ? (queryValue.value as string[])?.join(',') : undefined }, config?.navigationType);
                break;
            case 'Array<object>': {
                let newQueryValue = []
                if (Array.isArray(queryValue.value)) {
                    for (let item of queryValue.value) {
                        newQueryValue.push(encodeURIComponent(JSON.stringify(item)))
                    }
                }
                else {
                    newQueryValue.push(encodeURIComponent(JSON.stringify(queryValue.value)))
                }
                // newQuery = { ...route.query, [key]: (newQueryValue)?.length > 0 ? (newQueryValue as string[])?.join(',') : undefined };
                (globalParam as any).addQueryParam({ [key]: newQueryValue && newQueryValue?.length >= 0 ? (newQueryValue as string[])?.join(',') : undefined }, config?.navigationType);
                break;
            }
            default:
                console.warn('This query type not exist.')
                break;
        }
        // router.push({ query: { ...newQuery } })

    },
        { deep: true }
    );


    watch(() => route.query[key], (newVal: any) => {

        if (newVal !== queryValue.value) {
            switch (config?.type) {
                case 'Boolean':
                    queryValue.value = newVal === 'true' ? true : false;
                    break;
                case 'Integer':
                    queryValue.value = newVal ? Number(newVal) : undefined;
                    break;
                case 'Float':
                    queryValue.value = newVal ? Number(newVal) : undefined;
                    break;
                case 'String':
                    queryValue.value = newVal ? String(newVal) : undefined;
                    break;
                case 'Array':
                    queryValue.value = newVal ? ((newVal as string)?.split(',') || initialValue) : undefined;
                    break;
                case 'Array<number>':
                    queryValue.value = newVal ? (((newVal as string)?.split(',')).map(Number) || initialValue) : undefined;
                    break;
                case 'Array<string>':
                    queryValue.value = newVal ? ((newVal as string)?.split(',') || initialValue) : undefined;
                    break;
                case 'Array<object>':
                    queryValue.value = newVal ? (((newVal as string)?.split(','))?.map((item) => JSON.parse(decodeURIComponent(item))) || initialValue) : undefined;
                    break;
                default:
                    console.warn('This query type not exist.')
                    break;
            }
        }
    }, { flush: 'post' });



    if (!route.query[key] && initialValue !== undefined) {
        if (config?.navigationType === 'push')
            router.push({ query: { ...route.query } }).catch((err: any) => {
                console.error(err);
            });
        else
            router.replace({ query: { ...route.query } }).catch((err: any) => {
                console.error(err);
            });
    }

    return queryValue;
}