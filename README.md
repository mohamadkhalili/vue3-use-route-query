# vue3-use-route-query

A Vue 3 composable to get and set URL query parameters reactively with support for different data types like `string`, `boolean`, `Array`, `number`, and `...`.

## Installation

You can install the package via npm:

```bash
npm install vue3-use-route-query
```

## Usage

### Importing the Plugin

After installation, you can use the plugin by importing useRouteQuery in your Vue components. You do not need to manually install the plugin; just import and use it.

```ts
import { useRouteQuery } from 'vue3-use-route-query';
```

### Example: Using useRouteQuery

Here's an example of how to use the useRouteQuery composable inside a Vue component to manage URL query parameters reactively.
In a Vue Component:

```vue
<template>
  <div>
    <p>Current value of "myParam": {{ myParam }}</p>
    <input v-model="myParam" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouteQuery } from 'vue3-use-route-query';

export default defineComponent({
  setup() {
    // Use useRouteQuery to bind a query parameter to a reactive value
    const myParam = useRouteQuery('myParam', 'defaultValue', {
      type: 'string',
      navigationType: 'replace',
    });

    return { myParam };
  },
});
</script>
```

In this example, the myParam query parameter will be bound to the reactive variable myParam. Any changes to myParam will update the URL, and changes to the URL will automatically update the reactive variable.

#### Parameters

The <code>useRouteQuery</code> composable accepts three parameters:

1. <code>key</code> (<code>string</code>): The name of the query parameter you want to manage.
2. <code>initialValue</code> (<code>TypeQuery</code>): The initial value of the query parameter if it’s not already set in the URL.
3. <code>config</code> (<code>UseRouteQueryConfig</code>): Configuration options for the query parameter.
    * <code>type</code> (<code>TypeQueryValues</code>): The type of the query parameter. Can be one of '<code>boolean'</code>, '<code>number</code>', '<code>string</code>', '<code>Array</code>', '<code>Array`<number>`</code>', '<code>Array`<string>`</code>', '<code>Array`<object>`</code>'.
    * <code>navigationType</code> (<code>'push' | 'replace'</code>): The navigation type used to update the query parameter in the URL. Use <code>'push'</code> to add a new entry to the history stack or <code>'replace'</code> to replace the current history entry.
     * <code>delimiter</code> (<code>'string' | 'undefined'</code>): The delimiter of Arrays. <code>default: ','</code>

#### Query Types

The <code>type</code> field in the configuration defines how the query parameter should be processed. The following types are supported:

* <code>boolean</code>: Interprets the value as a boolean (<code>true</code> or <code>false</code>).

* <code>number</code>: Interprets the value as an number number.

* <code>string</code>: Interprets the value as a string.

* <code>Array</code>: Interprets the value as a comma-separated list of strings.

* <code>Array`<number>`</code>: Interprets the value as a comma-separated list of numbers.

* <code>Array`<string>`</code>: Interprets the value as a comma-separated list of strings.

* <code>Array`<object>`</code>: Interprets the value as a comma-separated list of JSON-encoded objects.

#### Example of Different Types

##### boolean Type

```ts
const isLoggedIn = useRouteQuery('isLoggedIn', false, {
  type: 'boolean',
  navigationType: 'replace',
});
```

##### number Type

```ts
const userId = useRouteQuery('userId', 123, {
  type: 'number',
  navigationType: 'push',
});
```

##### Array Type

```ts
const tags = useRouteQuery('tags', [], {
  type: 'Array',
  navigationType: 'replace',
  delimiter: '|'
});
```

##### Array of Objects

```ts
const filters = useRouteQuery('filters', [], {
  type: 'Array<object>',
  navigationType: 'push',
});
```

#### Handling Changes

You can also watch and modify the query parameter reactively. Any change to the <code>queryValue</code> will update the URL, and vice versa.

For example:

```ts
const queryValue = useRouteQuery('filters', undefined);
watch(queryValue, (newValue) => {
  console.log('Query value changed:', newValue);
});
```

Multi Watch

```ts
const queryValue1 = useRouteQuery('filters', undefined);
const queryValue2 = useRouteQuery('filters', undefined);
watch([queryValue1,queryValue2], () => {
  console.log('queryValue1 or queryValue2 value changed:');
});
```

Returns

A <code>Ref</code> that contains the current value of the query parameter. This value is reactive and will automatically update when the query parameter in the URL changes, and vice versa.

## License

MIT License. See [LICENSE](https://opensource.org/license/MIT) for details.

## Contributions

Feel free to fork and contribute to this plugin! Pull requests are welcome. Make sure to add tests for any new features or bug fixes.
