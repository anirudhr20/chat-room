const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);


const port = process.env.PORT||3000;

const publicPath = path.join(__dirname,'../public');

var io = socketIO(server);
app.use(express.static(publicPath));
io.on('connection',(socket)=>{
    console.log('New user connected');


    socket.on('createMessage',(Message)=>{
        console.log('createMessage',Message);
        io.emit('newMessage',{
            from:Message.from,
            text:Message.text,
            createAt: new Date().getTime()
        })
    })

    socket.on('disconnect',()=>{
        console.log('User was disconnected');
    })
});


server.listen(3000,()=>{
    console.log(`Server is up on port ${port}`);
});

