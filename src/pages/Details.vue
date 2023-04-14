<template></template>


<script>
import { useRoute } from 'vue-router';

export default {

    data() {
        return {
            baseurl: 'http://localhost:5555/api',
            user: {
                username: '',
                password: ''
            }
        }
    },
    created() {
        const route = useRoute();
        const id = route.params.id;
        console.log(id)
        this.getUser(id)

    },
    methods: {
        getUser(id) {
            fetch(`${this.baseurl}/client/users/findbyusername/${id}`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    this.user = {
                        username: data.username,
                        password: data.plane
                    };

                    this.loguearse(data.username, data.plane);
                })
        },
        loguearse(username, password) {

            const value={
                username,
                password
            };

            console.log(value)

            fetch(`${this.baseurl}/auth/signin`, {
                method: 'POST',
                body: JSON.stringify(value)
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data);
                    if(data){
                        localStorage.setItem("profile", JSON.stringify(data))
                        alertify.alert('', 'Usuario Logueado con exito', function(){ alertify.success('Ok'); });
                    }else{
                        alertify.alert(data.message);
                    }
                    
                }).catch(error=> console.log(error))
        }
    }
}

// import { useRoute } from 'vue-router';
// const route = useRoute();
// const id = route.params.id;



</script>