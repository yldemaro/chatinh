<template>
    <div>
        <h1>Detalles</h1>
        <div v-if="!pokemon">
            loading........
        </div>
        <div class="w-4/6 mx-auto rounded-xl p-10 shadow-lg" v-if="pokemon">
            <h1 class="text-red-900 text-xl md:text-3xl mb-3">{{ pokemon.name }}</h1>
            <span v-for="types in type" class="m-2 p-2 rounded-full bg-red-500 shadow-md text-white">{{ types }}</span>

            <div class="flex flex-wrap p-4">
                <div class="flex-1 grid place-items-center">
                    <img class="w-48 h-48" :src="pokemon.sprites.front_default" :alt="pokemon.name" />
                </div>
                <div class="flex-1">
                    <button @click="changeBart()" style="background: blue; color:white;"
                        class="w-50 y-40 rounded-full p-2">{{ isRadar ? 'Radar' : 'Bar' }}</button>
                    <component :is="isRadar ? BartCharVue : RadarChartVue" :stats="stats" />
                    <!--<bart-char-vue :stats="stats" />-->
                </div>
            </div>
        </div>
        <router-link to="/">
            <button
                class="bg-red-500 p-3 rounded-full w-60 m-3 text-white hover:text-black hover:bg-white">Atras</button>
        </router-link>
    </div>
</template>


<script setup>

import { useRoute } from 'vue-router';
import { reactive, toRefs, computed, ref } from 'vue';
import BartCharVue from '../components/BartChar.vue';
import RadarChartVue from '../components/RadarChart.vue';

const route = useRoute();



const id = route.params.id;
const state = reactive({
    pokemon: null,
    stats: computed(() => filterStats()),
    type: computed(() => filterType())
})


function filterStats() {
    if (state.pokemon) {
        return state.pokemon.stats.map((stat) => stat.base_stat)
    }
}

function filterType() {
    if (state.pokemon) {
        return state.pokemon.types.map((type) => type.type.name)
    }
}


const { pokemon, stats, type } = toRefs(state);

fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()).then((data) => {

    state.pokemon = data;

    console.log(state.pokemon);
})


const isRadar = ref(true);


const changeBart = () => {
    isRadar.value = !isRadar.value;
}



</script>