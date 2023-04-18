<script >
import { db } from '../firebase';
import firebase from "firebase";
import { http } from '../http/apihttp';
import { Clipboard } from "v-clipboard";

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
            groupsAll: [],
            linksAll: [],
            name: '',
            img: '',
            img2: '',
            mostrarUsuarios: true,
            mostrarGrupos: false,
            profile: {},
            mostrarLink: false,
            mostrarLinks: false
        }
    },
    async created() {
        // console.log(http)

        this.logueado();
    },
    methods: {
        async logueado() {


            this.profile = await JSON.parse(localStorage.getItem('profile'));
            if (this.profile?.User.role === 'superadmin') {
                await this.getAllUsers();
                await this.getAllRooms();
                await this.getAllLinks();

                setTimeout(() => {
                    this.getDatatable();
                }, 2000);

                this.mostraBox = false;
            } else {
                localStorage.clear();
                this.mostraBox = true;
            }



        },
        getAllUsers() {
            // setInterval(() => {
            fetch(`${http}/client/users`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data)
                    this.usersAll = data;
                })
            // }, 4000)
        },
        getAllRooms() {
            // setInterval(() => {
            fetch(`${http}/client/rooms`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(data => {

                    // if (data.message = 'None rooms created') {
                    //     this.groupsAll = [];
                    //     return;
                    // }
                    this.groupsAll = data;



                })
            // }, 4000)
        },
        getAllLinks() {
            // setInterval(() => {
            fetch(`${http}/client/links`, {
                method: "GET"
            }).then(response => response.json())
                .then(data => {
                    // console.log(data)
                    if (data.message == 'Not Links found') {
                        this.linksAll = [];
                        return;
                    }
                    this.linksAll = data;
                    // if (data.message = 'None rooms created') {
                    //     this.linksAll = [];
                    //     return;
                    // } else {
                    //     this.linksAll = data;
                    // }

                })
            // }, 4000)
        },
        onSubmit(e) {
            e.preventDefault();
            // console.log(this.username, this.password);
            const value = {
                username: this.username,
                password: this.password
            }
            fetch(`${http}/auth/signin`, {
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
        async agregarAdmin(e) {
            e.preventDefault();
            const value = {
                UID: "",
                Username: this.username.trim(),
                Password: this.password.trim(),
                Email: this.email.trim(),
                plane: this.password,
                img: "",
                role: "admin",
                owner: this.profile?.User.oid,
            };


            const storageRef = firebase
                .storage()
                .ref(`${this.img2.name}`)
                .put(this.img2);
            storageRef.on(
                "state_changed",
                (snapshot) => {
                    this.uploadValue =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                    console.log(error.message);
                },
                () => {
                    this.uploadValue = 100;
                    storageRef.snapshot.ref.getDownloadURL().then((url) => {
                        value.img = url || '';
                        fetch(`${http}/auth/signup`, {
                            method: "POST",
                            body: JSON.stringify(value)
                        }).then(response => response.json())
                            .then(async data => {
                                // console.log(data);
                                const value = {
                                    uid: null,
                                    name: this.username,
                                    alias: "",
                                    staff: [
                                        this.username
                                    ],
                                    members: [
                                        this.username
                                    ],
                                    img: url,
                                    status: false
                                }
                                if (data) {
                                    await fetch(`${http}/client/rooms`, {
                                        method: 'POST',
                                        body: JSON.stringify(value)
                                    })
                                        .then(response => response.json())
                                        .then(async data => {
                                            // console.log(data);
                                            const value = {
                                                Username: this.username,
                                                Room: data.oid
                                            }
                                            // console.log(value)
                                            // if (data) {
                                            await fetch(`${http}/client/links/generate`, {
                                                method: 'POST',
                                                body: JSON.stringify(value)
                                            }).then(response => response.json())
                                                .then(data => {
                                                    // console.log(data)
                                                    this.mostrarLink = true;
                                                    this.link = `${data.link}/${data.username}`;
                                                    alertify.alert(`Agregado Con exitos`);
                                                    this.getAllUsers();
                                                    // this.copiar(`${data.link}/${data.username}`);
                                                })
                                            // }
                                        })
                                }
                            })

                    });
                }
            );
        },
        handleImage(e) {
            if (e.target.files[0]) {
                this.img2 = e.target.files[0];
                const data = URL.createObjectURL(e.target.files[0]);
                this.img = data;
            }
        },
        users() {
            this.getAllUsers();
            this.mostrarUsuarios = !this.mostrarUsuarios;
            this.mostrarGrupos = false;
            this.mostrarLinks = false;
        },
        grupos() {
            this.getAllRooms();
            this.mostrarGrupos = !this.mostrarGrupos
            this.mostrarUsuarios = false;
            this.mostrarLinks = false;
            // this.mostrarUsuarios = false;
        },
        links() {
            this.getAllLinks();
            this.mostrarLinks = !this.mostrarLinks
            this.mostrarUsuarios = false;
            this.mostrarGrupos = false;
            // this.mostrarUsuarios = false;
        },
        logout() {
            localStorage.clear();
            this.mostraBox = true;
        },
        eliminarRoom(id) {
            // console.log(id);
            fetch(`${http}/client/rooms/${id}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data)
                    alertify.alert(data.message)
                    this.grupos();
                })
        },
        async eliminarUser(id, name) {

            await fetch(`${http}/client/rooms/findroombyusername/${name}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(async data => {
                    if (data.length === 0 || !data) {
                        return;
                    } else {
                        for (let index = 0; index < data.length; index++) {
                            const result = this.linksAll.filter(element => element.room == data[index].oid);
                            console.log(result);
                            if (result.length > 0) {
                                await fetch(`${http}/client/links/${result[index].objectId}`, {
                                    method: 'DELETE'
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log(data)
                                        this.getAllLinks();
                                    })
                            }

                            await fetch(`${http}/client/rooms/${data[index].oid}`, {
                                method: 'DELETE'
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log(data);
                                    this.getAllRooms();
                                })
                        }
                    }
                })

            await fetch(`${http}/client/users/getownerusers/${id}`, {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        for (let index = 0; index < data.length; index++) {
                            fetch(`${http}/client/users/${data[index].objectId}`, {
                                method: 'DELETE'
                            }).then(response => response.json())
                                .then(data => console.log(data))

                        }
                    }
                });

            await fetch(`${http}/client/users/${id}`, {
                method: 'DELETE'
            }).then(response => response.json())
                .then(data => console.log(data))

            this.getAllLinks();
            this.getAllRooms();
            this.getAllUsers();
        },
        eliminarLink(id) {
            console.log(id);
            fetch(`${http}/client/links/${id}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data)
                    this.getAllLinks();
                })
        },
        copiar(valor) {
            // console.log('llamo a copiar')
            Clipboard.copy(valor);
            this.mostrarLink = false;

            // this.link = '';
        },
        getDatatable() {
            $(document).ready(function () {
                $("#exampleC").DataTable();
            });
        },
    }
}

</script>

<template>
    <div class="container container-superadmin" v-if="mostraBox">
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
                <label class="sr-only" for="password">Password</label>
                <div class="input-group mb-2">
                    <div class="input-group-prepend">
                        <div class="input-group-text">@</div>
                    </div>
                    <input type="password" class="form-control" v-model="password" name="password" placeholder="Password">
                </div>

            </div>
            <div class="text-center mt-1">
                <button type="submit" class="btn btn-success text-dark" @click="onSubmit($event)">Iniciar Sesión</button>
            </div>
        </div>

    </div>
    <div class="container container-superadmin2 p-3" v-if="!mostraBox">

        <div>
            <!-- Button trigger modal -->
            <div class="row mb-3 p-2 bg bg-secondary">
                <div class="col-md-3 p-2">
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                        Agregar Administrador
                    </button>
                </div>
                <div class="col-md-7 p-2">
                    <button type="button" class="btn btn-dark mr-3" @click="users()">
                        Mostrar Usuarios
                    </button>
                    <button type="button" class="btn btn-dark mr-3" @click="grupos()">
                        Mostrar Grupos
                    </button>
                    <button type="button" class="btn btn-dark" @click="links()">
                        Mostrar Links
                    </button>
                </div>
                <div class="col-md-2 p-2">
                    <button type="button" class="btn btn-danger mr-3" @click="logout()">
                        Logout
                    </button>
                </div>
            </div>

            <div class="copy-link mt-3 mb-3" v-if="mostrarLink">
                <input type="text" readonly class="copy-link-input" :value="link">
                <button class="copy-link-button" @click="copiar(link)"><i class="fa-solid fa-copy"></i></button>
            </div>

            <table id="exampleC" class="table bg bg-light text-center" style="font-size:15px;">
                <thead class="text-center" v-if="mostrarUsuarios">
                    <tr>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>ROL</th>
                        <th>DUEÑO DE GRUPO</th>
                        <th>IMAGE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody v-if="mostrarUsuarios">
                    <tr v-for="(item, index) in usersAll" :key="item.objectId">
                        <td>{{ item.username }}</td>
                        <td>{{ item.email }}</td>
                        <td>{{ item.role }}</td>
                        <td>{{ item.owner }}</td>
                        <td v-if="item.img == ''"><img style="width:32px; margin:auto;" src="../assets/img/user.svg"
                                alt="" /></td>
                        <td v-if="item.img != ''"> <img style="width:32px; margin:auto;" :src="item.img" alt="" /></td>
                        <td><button @click="eliminarUser(item.objectId, item.username)"
                                :disabled="item.role == 'superadmin'" class="btn btn-danger"><i
                                    class="fa-solid fa-trash"></i></button></td>
                    </tr>
                    <tr class="text-center" v-if="usersAll.length === 0">
                        <td colspan="12">Cargando......</td>
                    </tr>
                </tbody>
                <thead class="text-center" v-if="mostrarGrupos">
                    <tr>
                        <th>NAME</th>
                        <th>STAFF</th>
                        <th>IMAGE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody v-if="mostrarGrupos">

                    <tr v-if="groupsAll.length > 0" v-for="(item, index) in groupsAll" :key="item.objectId">
                        <td>{{ item.name }}</td>
                        <td>{{ item.staff }}</td>
                        <td v-if="item.img == ''"><img style="width:32px; margin:auto;" src="../assets/img/user.svg"
                                alt="" /></td>
                        <td v-if="item.img != ''"> <img style="width:32px; margin:auto;" :src="item.img" alt="" /></td>
                        <td> <button class="btn btn-danger" @click="eliminarRoom(item.oid)"><i
                                    class="fa-solid fa-trash"></i></button></td>
                    </tr>
                    <tr class="text-center" v-if="groupsAll.length == 0">
                        <td colspan="12">No Existe Grupos</td>
                    </tr>
                </tbody>
                <thead class="text-center" v-if="mostrarLinks">
                    <tr>
                        <th>NAME</th>
                        <th>Room</th>
                        <th>LINK</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody v-if="mostrarLinks">

                    <tr v-if="linksAll.length > 0" v-for="(item, index) in linksAll" :key="item.objectId">
                        <td>{{ item.ObjectId }}{{ item.username }}</td>
                        <td>{{ item.room }}</td>
                        <td>{{ item.link }}/{{ item.username }}</td>
                        <td>
                            <button class="btn btn-secondary" @click="copiar(item.link + '/' + item.username)"><i
                                    class="fa-solid fa-copy"></i></button>
                            <button class="btn btn-danger" @click="eliminarLink(item.objectId)"><i
                                    class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr class="text-center" v-if="linksAll.length == 0">
                        <td colspan="12">No Existe Links</td>
                    </tr>
                </tbody>
            </table>
        </div>


        <!-- Modal -->
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg bg-primary text-white">
                        <h5 class="modal-title" id="staticBackdropLabel">Agregar Usuario</h5>
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
.copy-link {
    height: 36px;
    display: flex;
    max-width: 100%;
}

.copy-link-input {
    flex-grow: 1;
    padding: 0 8px;
    border: 1px solid #ccc;
    border-right: none;
    outline: none;
}

.copy-link-input:hover {
    background: #eee;
}

.copy-link-button {
    flex-shrink: 0;
    width: 60px;
    height: var(--height);
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ddd;
    color: #333;
    outline: none;
    border: 1px solid #eee;
}

.copy-link-button:hover {
    background: #ccc;
}

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

@media (max-width: 480px) {
    .row {
        text-align: center;
    }
}
</style>