const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const {isRealString} = require('./utils/validation');
const {generateMessage,generateLocationMessage} = require('./utils/message');
const port = process.env.PORT||3000;
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname,'../public');

var io = socketIO(server);
var users = new Users();
app.use(express.static(publicPath));
io.on('connection',(socket)=>{
    console.log('New user connected');

    //socket.emit from admin text welcome 
    

    socket.on('join',(params,callback)=>{
        if(!isRealString(params.name)||!isRealString(params.room)){
            return callback('Name and room name are required');
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id,params.name,params.room);

        io.to(params.room).emit('updateUserList',users.getUserList(params.room));
        socket.emit('newMessage',generateMessage('Admin','Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined`));


        callback();
    })
    //socket.broadcast.emit from admin new user joined
    socket.on('createMessage',(Message,callback)=>{
        //console.log('createMessage',Message);
        var user =users.getUser(socket.id);
        if(user&&isRealString(Message.text)){
            io.to(user.room).emit('newMessage',generateMessage(user.name,Message.text));
        }
        
        callback();
       
    })
    socket.on('createLocation',(coords)=>{
        var user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude,coords.longitude));
        }
        
    });
    socket.on('disconnect',()=>{
        var user = users.removeUser(socket.id);

        if(user){
            io.to(user.room).emit('updateUserList',users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the chat`));
        }
    })
});


server.listen(3000,()=>{
    console.log(`Server is up on port ${port}`);
});

