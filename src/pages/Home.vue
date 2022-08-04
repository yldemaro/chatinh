<template>

    <h1>Cantidad de Pokemones: {{ pokemones.length }}</h1>


    <div class="p-2">
        <input type="text" placeholder="Nombre del Pokemon" v-model="name" class="mb-3 p-2 w-150 border-2 border-black-500" />
        <ul class="grid grid-cols-4 gap-4 text-center p-2 overflow-y-auto max-h-96">

            <li class="p-2 rounded hover:text-slate-300 hover:bg-red-100" v-for="pokemon in filteredPokemon"
                :key="pokemon.index">
                <router-link :to="`/details/${pokemon.index}`">
                    <span class="bg-red-100 p-2" style="border-radius: 50%;">{{ pokemon.index }} </span>
                    <h2>{{ pokemon.name }}</h2>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>

import { reactive, toRefs, computed } from 'vue';
const state = reactive({
    pokemones: [],
    name: '',
    filteredPokemon: computed(() => searchPokemon())
})

const { pokemones, name, filteredPokemon } = toRefs(state);



function searchPokemon() {
    return state.pokemones.filter((pokemon) => pokemon.name.includes(state.name.toLowerCase()))
}




fetch('https://pokeapi.co/api/v2/pokemon?limit=151').then(res => res.json()).then((data) => {

    data.results.forEach((element, index) => {
        const pokemon = {
            ...element,
            index: index + 1
        }
        state.pokemones.push(pokemon);
    });

    console.log(pokemones);
})
</script>