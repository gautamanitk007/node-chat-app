
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage,generateLocation} = require('../src/utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('../src/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname,'../public')
app.use(express.static(publicDirectory))
//let counter = 0
io.on('connection',(socket)=>{
    console.log('new websocket connection')
   

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} has joined!`))
        // update/add new user has joined
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    //listen message relay from client
    socket.on('sendMessage',(message,callback)=>{

        const user = getUser(socket.id)
        // filter bad words
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        // send to everyone
        io.to(user.room).emit('message',generateMessage(user.username,message))

        
        callback()
    })
    //disconnect 
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,`${user.username} has left`))

            // update user list once user left the room

            io.to(user.room).emit('roomData',{
                user:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    //listen location reply from client
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

server.listen(port,()=>{
    console.log('Server is up on :',port)
})