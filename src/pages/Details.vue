<template>
    <div class="container-full" v-if="mostrarAterrizaje">
        <div class="boxSeguridad">
            <div class="box">
                <img src="../assets/img/caballos.jpg" alt="">
                <h3>Por motivos de seguridad espere el link de logueo</h3>
            </div>

        </div>
    </div>
</template>


<script>
import { useRoute } from 'vue-router';
import { http } from '../http/apihttp';

export default {

    data() {
        return {
            // baseurl: 'http://localhost:5555/api',
            user: {
                username: '',
                password: ''
            },
            mostrarAterrizaje: false
        }
    },
    created() {
        const route = useRoute();
        const id = route.params.id;
        // console.log(id)
        this.getUser(id)

    },
    methods: {
        getUser(id) {
            fetch(`${http}/client/users/findbyusername/${id}`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(data => {

                    if (data.message == 'User not found' || !data) {
                        this.mostrarAterrizaje = true;
                        // alert('usted no se encuentra asignado a ningun grupo');
                        return;
                    } else {
                        this.user = {
                            username: data.username,
                            password: data.plane
                        };

                        this.loguearse(data.username, data.plane);
                    }

                })
        },
        loguearse(username, password) {

            const value = {
                username,
                password
            };

            // console.log(value)

            fetch(`${http}/auth/signin`, {
                method: 'POST',
                body: JSON.stringify(value)
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data);
                    if (data) {
                        localStorage.setItem("profile", JSON.stringify(data))
                        // alertify.alert('', 'Usuario Logueado con exito', function () { alertify.success('Ok'); });
                        this.$router.push('/')
                    } else {
                        alertify.alert(data.message);
                    }

                }).catch(error => console.log(error))
        }
    }
}

// import { useRoute } from 'vue-router';
// const route = useRoute();
// const id = route.params.id;



</script>

<style>
.boxSeguridad {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.box{
    justify-content: center;
    flex-direction: column;
}

img {
    width: 250px;
    height: 250px;
    margin: auto;
    margin-bottom: 10px;
    border-radius: 50%;
    border: 2px solid gray;
    box-shadow: 0px 2px 19px 0px;
}
</style>