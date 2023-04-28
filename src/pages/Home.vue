

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
            memberAgregado: '',
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
            mostrarInfoDel: false,
            memberBorrado: '',
            time: null,
            currentRoomTime: null,
            desactChat: false,
            currentRoomTime2: null,
            iraotrolado: false
        }
    },
    created() {
        this.logueado();
        // this.obtenerScrollChat();

        $(document).ready(function () {
            if (navigator.userAgent.match(/android/i)) {
                window.scrollTo(0, 0);
                var nPageH = $(document).height();
                var nViewH = window.outerHeight;
                if (nViewH > nPageH) { nViewH -= 250; $('BODY').css('height', nViewH + 'px'); }
                window.scrollTo(0, 1);

            }
        });


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

                    // this.obtenerRooms();
                    // this.getMessages();
                    // this.obtenerRooms();
                    this.getUser(this.profile?.User.username);
                    this.obtenerRooms(this.profile?.User.username);

                } else {
                    this.$router.push('/superadmin')
                }
            }
        },
        getStatusRoom(active, status) {
            // clearInterval(this.time)
            this.currentRoom.active = active;
            this.currentRoom.status = status;

            if (!this.currentRoom.active) {
                this.mostrarAterrizaje = true;
                return;
            } else {
                this.mostrarAterrizaje = false;
            }

            // console.log(active, status)
        },
        copiar(valor) {
            // //(valor)
            Clipboard.copy(valor);
            this.mostrarLink = false;
            this.link = '';
        },
        async getUser(username) {
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
                        if (!data) {
                            localStorage.clear();
                            this.logueado();
                        }
                        // this.watcherRoom();

                        // this.obtenerRooms();

                        // this.watcherMessage();
                        // console.log(this.currentRoom.oid)


                    })
            }
        },
        memberStr() {

            // console.log(this.currentRoom)

            if (!this.currentRoom.members.length) {
                return "";
            }

            this.memberStrs = this.currentRoom?.members.join(", ");

            return this.currentRoom?.members.join(", ");
        },
        async Rol(rol) {
            this.rol = rol;
            // //(this.rol)
        },
        watcherRoom() {
            setInterval(() => {


                fetch(`${http}/client/rooms/findroombyusername/${this.profile?.User.username}`, {
                    method: "POST"
                })
                    .then(response => response.json())
                    .then(async data => {
                        this.getStatusRoom(data[0].active, data[0].status);
                    })
            }, 3000);
        },
        async obtenerRooms(username) {
            // this.currentRoomTime = setInterval(async () => {


            await fetch(`${http}/client/rooms/findroombyusername/${username}`, {
                method: "POST"
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data);
                    if (!data || data.message == "User dont have any room") {
                        this.rooms = [];
                        return;
                    }
                    this.rooms = await data;
                    await this.CurrentRoom(this.rooms[0])
                })

        },
        async CurrentRoom(room) {
            clearInterval(this.time)
            this.currentRoom = null;
            this.messages = [];
            this.currentRoom = await room;

            if (this.currentRoom) {

                this.memberStr();
                this.getUsersNoAdmin();
                await this.getMessages(this.currentRoom.oid);

                setTimeout(() => {
                    // console.log(this.messages.length)
                    this.scrollEnd();
                }, 1000);

                this.watcherRoom();
            }

        },
        async getWat(oid) {
            this.time= setInterval(async () => {
                await fetch(`${http}/client/messages/${oid}`, {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(async data => {
                        // console.log(data.length, this.messages.length)
                        if (data.length != this.messages.length) {
                            this.messages.push(data[data.length - 1])
                        }
                    })
                    .catch(error => clearInterval(this.time))
            }, 1500);
        },
        async getMessages(oid) {

            await fetch(`${http}/client/messages/${oid}`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data)
                    this.messages = await data;

                    this.getWat(oid);
                })
                .catch(error => console.log(error))






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
                    this.getMessages(this.currentRoom.oid)
                    // console.log(data);
                    // this.messages.push(data.message);
                    // if (data.message) {
                    //     const chatWindow = document.getElementById('chat');
                    //     chatWindow.scrollTop = chatWindow.scrollTop + 100;
                    // }

                })



            this.chat = '';
            this.referMsg = '';
        },
        async registerMember(e) {
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
                img: this.currentRoom.img,
                role: "member",
                owner: this.profile.User?.objectId
            };
            await fetch(`${http}/auth/signup`, {
                method: "POST",
                body: JSON.stringify(value)
            }).then(response => response.json())
                .then(data => {
                    console.log('sigunp');
                    const addRoom = {
                        username: this.member.username,
                        roomuid: this.currentRoom.oid
                    };

                    fetch(`${http}/client/rooms/adduser`, {
                        method: "POST",
                        body: JSON.stringify(addRoom)
                    }).then(response => response.json())
                        .then(data => {
                            console.log('adduser');
                            this.memberAgregado = this.member.username;
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
                                img: this.currentRoom.img,
                                active: true,
                                status: false
                            };
                            fetch(`${http}/client/rooms`, {
                                method: 'POST',
                                body: JSON.stringify(valueRoom)
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('crea grupo');
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
                                            console.log('genera link');
                                            this.link = '';
                                            this.mostrarLink = true;
                                            this.link = await `${data.link}/${data.username}`;
                                            // this.obtenerRooms();
                                            this.limpiar();

                                        })
                                })

                        })
                    // }
                })

        },
        limpiar() {
            this.member = {
                username: '',
                password: '',
                email: '',
                plane: ''
            }
            this.img2 = '';
            this.img = '';
            // document.getElementById('registerM').value = '';
        },
        onReferMessage(msg) {
            // //(msg)
            this.referMsg = msg;
            this.findMessages(msg.oid);
            const chatWindow = document.getElementById('chat');
            chatWindow.scrollTop = chatWindow.scrollHeight + 100;
            // console.log(chatWindow.scrollTop)
        },
        removeRefer() {
            this.referMsg = "";
        },
        handleChat() {

            // console.log(this.currentRoom.status)

            if (!this.currentRoom.status) {
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
                    .then(data => {})
            }



            const valueChat = {
                uid: this.currentRoom.oid,
                name: this.currentRoom.name,
                members: this.currentRoom.members,
                staff: this.currentRoom.staff,
                createAt: this.currentRoom.createAt,
                img: this.currentRoom.img,
                status: !this.currentRoom.status,
                active: this.currentRoom.active
            }

            fetch(`${http}/client/rooms`, {
                method: "PUT",
                body: JSON.stringify(valueChat)
            }).then(response => response.json())
                .then(data => console.log(data.message))
        },
        findMessages(id) {
            if (!id) {
                return "";
            }

            const found = this.messages.find((value) => value.oid === id);
            // //(found);
            return found;
        },
        handleChangeSaldo(item, e, i) {
            // console.log(item, e.target.value, i)
            const value = this.users;
            this.saldo = event.target.value;

            value[i] = {
                hipodromo: this.user.hipodromo,
                carrera: "Carrera " + this.user.carrera,
                name: item,
                saldo: this.saldo
            }
            // console.log(value)
        },
        async handleCarrera() {
            // console.log(this.users, this.users.length, this.room);

            for (let index = 0; index < this.users.length; index++) {
                const element = this.users[index];
                const text = `${element.hipodromo}, ${element.carrera}, ${Number(element.saldo)}`;
                await this.obtenerRoom(element.name);
                const payload = {
                    content: text,
                    content2: "",
                    ishidden: false,
                    refer: this.referMsg?.oid ?? "",
                    sender: this.profile.User.username,
                    room: this.room[1].oid,
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
                            this.scrollEnd();
                        }
                    })
            }



            this.users = [];
            this.user.hipodromo = '';
            this.user.carrera = '';
            this.saldo = '';
            document.getElementById('saldo').value = '';
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
                        this.memberBorrado = person;
                        this.mostrarInfoDel = true;
                        this.obtenerRoom();
                    });
            }
        },
        async obtenerRoom(name) {
            await fetch(`${http}/client/rooms/findroombyusername/${name}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(async data => {
                    // console.log(data)
                    this.room = await data;

                    return this.room;
                })


        },
        scrollEnd() {
            var container = document.querySelector('.chat');
            var scrollHeight = container.scrollHeight;
            container.scrollTop = scrollHeight;
        }

    },

    mounted() {
        this.scrollEnd();
    },
}

</script>

<template>
    <div class="container-full p-1" v-if="!mostrarAterrizaje">

        <header class="header" v-if="currentRoom">


            <div class="showPart" data-bs-toggle="modal" data-bs-target="#staticBackdrop2">
                <img v-if="currentRoom?.img != ''" class="imgTitulo" :src=currentRoom?.img />
                <img v-if="currentRoom?.img == ''" class="imgTitulo" src="../assets/img/user.svg" />
                <div style="display:flex; flex-direction: column; margin-left:5px;">
                    <h6 class="m-0" style="text-transform:capitalize;">{{ currentRoom?.name }}</h6>
                    <span class="text-secondary members">{{ memberStrs }}</span>
                </div>

            </div>
            <div style="display: flex;">
                <a v-if="rol === 'admin' && currentRoom.members?.length > 1"
                    className="btn  btn-danger bajaBotones text-white mr-1" @click="handleChat">
                    <i class="fa-sharp fa-regular fa-circle-stop"></i>
                </a>
                <a v-if="rol === 'admin' && currentRoom.members?.length > 1"
                    className="btn btn-success bajaBotones  text-white" data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop3">
                    <i class="fa-solid fa-money-bill"></i>
                </a>
                <div class="dropdown" v-if="rol == 'admin'" style="margin-right: 3px;">
                    <button class="btn btn-secondary bajaBotones dropdown-toggle" type="button" id="dropdownMenuButton1"
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
                    <button class="btn btn-secondary bajaBotones dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false" @click="obtenerRoom(profile.User.username)">
                        <i class="fa-regular fa-envelope"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labellehttpy="dropdownMenuButton1">
                        <li v-for="item in rooms" @click="CurrentRoom(item)"><a class="dropdown-item" href="#">{{
                            item.name
                        }}</a></li>
                    </ul>
                </div>
            </div>

        </header>
        <div class="copy-link" v-if="mostrarLink">
            <input type="text" readonly class="copy-link-input" :value="link">
            <button class="copy-link-button" @click="copiar(link)"><i class="fa-solid fa-copy"></i></button>
        </div>
        <div v-if="currentRoom" class="chat" id="chat"
            style="height:calc(100% - 70px); overflow-y: scroll; background: url('https://firebasestorage.googleapis.com/v0/b/profileinh.appspot.com/o/fondo.png?alt=media&token=13b267a0-f26d-4d07-9338-e334fc9fdb5f'); ">
            <!--<img class="fondoDefault" src="../assets/img/fondoDefault.jpeg" alt="">-->
            <div style="margin-top:70px;">


                <ul class="p-1 m-0" style="font-size:13px;">

                    <div :class="[profile.User.username == item.sender ? 'alignDer' : 'alignIzq']" v-for="item in messages">
                        <div :class="[profile.User.username == item.sender ? 'messagerow2' : 'messagerow']">

                            <div v-if="item.refer != ''">
                                <div class="viewrefer">
                                    <p class="msgtitle">{{ item.refer }}</p>
                                    <p class="msgcontent" style="max-height: 50px; overflow: hidden;">{{ item.content2 }}
                                    </p>
                                </div>
                            </div>

                            <div class="msgheader">
                                <p class="msgtitle">{{ item.sender }}</p>
                                <div style="margin-left:5px;">
                                    <a href="#" class=" text-secondary" style="margin-right: 15px;"
                                        @click="copiar(item.content)"><i class="fa-solid fa-copy"></i></a>
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
                </ul>
            </div>


            <div class="text-center" v-if="mostrarInfo">{{ memberAgregado }} fue agregada al grupo</div>
            <div class="text-center" v-if="mostrarInfoDel">{{ memberBorrado }} fue eliminada del grupo</div>

        </div>
        <div v-if="currentRoom" class="boxFooter">
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
                <input autofocus type="text" v-model="chat" class="inputcmp" placeholder="escribir mensaje...."
                    style="height: 60px;">
                <button style="width: 60px; height: 60px; border-radius: 50%" class="btn btn-success"
                    @click="appendMenssage()"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    </div>

    <div class="container-full" v-if="mostrarAterrizaje">
        <div class="boxSeguridad">
            <div class="box text-center">
                <img class="deslogueo" src="../assets/img/caballos.jpg" alt="">
                <h3>Grupo Inactivo espere que lo desbloqueen o link de logueo</h3>
            </div>
        </div>
    </div>



    <!-- Modal -->
    <div v-if="currentRoom" class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog" style="margin-top:70px;">
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
                        <div className="text-center p-4">
                            <img style="width: 100px; height: 100px; margin: auto;" :src="currentRoom.img" alt="" />
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="limpiar()">Close</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal"
                        @click="registerMember($event)">Agregar</button>
                </div>
            </div>
        </div>
    </div>

    <div v-if="currentRoom" class="modal fade" id="staticBackdrop2" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog" style="margin-top:70px;">
            <div class="modal-content">
                <div class="modal-header bg bg-success text-white">
                    <h5 class="modal-title" id="staticBackdropLabel">Información de Participantes</h5>
                    <button type="button" class="btn btn-dark btn-close text-white" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="list-group">
                        <div class="mb-2 p-2" v-for="item in currentRoom?.members"
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

    <div v-if="currentRoom" class="modal fade" id="staticBackdrop3" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labellehttpy="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog" style="margin-top:70px;">
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
                            <input id="saldo" v-if="item != profile.User.username" type="text" className="m-1"
                                placeholder="saldo" @blur="($event) => handleChangeSaldo(item, $event, i)"
                                @change="($event) => handleChangeSaldo(item, $event, i)" />
                        </li>
                    </ul>
                    <div class="mt-2 text-center">
                        <button class="btn btn-success btn-lg btn-block" data-bs-dismiss="modal"
                            @click="handleCarrera()">Enviar Saldo</button>
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

.bajaBotones {
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    margin-right: 3px;
}

.boxFooter {
    position: fixed;
    display: flex;
    flex-direction: column;
    bottom: 0;
    width: 100%;
}

.bajaBotones::after,
.bajaBotones::before {
    display: none;
}

.members {
    display: flex;
    color: gray;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-height: 30px;
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
    margin-top: 70px;
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
    /* position: absolute; */
    background-color: white;
    /* bottom: 60px; */
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
    max-width: 420px;
    max-height: 100px;
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
    position: fixed;
    width: 100%;
    z-index: 10000;
    top: 0;
}

.msgtitle {
    text-transform: capitalize;
    margin-bottom: 5px;
    font-weight: bold;
}

.msgcontent {
    overflow-wrap: break-word;
    white-space: pre-wrap;
    max-width: 400px;
    margin-bottom: 5px;
}

.msgdate {
    float: right;
    /* margin-top: 10px; */
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
    /* display: flex; */
    /* justify-content: space-between; */
}

.messagerow {
    background-color: white;
    padding: 2px;
    border-radius: 8px;
    border-right: 1px solid #00a884;
    margin: 2px 15% 2px 3%;
    line-height: 1;
}

.messagerow2 {
    background-color: #a9f5d1;
    /* width: 200px; */
    padding: 2px;
    border-radius: 8px;
    display: inline-block;
    border-left: 1px solid white;
    margin: 2px 5% 2px 15%;
    line-height: 1;
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

.inputcmp {
    flex-grow: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: #d1d7db;
    width: 100%;
}
</style>