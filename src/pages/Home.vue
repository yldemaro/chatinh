

<script>

import { http } from '../http/apihttp';

import firebase from "firebase";
import { Clipboard } from "v-clipboard";

export default {

    data() {
        return {
            profile: {},
            rooms: [],
            currentRoom: {},
            members: [],
            rol: '',
            messages: [],
            img2: '',
            chatCerrar: false,
            img: '',
            chat: '',
            saldo: '',
            referMsg: "",
            memberAgregado:'',
            member: {
                username: '',
                password: '',
                email: '',
                plane: ''
            },
            user: {
                hipodromo: '',
                carrera: '',
            },
            users: [],
            membersGroup: [],
            room: [],
            mostrarLink: false,
            mostrarAterrizaje: false,
            mostrarInfo: false,
            mostrarInfoDel:false,
            memberBorrado:''
        }
    },
    created() {
        this.logueado();
        // this.obtenerScrollChat();
    },
    methods: {
        async logueado() {
            this.profile = await JSON.parse(localStorage.getItem("profile"));
            if (!this.profile) {
                //('entro aqui')
                this.mostrarAterrizaje = true;
                alertify.alert('No puede entrar por motivos de seguridad');

                return;
            } else {
                if (this.profile?.User.role != 'superadmin') {
                    this.Rol(this.profile?.User.role);
                    this.obtenerRooms();
                    this.fetchMessages();
                    this.getUser(this.profile?.User.username);
                } else {
                    this.$router.push('/superadmin')
                }
            }
        },
        async getUser(username) {
            setInterval(() => {
                //(this.profile?.User.username);
                if (!this.profile) {
                    localStorage.clear()
                    return;
                } else {
                    fetch(`${http}/client/users/findbyusername/${username}`, {
                        method: 'GET'
                    })
                        .then(response => response.json())
                        .then(data => {
                            //(data)
                        })
                }


            }, 3000);
        },
        async fetchMessages() {
            fetch(`${http}/client/messages/${this.currentRoom?.oid}`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(async data => {

                    if (!data) {
                        return;
                    }
                    const chatWindow = document.getElementById('chat');
                    chatWindow.scrollTop = chatWindow?.scrollHeight + 60;

                });
        },
        async Rol(rol) {
            this.rol = rol;
            // //(this.rol)
        },
        async obtenerRooms() {
            // setInterval(async () => {
            await fetch(`${http}/client/rooms/findroombyusername/${this.profile?.User.username}`, {
                method: "POST"
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data)

                    if (!data || data.message == "User dont have any room") {
                        this.rooms = [];
                        return;
                    }
                    // if (data.length === 1) {
                    //     this.CurrentRoom(data[1])
                    // } else {
                    this.rooms = data;
                    this.CurrentRoom(this.rooms[0])
                    // }
                    this.getMessages();
                })
            this.getUsersNoAdmin();
            // }, 4000)

        },
        async CurrentRoom(room) {
            // console.log(room);
            this.currentRoom = room;
            if (this.messages.length > 0) {
                const chatWindow = document.getElementById('chat');
                chatWindow.scrollTop = chatWindow.scrollHeight + 60;
            }

        },
        handleShowParticipantes() {
            //('agregar participante')
        },
        async getMessages() {
            setInterval(async () => {
                await fetch(`${http}/client/messages/${this.currentRoom?.oid}`, {
                    method: "GET",
                    mode: 'cors',
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })
                    .then(response => response.json())
                    .then(async data => {
                        // //(data, this.messages.length);

                        if (!data && this.messages.length == 0) {
                            this.messages = [];
                            return;
                        }

                        if (data.length != this.messages.length) {
                            // //('mensaje nuevo')
                            this.messages.push(data);
                        }
                        this.messages = await data;

                    });
            }, 1500);



        },
        handleImage(e) {
            if (e.target.files[0]) {
                this.img2 = e.target.files[0];
                const data = URL.createObjectURL(e.target.files[0]);
                this.img = data;
            }
        },
        appendMenssage() {
            // //(this.chat);

            if (!this.chat.length) {
                return;
            }

            if (!this.currentRoom) {
                return;
            }

            if (this.currentRoom?.status) {
                alertify.alert(
                    "la carrera esta cerrada no puede enviar mensajes hasta que el administrador abra la siguiente carrera"
                );
                return;
            }

            // //(this.referMsg.oid);

            const payload = {
                content: this.chat,
                content2: "",
                ishidden: false,
                refer: this.referMsg?.oid ?? "",
                sender: this.profile.User.username,
                room: this.currentRoom.oid,
                date: "",
            };

            // //(payload)

            fetch(`${http}/client/messages`, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then(data => {
                    // //(data)
                    if (data.message) {
                        // this.getMessages();
                        const chatWindow = document.getElementById('chat');
                        chatWindow.scrollTop = chatWindow.scrollHeight + 60;
                    }
                })

            this.chat = '';
            this.referMsg = '';
        },
        registerMember(e) {
            e.preventDefault();
            if (!this.member.username.length || !this.member.password.length || !this.member.email.length) {
                alertify.alert("Los campos no pueden estar vacios");
                return;
            }

            const value = {
                UID: "",
                Username: this.member.username,
                Password: this.member.password,
                Email: this.member.email,
                plane: this.member.password,
                img: "",
                role: "member",
                owner: this.profile.User?.objectId
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
                    //(error.message);
                },
                () => {
                    this.uploadValue = 100;
                    storageRef.snapshot.ref.getDownloadURL().then((url) => {
                        value.img = url || '';
                        fetch(`${http}/auth/signup`, {
                            method: "POST",
                            body: JSON.stringify(value)
                        }).then(response => response.json())
                            .then(data => {
                                const addRoom = {
                                    username: this.member.username,
                                    roomuid: this.currentRoom.oid
                                };

                                fetch(`${http}/client/rooms/adduser`, {
                                    method: "POST",
                                    body: JSON.stringify(addRoom)
                                }).then(response => response.json())
                                    .then(data => {
                                        this.memberAgregado=this.member.username;
                                        this.mostrarInfo = true;
                                        const valueRoom = {
                                            uid: '',
                                            name: this.member.username,
                                            alias: "",
                                            staff: [
                                                this.profile.User.username
                                            ],
                                            members: [
                                                this.profile.User.username,
                                                this.member.username
                                            ],
                                            img: url || '',
                                            status: false
                                        };
                                        fetch(`${http}/client/rooms`, {
                                            method: 'POST',
                                            body: JSON.stringify(valueRoom)
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                const value = {
                                                    username: this.member.username,
                                                    room: this.currentRoom.oid
                                                }
                                                fetch(`${http}/client/links/generate`, {
                                                    method: "POST",
                                                    body: JSON.stringify(value)
                                                })
                                                    .then(response => response.json())
                                                    .then(async data => {
                                                        // //(data);
                                                        // this.link = data.link;
                                                        this.mostrarLink = true;
                                                        this.link = await `${data.link}/${data.username}`;
                                                        this.obtenerRooms();

                                                        this.member = {
                                                            username: '',
                                                            password: '',
                                                            email: '',
                                                            plane: ''
                                                        }
                                                        e.target.value='';
                                                    })
                                            })

                                    })
                                // }
                            })
                    })
                })

        },
        onReferMessage(msg) {
            // //(msg)
            this.referMsg = msg;
            this.findMessages(msg.oid);
        },
        removeRefer() {
            this.referMsg = "";
        },
        handleChat() {
            this.chatCerrar = !this.chatCerrar;
            //(this.chatCerrar)

            if (this.chatCerrar) {
                const payload = {
                    uid: "",
                    content: "Carrera Cerrada Espere....",
                    content2: "",
                    ishidden: false,
                    refer: this.referMsg?.oid ?? "",
                    sender: this.profile.User.username,
                    room: this.currentRoom.oid,
                    date: "",
                };

                fetch(`${http}/client/messages`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                    .then(response => response.json())
                    .then(data => {
                        // //(data)
                        if (data.message) {
                            // this.getMessages();
                            const chatWindow = document.getElementById('chat');
                            chatWindow.scrollTop = chatWindow.scrollHeight + 60;
                        }
                    })
            } else {
                const payload = {
                    uid: "",
                    content: "Carrera Abierta Apuesten....",
                    content2: "",
                    ishidden: false,
                    refer: this.referMsg?.oid ?? "",
                    sender: this.profile.User.username,
                    room: this.currentRoom.oid,
                    date: "",
                };

                fetch(`${http}/client/messages`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                    .then(response => response.json())
                    .then(data => {
                        // //(data)
                        if (data.message) {
                            // this.getMessages();
                            const chatWindow = document.getElementById('chat');
                            chatWindow.scrollTop = chatWindow.scrollHeight + 60;
                        }
                    })
            }



            const valueChat = {
                uid: this.currentRoom.oid,
                name: this.currentRoom.name,
                members: this.currentRoom.members,
                staff: this.currentRoom.staff,
                createAt: this.currentRoom.createAt,
                img: this.currentRoom.img,
                status: this.chatCerrar
            }

            fetch(`${http}/client/rooms`, {
                method: "PUT",
                body: JSON.stringify(valueChat)
            }).then(response => response.json())
        },
        findMessages(id) {
            if (!id) {
                return "";
            }

            const found = this.messages.find((value) => value.oid === id);
            // //(found);
            return found;
        },
        handleChangeSaldo(e, item, i) {
            // //(item, event.target.value, i)
            const value = this.users;
            this.saldo = event.target.value;

            value[i] = {
                hipodromo: this.user.hipodromo,
                carrera: "Carrera " + this.user.carrera,
                name: item,
                saldo: this.saldo
            }

            // //(value)

            // this.users = value;

            // this.users= value;

            // //(this.users)
        },
        async handleCarrera() {
            // //(this.users, this.users.length, this.room);

            for (let index = 0; index < this.users.length; index++) {
                const element = this.users[index];
                const text = `${element.hipodromo}, ${element.carrera}, saldo: ${Number(
                    element.saldo
                )}`;
                await this.obtenerRoom(element.name);
                const payload = {
                    content: text,
                    content2: "",
                    ishidden: false,
                    refer: this.referMsg?.oid ?? "",
                    sender: this.profile.User.username,
                    room: this.room[index + 1].oid,
                    date: "",
                };

                fetch(`${http}/client/messages`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                    .then(response => response.json())
                    .then(data => {
                        // //(data)
                        if (data.message) {
                            // this.getMessages();
                            const chatWindow = document.getElementById('chat');
                            chatWindow.scrollTop = chatWindow.scrollHeight + 60;
                        }
                    })
                // await fetch(`${http}/client/rooms/findroombyusername/${element.name}`,{
                //     method:'POST'
                // })
                // .then(response=> response.json())
                // .then(data =>{

                // })

                // //(payload);
            }



            this.users = [];
            this.user.hipodromo = '';
            this.user.carrera = '';
            this.saldo = '';
        },
        getUsersNoAdmin() {
            var user = [];

            this.currentRoom.members?.forEach((element, index) => {
                if (element === this.profile.User.username) {

                } else {
                    user[index - 1] = element;
                }


            });

            this.membersGroup = user;
        },
        deleteMember(id, person) {
            if (person === this.profile.User.username) {
                alertify.alert("No se puede borrar el administrador");
                return;
            } else {
                const value = {
                    RoomUID: id,
                    Username: person
                };
                fetch(`${http}/client/rooms/deleteuser`, {
                    method: 'POST',
                    body: JSON.stringify(value)
                }).then(response => response.json())
                    .then(data => {
                        this.memberBorrado=person;
                        this.mostrarInfoDel=true;
                        this.obtenerRoom();
                    });
            }
        },
        async obtenerRoom(name) {
            await fetch(`${http}/client/rooms/findroombyusername/${name}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    // //(data)
                    this.room = data;


                })

            return this.room;
        },
        copiar(valor) {
            // //(valor)
            Clipboard.copy(valor);
            this.mostrarLink = false;
            this.link = '';
        }
    }
}

</script>

<template>
    <div class="container-full" v-if="!mostrarAterrizaje">
        <div class="copy-link mt-3 mb-3" v-if="mostrarLink">
            <input type="text" readonly class="copy-link-input" :value="link">
            <button class="copy-link-button" @click="copiar(link)"><i class="fa-solid fa-copy"></i></button>
        </div>
        <header class="header">


            <div class="showPart" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" v-if="currentRoom">
                <img v-if="currentRoom?.img != ''" class="imgTitulo" :src=profile.User?.img />
                <img v-if="currentRoom?.img == ''" class="imgTitulo" src="../assets/img/user.svg" />
                <div style="display:flex; flex-direction: column; margin-left:5px;">
                    <h6>{{ currentRoom.name?.toUpperCase() }}</h6>
                    <span class="text-secondary members"><span v-for="item in currentRoom.members?.join(', ')">{{ item
                    }}</span>
                    </span>
                </div>

            </div>
            <div style="display: flex;">
                <a v-if="rol === 'admin' && currentRoom.members?.length > 1" className="btn  btn-danger text-white mr-1"
                    @click="handleChat">
                    <i class="fa-sharp fa-regular fa-circle-stop"></i>
                </a>
                <a v-if="rol === 'admin' && currentRoom.members?.length > 1" className="btn btn-success  text-white"
                    data-bs-toggle="modal" data-bs-target="#staticBackdrop3">
                    <i class="fa-solid fa-money-bill"></i>
                </a>
                <div class="dropdown" v-if="rol == 'admin'">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labellehttpy="dropdownMenuButton1">
                        <li><a class="dropdown-item" href="#" data-bs-toggle="modal"
                                data-bs-target="#staticBackdrop">Agregar
                                Miembro</a></li>
                        <!--<li><a class="dropdown-item" href="#">Agregar Nuevo Grupo</a></li>-->
                    </ul>
                </div>
                <div class="dropdown" v-if="currentRoom.members?.length > 1">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false" @click="obtenerRoom(profile.User.username)">
                        <i class="fa-regular fa-envelope"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labellehttpy="dropdownMenuButton1">
                        <li v-for="item in room" @click="CurrentRoom(item)"><a class="dropdown-item" href="#">{{ item.name
                        }}</a></li>
                    </ul>
                </div>
            </div>

        </header>
        <div v-if="currentRoom" style="height:calc(100% - 100px); overflow-y: auto;">
            <img class="fondoDefault" src="../assets/img/fondoDefault.jpeg" alt="">
            <div v-if="messages">
                <ul id="chat" class="p-1" style="height:100%; overflow-y: auto; font-size:13px;">

                    <div :class="[profile.User.username == item.sender ? 'alignDer' : 'alignIzq']" v-for="item in messages">
                        <div :class="[profile.User.username == item.sender ? 'messagerow2' : 'messagerow']">

                            <div v-if="item.refer != ''">
                                <div class="viewrefer">
                                    <p class="msgtitle">{{ item.refer }}</p>
                                    <p class="msgcontent">{{ item.content2 }}</p>
                                </div>
                            </div>

                            <div class="msgheader">
                                <p class="msgtitle">{{ item.sender }}</p>
                                <div>
                                    <a href="#" class=" text-secondary m-1" @click="copiar(item.content)"><i
                                            class="fa-solid fa-copy"></i></a>
                                    <a href="#" class=" text-secondary" @click="onReferMessage(item)"><i
                                            class="fa-solid fa-chevron-down"></i></a>

                                </div>

                            </div>
                            <div>
                                <div class="divmsgcontent">
                                    <p class="msgcontent">{{ item.content }}
                                    </p>
                                    <small class="msgdate">{{ item.date }}</small>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="text-center" v-if="mostrarInfo">{{ memberAgregado }} fue agregada al grupo</div>
                    <div class="text-center" v-if="mostrarInfoDel">{{memberBorrado}} fue eliminada del grupo</div>
                </ul>
            </div>

            <!--<Messages :message="messages" />-->
        </div>
        <div v-if="!currentRoom">
            <h1>no tiene grupo</h1>
        </div>
        <div v-if="currentRoom" style="display: flex; flex-direction: column;">
            <div v-if="referMsg != ''">
                <div class="refercontainer">
                    <div class="hrefercon">
                        <p class="msgtitle">{{ referMsg.sender }}</p>
                        <p class="rfcontent">{{ referMsg.content }}</p>
                    </div>
                    <a class="icon_btn" @click="removeRefer()">
                        <i class="fa-solid fa-xmark"></i>
                    </a>
                </div>
            </div>
            <div class=" inputContainer" v-if="!currentRoom.status">
                <input type="text" v-model="chat" class="inputcmp" placeholder="escribir mensaje...." style="height: 60px;">
                <button style="width: 60px;" class="btn btn-success" @click="appendMenssage()"><i
                        class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>

        <!--<button class="btn btn-success botonFlotante" data-bs-toggle="modal" data-bs-target="#staticBackdrop"></button>-->




    </div>

    <div class="container-full" v-if="mostrarAterrizaje">
        <div class="boxSeguridad">
            <div class="box">
                <img class="deslogueo" src="../assets/img/caballos.jpg" alt="">
                <h3>Por motivos de seguridad espere el link de logueo</h3>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Registrar Miembro</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" v-model="member.username" name="name"
                            placeholder="Username">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" v-model="member.password" name="password"
                            placeholder="Password">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" class="form-control" v-model="member.email" name="email" placeholder="Email">
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
                        @click="registerMember($event)">Agregar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="staticBackdrop2" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg bg-success text-white">
                    <h5 class="modal-title" id="staticBackdropLabel">Información de Participantes</h5>
                    <button type="button" class="btn btn-dark btn-close text-white" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="list-group">
                        <div class="mb-2 p-2" v-for="item in currentRoom.members"
                            style="display:flex; justify-content: space-between; border:.4px solid #cecece; align-items: center;">
                            <li class="list-group-item" style="border:none;">{{ item }} </li>
                            <button v-if="rol === 'admin'" :disabled="profile.User.username === item" class="btn btn-danger"
                                @click="deleteMember(currentRoom.oid, item)"><i class="fa-solid fa-trash"></i></button>
                        </div>

                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="staticBackdrop3" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Pagar</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <label htmlFor="hipodromo">Hipodromo</label>
                    <input type="text" placeholder="Hipodromo" v-model="user.hipodromo" className="form-control" />
                    <label htmlFor="carrera">Carrera</label>
                    <input type="text" placeholder="Carrera" v-model="user.carrera" className="form-control" />
                    <ul class="list-group">
                        <li class="list-group-item alinearLinea" v-for="(item, i) in membersGroup">
                            <label for="" v-if="item != profile.User.username">{{ item }}</label>
                            <input v-if="item != profile.User.username" type="text" className="m-1" v-model="saldo"
                                placeholder="saldo" @change="() => handleChangeSaldo($event, item, i)" />
                        </li>
                    </ul>
                    <div class="mt-2 text-center">
                        <button class="btn btn-success btn-lg btn-block" @click="handleCarrera()">Enviar Saldo</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
#app {
    overflow: hidden;
    height: 100%;
}

.fondoDefault {
    position: absolute;
    top: 0;
    z-index: -10000;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0;
    background-color: white;
}

.members {
    display: flex;
    /* max-width: 60%;
    width: 60%; */
    overflow: hidden;
}

.box {
    justify-content: center;
    flex-direction: column;
}

.deslogueo {
    width: 250px;
    height: 250px;
    margin: auto;
    margin-bottom: 10px;
    border-radius: 50%;
    border: 2px solid gray;
    box-shadow: 0px 2px 19px 0px;
}

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

.container-full {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-left: solid 1px #ccc;
    overflow: hidden;
}

.refercontainer {
    position: absolute;
    background-color: white;
    bottom: 60px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 0.1fr;

    padding: 8px;
}

.alinearLinea {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.hrefercon {
    display: flex;
    flex-direction: column;
    padding: 8px;
}

.viewrefer {
    display: flex;
    flex: 1;
    border-radius: 8px;
    padding: 8px;
    opacity: 0.5;
    background-color: rgb(215, 215, 215);

    flex-direction: column;
    max-height: 200px;
}

.rfcontent {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 600px;
}

.header {
    display: flex;
    /* flex-direction: row; */
    justify-content: space-between;
    align-items: center;
    margin: 0px;
    padding: 10px;
    background-color: #cdcebc;
    min-height: 60px;
}

.msgtitle {
    text-transform: capitalize;
}

.msgcontent {
    overflow-wrap: break-word;
    white-space: pre-wrap;
    max-width: 400px;
}

.msgdate {
    float: right;
    margin-top: 10px;
    margin-left: 15px;
    font-size: 10px;
}

.showPart .imgTitulo {
    width: 40px;
    height: 40px;
    border: 2px solid white;
    border-radius: 50%;
}

.showPart {
    /* width: 75%; */
    cursor: pointer;
    display: flex;
}

.boxSeguridad {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.imgGrupo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.6;
    height: 250px;
    width: 250px;
    z-index: -1000;
}

.msgheader {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
}

.icon_btn {
    cursor: pointer;
    margin: 5px;

    display: grid;
    place-content: center;
}


.divmsgcontent {
    display: flex;
    justify-content: space-between;
}

.messagerow {
    background-color: white;
    padding: 2px;
    border-radius: 8px;
    border-right: 1px solid #00a884;
    margin: 2px 0 2px 10px;
    line-height: 1;
    margin-left: 3%;
    margin-right: 15%;
}

.messagerow2 {
    background-color: #a9f5d1;
    /* width: 200px; */
    padding: 2px;
    border-radius: 8px;
    display: inline-block;
    border-left: 1px solid white;
    margin: 2px 10px 2px 0;
    line-height: 1;
    margin-left: 15%;
    margin-right: 3%;
}

.alignDer {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    margin-top: 2px;
}

.alignIzq {
    display: flex;
    flex: 1;
    justify-content: flex-start;
    margin-top: 2px;
}

.inputContainer {
    display: flex;
    /* padding: 10px;
    border-top: solid 1px #ccc;
    align-items: center;
    justify-content: space-between; */
}

.msgtitle {
    font-weight: bold;
}

.inputcmp {
    flex-grow: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: #d1d7db;
    width: 100%;
}

@media (max-width: 480px) {
    .header {
        justify-content: space-between;
    }

    .showPart {
        width: 100px;
    }
}
</style>