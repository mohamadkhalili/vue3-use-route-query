<template>
    <client-only>
        <button @click="routeQuery++">Add count query 1</button>
    </client-only>
</template>

<script setup lang="ts">
import { useRouteQuery } from 'vue3-use-route-query';

const routeQuery = useRouteQuery("count", 0, { type: "number", navigationType: 'push' });

</script>