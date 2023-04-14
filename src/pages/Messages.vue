<script>
    export default {
        props:{
            messages:[]
        },
        data(){
            return{
                props:{}
            }
        },
        created(){
           console.log(props)
        },
        methods:{

        }
    }
</script>



<template>
    <div>
        {{ messages }}
    </div>
</template>