<script >
import { db } from '../firebase';
import firebase from "firebase";
import 'firebase/storage';
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
            mostraBox: false,
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
            mostrarLinks: false,
            cambiarActiveRoom: false
        }
    },
    async created() {
        // console.log(http)

        // this.logueado();
        this.profile = await JSON.parse(localStorage.getItem('profile'));

        if (!this.profile) {
            localStorage.clear();
            this.mostraBox = true;
            return;
        } else {
            this.logueado();
            this.getUser(this.profile.User.username);
            this.getAllUsers(this.profile.User.objectId);
        }

    },
    methods: {
        async logueado() {


            this.profile = await JSON.parse(localStorage.getItem('profile'));
            if (this.profile.User.role != 'superadmin') {
                alertify.alert('Acceso Restringido', 'Usted no tiene Acceso a este link');
                this.mostraBox = true;
                localStorage.clear();
                return;
            }



        },
        async getUser(username) {
            await fetch(`${http}/client/users/findbyusername/${username}`, {
                method: 'GET'
            })
                .then(response => response.json())
                .then(data => {
                    if (!data) {
                        localStorage.clear();
                        this.mostraBox = true;
                        return;
                    }
                })
                .catch(error => console.log(error))
        },
        async getAllUsers(id) {
            fetch(`${http}/client/users/getownerusers/${id}`)
                .then(res => res.json())
                .then(data => {
                    this.usersAll = data;

                    setTimeout(() => {
                        this.getDatatable();
                    }, 3000);
                })

            // setInterval(() => {
            // try {

            //     fetch(`${http}/client/users`, {
            //         method: "GET"
            //     })
            //         .then(response => response.json())
            //         .then(async data => {
            //             // console.log(data)

            //             if (!data) {
            //                 localStorage.clear();
            //                 this.logueado();
            //                 return;
            //             }
            //             this.usersAll = await data;

            //             

            //             setTimeout(() => {
            //                 this.getDatatable();
            //             }, 3000);

            //         })
            //         .catch(error => console.log(error))
            // } catch (error) {
            //     throw error;
            // }

            // }, 4000)
        },
        async getAllRooms() {

            try {
                await fetch(`${http}/client/rooms`, {
                    method: "GET"
                })
                    .then(response => {
                        if (!response.ok) {
                            this.groupsAll = [];
                            return;
                            // return Error(response.statusText)

                        }
                        return response.json()
                    })
                    .then(async data => {
                        // console.log(data)
                        const result = data.filter(element => element.name == element.staff[0])

                        this.groupsAll = await result;
                        this.getAllLinks();

                    }).catch(error => console.log(error))
            } catch (error) {
                throw error;
            }
            // setInterval(() => {

            // }, 4000)
        },
        async getAllLinks() {
            try {
                await fetch(`${http}/client/links`, {
                    method: "GET"
                }).then(response => response.json())
                    .then(data => {

                        const result = data.filter((element, index) => element.username == this.groupsAll[index]?.name);

                        // console.log(result)
                        // if (data.message == 'Not Links found') {
                        //     this.linksAll = [];
                        //     return;
                        // }
                        this.linksAll = result;

                    }).catch(error => console.log(error))
            } catch (error) {
                console.log(error)
            }

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
                body: JSON.stringify(value),
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data);
                    if (data.User.role != 'superadmin') {
                        // console.log('entro aqui')
                        alertify.alert('usuario sin autorizar', 'Solamente para administradores');
                        this.username = '';
                        this.password = '';
                        return;
                    } else {
                        if (!data || data.message == 'Credentials Failed' || data.message == 'Username incorrect') {
                            alertify.alert('usuario incorrecto', 'Contraseña o Usuarios incorrectos');
                            return;
                        }
                        this.mostraBox = false;
                        this.userSuperAdmin = await data;
                        localStorage.setItem("profile", JSON.stringify(data))
                        this.logueado();
                        // this.getAllUsers();

                        this.username = '';
                        this.password = '';
                    }

                })
        },
        limpiar() {
            this.username = '';
            this.password = '';
            this.email = '';
            this.img = '';
            this.img2 = '';
            document.getElementById('imagenR').value = '';
        },
        async agregarAdmin(e) {
            e.preventDefault();
            const value = {
                UID: "",
                Username: this.username.trim(),
                Password: this.password.trim(),
                Email: this.email.trim(),
                alias: this.img2.name,
                plane: this.password,
                img: "",
                role: "admin",
                owner: this.profile?.User.objectId,
            };


            const storageRef = firebase
                .storage()
                .ref(`${this.username}/${this.img2.name}`)
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
                    storageRef.snapshot.ref.getDownloadURL().then(async (url) => {
                        value.img = url || '';
                        await fetch(`${http}/auth/signup`, {
                            method: "POST",
                            body: JSON.stringify(value),
                        }).then(response => response.json())
                            .then(async data => {
                                console.log(data);
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
                                    active: true,
                                    img: url || '',
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
                                                    this.link = '';
                                                    // console.log(data)
                                                    this.mostrarLink = true;
                                                    this.link = `${data.link}/${data.username}`;
                                                    alertify.alert('Registro de Administrador', `Admin Agregado Con exitos`);
                                                    this.getAllUsers();
                                                    this.getAllRooms();
                                                    this.getAllLinks();

                                                    this.limpiar()
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

            this.mostrarUsuarios = true;
            this.mostrarGrupos = false;
            this.mostrarLinks = false;
            this.getAllUsers(this.profile.User.objectId);
        },
        grupos() {

            this.mostrarGrupos = true;
            this.mostrarUsuarios = false;
            this.mostrarLinks = false;
            this.getAllRooms();
            // this.mostrarUsuarios = false;
        },
        links() {

            this.mostrarLinks = true
            this.mostrarUsuarios = false;
            this.mostrarGrupos = false;
            this.getAllLinks();
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
                    // this.grupos();
                }).catch(error => console.log(error))
        },
        async eliminarUser(id, name, img) {

            // var desertRef = storageRef.child(img)

            // console.log(desertRef);

            await fetch(`${http}/client/rooms/findroombyusername/${name}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data);
                    if (data.length === 0 || !data) {
                        return;
                    } else {
                        for (let index = 0; index < data.length; index++) {
                            const result = this.linksAll.filter(element => element.room == data[index].oid);
                            // console.log(result);
                            if (result.length > 0) {
                                await fetch(`${http}/client/links/${result[index].objectId}`, {
                                    method: 'DELETE'
                                })
                                    .then(response => response.json())
                                    .then(data => {

                                        // console.log(data)
                                        // this.getAllLinks();
                                    })
                                    .catch(error => console.log(error))
                            }

                            await fetch(`${http}/client/rooms/${data[index].oid}`, {
                                method: 'DELETE'
                            })
                                .then(response => response.json())
                                .then(data => {
                                    // console.log(data);
                                    // this.getAllRooms();
                                })
                                .catch(error => console.log(error))
                        }
                    }
                })

            await fetch(`${http}/client/users/getownerusers/${id}`, {
                method: 'GET'
            }).then(response => response.json())
                .then(async data => {
                    // console.log(data);
                    if (!data) {
                        return;
                    } else {
                        if (data.length > 0) {
                            for (let index = 0; index < data.length; index++) {
                                var desertRef = firebase
                                    .storage()
                                    .ref()
                                    .child(`${data[index].username}/${data[index].alias}`);
                                await desertRef.delete().then(() => {
                                    // File deleted successfully
                                    // console.log('borrado')
                                }).catch((error) => {
                                    console.log(error)
                                    // Uh-oh, an error occurred!
                                });
                                await fetch(`${http}/client/users/${data[index].objectId}`, {
                                    method: 'DELETE'
                                }).then(response => response.json())
                                    .then(data => {

                                    })
                                    .catch(error => console.log(error))

                            }
                        }
                    }

                }).catch(error => console.log(error));



            await fetch(`${http}/client/users/${id}`, {
                method: 'DELETE'
            }).then(response => response.json())
                .then(data => {
                    alertify.alert('Borrar Grupo', 'Grupo Borrado con exito');
                    this.getAllUsers();

                    const storageRef = firebase.storage().ref();
                    var desertRef2 = storageRef.child(`${name}/${img}`);
                    desertRef2.delete().then(() => {
                        // File deleted successfully
                        // console.log('borrado')
                    }).catch((error) => {
                        console.log(error)
                        // Uh-oh, an error occurred!
                    });
                })
                .catch(error => console.log(error))

        },
        eliminarLink(id) {
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
            Clipboard.copy(valor);
            this.mostrarLink = false;

            // this.link = '';
        },
        getDatatable() {
            $(document).ready(function () {
                $("#exampleC").DataTable();
            });
        },
        bloquearGrupo(room) {
            // this.cambiarActiveRoom= !this.cambiarActiveRoom

            // console.log(this.cambiarActiveRoom)

            const valueRoom = {
                uid: room.oid,
                name: room.name,
                members: room.members,
                staff: room.staff,
                createAt: room.createAt,
                img: room.img,
                status: room.status,
                active: !room.active
            }

            // console.log(valueRoom)

            fetch(`${http}/client/rooms`, {
                method: "PUT",
                body: JSON.stringify(valueRoom)
            }).then(response => response.json())
                .then(data => this.getAllRooms())
        }
    }
}

</script>

<template>
    <div class="container-full container-superadmin" v-if="mostraBox">
        <div class="box-superadmin p-2">
            <div class="form-group">
                <label class="sr-only" for="inlineFormInputGroup">Username</label>
                <div class="input-group mb-2">
                    <div class="input-group-prepend">
                        <div class="input-group-text" style="height:100%;"><i class="fa-regular fa-user"></i></div>
                    </div>
                    <input type="text" class="form-control" v-model="username" id="inlineFormInputGroup"
                        placeholder="Username">
                </div>
            </div>
            <div class="form-group">
                <label class="sr-only" for="password">Password</label>
                <div class="input-group mb-2">
                    <div class="input-group-prepend">
                        <div class="input-group-text" style="height:100%;"><i class="fa-solid fa-key"></i></div>
                    </div>
                    <input type="password" class="form-control" v-model="password" name="password" placeholder="Password">
                </div>

            </div>
            <div class="text-center mt-1">
                <button type="submit" class="btn btn-success text-dark" @click="onSubmit($event)">Iniciar Sesión</button>
            </div>
        </div>

    </div>
    <div class="container-full container-superadmin2 p-3" v-if="!mostraBox">

        <div>
            <!-- Button trigger modal -->
            <div class="row mb-3 p-2 text-center bg bg-secondary">
                <div class="col-md-3 p-2">
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                        Agregar Administrador
                    </button>
                </div>
                <div class="col-md-7 p-2">
                    <div class="row text-center">
                        <div class="col-12 col-md-4 mb-1"> <button type="button" class="btn btn-dark mr-3" @click="users()">
                                Mostrar Usuarios
                            </button></div>
                        <div class="col-12 col-md-4 mb-1"> <button type="button" class="btn btn-dark mr-3" @click="grupos()"
                                :disabled="usersAll.length <= 0">
                                Mostrar Grupos
                            </button></div>
                        <div class="col-12 col-md-4 mb-1">
                            <button type="button" class="btn btn-dark" @click="links()" :disabled="usersAll.length <= 0">
                                Mostrar Links
                            </button>
                        </div>
                    </div>



                </div>
                <div class="col-12 col-md-2 p-2">
                    <button type="button" class="btn btn-danger mr-3" @click="logout()">
                        Logout
                    </button>
                </div>
            </div>

            <div class="copy-link mt-3 mb-3" v-if="mostrarLink">
                <input type="text" readonly class="copy-link-input" :value="link">
                <button class="copy-link-button" @click="copiar(link)"><i class="fa-solid fa-copy"></i></button>
            </div>

            <table id="exampleC" class="table table-bordered table-striped table-vcenter p-1"
                style="font-size:15px; width: 100%; background:white;">
                <thead v-if="mostrarUsuarios">
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
                        <td v-if="item.img == ''"><img style="width:32px; height: 32px; margin:auto;"
                                src="../assets/img/user.svg" alt="" /></td>
                        <td v-if="item.img != ''"> <img style="width:32px; height: 32px; margin:auto;" :src="item.img"
                                alt="" /></td>
                        <td><button @click="eliminarUser(item.objectId, item.username, item.alias)"
                                :disabled="item.role == 'superadmin'" class="btn btn-danger"><i
                                    class="fa-solid fa-trash"></i></button></td>
                    </tr>
                    <tr class="text-center" v-if="usersAll.length === 0">
                        <td colspan="12">Cargando......</td>
                    </tr>
                </tbody>
                <thead v-if="mostrarGrupos">
                    <tr>
                        <th>NAME</th>
                        <th>ACTIVO</th>
                        <th>STAFF</th>
                        <th>IMAGE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody v-if="mostrarGrupos">

                    <tr v-for="(item, index) in groupsAll" :key="item.objectId">
                        <td>{{ item.name }}</td>
                        <td v-if="!item.active"><span class="activo bg bg-danger text-white p-1">Bloqueado</span></td>
                        <td v-if="item.active"><span class="activo bg bg-success text-white p-1">Activo</span></td>
                        <td>{{ item.staff }}</td>
                        <td v-if="item.img == ''">
                            <img
                                style="width:32px; height:32px; margin-right:20px;" src="../assets/img/user.svg" alt="" />
                            <button class="btn btn-light"><i class="fa-regular fa-envelope"></i></button>
                        </td>
                        <td v-if="item.img != ''" >
                            <img style="width:32px; height:32px; margin-right:20px;" :src="item.img" alt="" />
                            <button class="btn btn-light"><i class="fa-regular fa-envelope"></i></button>

                        </td>
                        <td style="display:flex; justify-content: space-around;">
                            <button class="btn btn-danger" @click="bloquearGrupo(item)"><i
                                    class="fa-sharp fa-regular fa-circle-stop"></i></button>
                            <button class="btn btn-danger" @click="eliminarRoom(item.oid)"><i
                                    class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr class="text-center" v-if="groupsAll.length == 0">
                        <td colspan="12">Cargando...</td>
                    </tr>
                </tbody>
                <thead v-if="mostrarLinks">
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
                        <td><a :href="item.link + '/' + item.username" target="_blank">{{ item.link }}/{{ item.username
                        }}</a>
                        </td>
                        <td>
                            <button class="btn btn-secondary" @click="copiar(item.link + '/' + item.username)"><i
                                    class="fa-solid fa-copy"></i></button>
                            <button class="btn btn-danger" @click="eliminarLink(item.objectId)"><i
                                    class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr class="text-center" v-if="linksAll.length == 0">
                        <td colspan="12">Cargando....</td>
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
                            <input type="file" id="imagenR" className="mb-2" class="form-control"
                                @change="handleImage($event)" />
                            <div className="text-center p-4" v-if="img != ''">
                                <img style="width: 100px; height: 100px; margin: auto;" :src="img" alt="" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="limpiar()">Close</button>
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

#exampleC_wrapper {
    background-color: white;
    padding: 5px;
    width: 100%;
    overflow-x: auto;
}

.btn:disabled {
    background: #cecece !important;
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

.activo {
    border-radius: 8px;
    text-align: center;
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
    /* background-size: 100% 100%; */
    background-size: cover;
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