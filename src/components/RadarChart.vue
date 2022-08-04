<template>
    <div>
        <apexchart width="500" type="radar" :options="options" :series="series"></apexchart>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    stats: Array
})
const options = {
    chart: {
        id: 'vuechart-example'
    },
    xaxis: {
        categories: ['Hp', 'Atack', 'Defense', 'At-Esp', 'Def-Esp', 'Veloc']
    }
};
const series = computed(() => {
    return [
        {
            name: 'Estadisticas',
            data: props.stats
        }
    ]
})
</script>