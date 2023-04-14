<script >

import {
    ref,
    uploadBytes,
    getStorage,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

import { storage } from '../firebase';
import { db } from '../http/apihttp';

// import baseUrl from '../http/apihttp';
export default {

    data() {
        return {
            // baseurl: 'http://localhost:5555/api',
            username: '',
            password: '',
            email: '',
            mostraBox: true,
            userSuperAdmin: {},
            usersAll: [],
            name: '',
            img: '',
            img2: ''
        }
    },
    created() {
        console.log(db)
    },
    methods: {
        getAllUsers() {
            setInterval(() => {
                fetch(`${db}/client/users`, {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(data => {
                        // console.log(data)
                        this.usersAll = data;
                    })
            }, 4000)
        },
        onSubmit(e) {
            e.preventDefault();
            // console.log(this.username, this.password);
            const value = {
                username: this.username,
                password: this.password
            }
            fetch(`${db}/auth/signin`, {
                method: 'POST',
                body: JSON.stringify(value)
            })
                .then(response => response.json())
                .then(async data => {
                    this.mostraBox = false;
                    // console.log(data);
                    this.userSuperAdmin = await data;
                    localStorage.setItem("profile", JSON.stringify(data))

                    this.getAllUsers();

                    this.username = '';
                    this.password = '';
                })
        },
        agregarAdmin(e) {
            e.preventDefault();
            const value = {
                UID: "",
                Username: this.username,
                Password: this.password,
                Email: this.email,
                img: "../assets/img/user.svg",
                role: "admin",
                owner: this.userSuperAdmin.User.objectId,
            };
            const imageRef = ref(storage, value.Username);

            uploadBytes(imageRef, this.img2)
                .then(() => {
                    getDownloadURL(imageRef).then(async (url) => {
                        value.img = await url;

                        const data = await fetch(`${db}/auth/signup`, {
                            method: "POST",
                            body: JSON.stringify(value)
                        });

                        console.log(data);

                        return data.json();


                    })
                })


        },
        handleImage(e) {
            if (e.target.files[0]) {
                this.img2 = e.target.files[0];
                const data = URL.createObjectURL(e.target.files[0]);
                this.img = data;
            }
        }

    }
}

</script>

<template>
    <div class="container-superadmin" v-if="mostraBox">
        <div class="box-superadmin p-2">
            <div class="form-group">
                <label class="sr-only" for="inlineFormInputGroup">Username</label>
                <div class="input-group mb-2">
                    <div class="input-group-prepend">
                        <div class="input-group-text">@</div>
                    </div>
                    <input type="text" class="form-control" v-model="username" id="inlineFormInputGroup"
                        placeholder="Username">
                </div>
            </div>
            <div class="form-group">
                <label class="sr-only"  for="password">Password</label>
                
                <input type="password" class="form-control" v-model="password" name="password" placeholder="Password">
            </div>
            <div class="text-center mt-1">
                <button type="submit" class="btn btn-success text-dark" @click="onSubmit($event)">Iniciar Sesión</button>
            </div>
        </div>

    </div>
    <div class="container-superadmin2 p-4" v-if="!mostraBox">

        <div>
            <!-- Button trigger modal -->
            <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                Agregar Administrador
            </button>
            <table class="table bg bg-light text-center">
                <thead>
                    <tr>
                        <th>UID</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>ROL</th>
                        <th>IMAGE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in usersAll" :key="item.objectId">
                        <td>{{ item.objectId }}</td>
                        <td>{{ item.username }}</td>
                        <td>{{ item.email }}</td>
                        <td>{{ item.role }}</td>
                        <td v-if="item.img == ''"><img style="width:32px;" src="../assets/img/user.svg" alt="" /></td>
                        <td v-if="item.img != ''"> <img style="width:32px" :src="item.img" alt="" /></td>
                        <td><button class="btn btn-danger"><i class="fa-solid fa-trash"></i></button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Modal -->
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" class="form-control" v-model="username" name="name" placeholder="Username">
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" v-model="password" name="password"
                                placeholder="Password">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" v-model="email" name="email" placeholder="Email">
                        </div>
                        <div class="form-group">
                            <input type="file" className="mb-2" class="form-control" @change="handleImage($event)" />
                            <div className="text-center p-4" v-if="img != ''">
                                <img style="width: 100px; height: 100px; margin: auto;" :src="img" alt="" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal"
                            @click="agregarAdmin($event)">Agregar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.container-superadmin {
    background-image: url("../assets/img/caballos.jpg");
    background-size: 100% 100%;
    background-position: center;
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container-superadmin2 {
    background-image: url("../assets/img/caballos.jpg");
    background-size: 100% 100%;
    background-position: center;
    height: 100vh;
    width: 100%;
}

.box-superadmin {
    background: white;
    height: 280px;
    width: 280px;
    max-width: 280px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
</style>