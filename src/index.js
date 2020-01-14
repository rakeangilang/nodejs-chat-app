const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

port = process.env.PORT || 5000;

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
    console.log('New Websocket Connection');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if(error) return callback(error);

        socket.join(user.room);

        socket.emit('message', generateMessage('System', `Welcome, ${user.username}!`));
        socket.broadcast.to(user.room).emit('message', generateMessage('System', `${user.username} has joined!`));
        io.to(user.room).emit('updateRoom', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit

        callback();
    });
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage('System', `${user.username} has left!`));
            io.to(user.room).emit('updateRoom', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        };

    });

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter();
        if(filter.isProfane(msg)) {
            return callback("No profanity allowed");
        };

        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(user.username, msg));
        callback();
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location));
        callback();
    });
});

server.listen(port);