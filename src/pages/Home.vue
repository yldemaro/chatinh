

<script>

import { db } from '../http/apihttp';

export default {

    data() {
        return {
            profile: {},
            rooms: [],
            currentRoom: {},
            members: [],
            rol: '',
            messages: []
        }
    },
    created() {
        this.logueado()
        this.obtenerRooms();
        this.getMessages();
    },
    methods: {
        async logueado() {
            this.profile = JSON.parse(localStorage.getItem("profile"));

            if (this.profile) {
                this.Rol(this.profile.User.role)

            } else {
                return;
            }

            // console.log(this.profile);
        },
        async Rol(rol) {
            this.rol = rol;
            console.log(this.rol)
        },
        async obtenerRooms() {
            setInterval(async () => {
                await fetch(`${db}/client/rooms/findroombyusername/${this.profile.User.username}`, {
                    method: "POST"
                })
                    .then(response => response.json())
                    .then(data => {
                        // this.data = [];

                        if (!data || data.message == "User dont have any room") {
                            this.rooms = [];
                            return;
                        }
                        if (data.length === 1) {
                            this.rooms = data[0];
                            this.CurrentRoom(data[0])
                        } else {
                            this.rooms = data;
                        }
                        // this.getMessages();
                    })
            }, 4000)

        },
        async CurrentRoom(room) {
            // console.log(room)


            // if (room.members.length === 0) {
            //     return ""

            // } else {
            //     return room.members.join(", ");

            // }

            this.currentRoom = room;

        },
        handleShowParticipantes() {
            console.log('agregar participante')
        },
        getMessages() {
            setInterval(() => {
                fetch(`${db}/client/messages/${this.currentRoom?.oid}`, {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(data => this.messages = data);
            }, 1500);

        }
    }
}

</script>

<template>
    <div class="container-full p-2">
        <header class="header">
            <img v-if="currentRoom?.img != ''" class="imgTitulo" :src=currentRoom?.img />
            <img v-if="currentRoom?.img == ''" class="imgTitulo" src="../assets/img/user.svg" />

            <div class="showPart ml-2" @click="handleShowParticipantes()" v-if="currentRoom">

                <h3>{{ currentRoom.name?.toUpperCase() }}</h3>
                <p class="text-secondary members"><span v-for="item in currentRoom?.members">{{ item }}</span>
                </p>
            </div>
            <div class="text-right" v-if="rol === 'admin'">
                <a className="btn  btn-danger text-white mr-1" onClick={handleChat}>
                    <i class="fa-sharp fa-regular fa-circle-stop"></i>
                </a>
                <a className="btn btn-success  text-white" onClick={handleShowUserPagar}>
                    <i class="fa-solid fa-money-bill"></i>
                </a>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-regular fa-envelope"></i>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
            </div>
        </header>
        <div v-if="currentRoom">
            <div style="height: 80vh;">

                <img class="imgGrupo" :src="currentRoom.img" alt="" v-if="currentRoom.img != ''">
                <img class="imgGrupo" src="../assets/img/fondoDefault.jpeg" alt="" v-if="currentRoom.img == ''">
                <ul class="p-1" style="height: 100%; overflow-y: auto;">

                    <div :class="[profile.User.username == item.sender ? 'alignDer' : 'alignIzq']" v-for="item in messages">
                        <div :class="[profile.User.username == item.sender ? 'messagerow2' : 'messagerow']">
                            <div class="msgheader">
                                <p class="msgtitle">{{ item.sender }}</p>
                                <a class="icon_btn" onClick={onReferMessage}>
                                    <i class="fa-solid fa-chevron-down"></i>
                                </a>
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
            <div class="inputContainer">
                <input type="text" class="inputcmp" placeholder="escribir mensaje...." style="height: 60px;">
                <button class="btn btn-sucess">Enviar</button>
            </div>
            <!--<Messages :message="messages" />-->
        </div>
        <div v-if="rooms?.length === 0">
            <h1>no tiene grup</h1>
        </div>

        <!--<button class="btn btn-success botonFlotante" data-bs-toggle="modal" data-bs-target="#staticBackdrop"></button>-->

        <div class="dropdown botonFlotante">
            <button class="btn btn-success dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown"
                aria-expanded="false">
                <i class="fa-solid fa-plus"></i>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Agregar
                        Miembro</a></li>
                <li><a class="dropdown-item" href="#">Agregar Nuevo Grupo</a></li>
            </ul>
        </div>


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
</template>

<style>
.botonFlotante {
    position: absolute;
    bottom: 100px;
    right: 30px;
    width: 60px;
    height: 60px;
}

.header {
    display: flex;
    flex-direction: row;
    /* justify-content: space-between; */
    align-items: center;
    margin: 0px;
    padding: 10px;
    background-color: #cdcebc;
    min-height: 60px;
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

.imgTitulo {
    width: 64px;
    height: 64px;
    border: 2px solid white;
    border-radius: 50%;
}

.showPart {
    width: 75%;
}

.imgGrupo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.6;
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
    flex: 1;
    justify-content: flex-start;
}

.messagerow {
    background-color: white;
    padding: 5px;
    border-radius: 8px;
    border-right: 2px solid blueviolet;
    margin: 2px 0 2px 10px;
}

.messagerow2 {
    background-color: #a9f5d1;
    /* width: 200px; */
    padding: 5px;
    border-radius: 8px;
    display: inline-block;
    border-left: 2px solid white;
    margin: 2px 10px 2px 0;
}

.alignDer {
    display: flex;
    flex: 1;
    justify-content: flex-end;
}

.alignIzq {
    display: flex;
    flex: 1;
    justify-content: flex-start;
}

.inputcontainer {
    display: flex;
    padding: 10px;
    border-top: solid 1px #ccc;
    align-items: center;
    justify-content: space-between;
}

.msgtitle {
    font-weight: bold;
}

.inputcmp {
    flex-grow: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: #cecece;
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