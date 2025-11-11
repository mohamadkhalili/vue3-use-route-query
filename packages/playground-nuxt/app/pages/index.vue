<template>
    <div>
        <CounterAction />
        <p>
            routeQuery: {{ routeQuery }}
        </p>
        <p>
            routeQueryType: {{ typeof routeQuery }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { useRouteQuery } from 'vue3-use-route-query';

const routeQuery = useRouteQuery("count", 0, { type: "number", navigationType: 'push' });

</script>

<style scoped></style>
