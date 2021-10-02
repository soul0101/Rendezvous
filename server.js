const express = require('express');
const app = express();
const server = require('http').Server(app);
const {ExpressPeerServer} = require('peer');
const { v4: uuidv4 } = require('uuid');
const port = 3000;
const io = require('socket.io')(server);

let peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public')); // ??????????????????????
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId : req.params.room});
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        console.log('Joined the room');
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        console.log(userId);
        // ?????????????????????????????????????????????
        socket.on('chatMessage', (senderId, message) => {
            io.to(roomId).emit('create-message', senderId, message);
        });
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
    });
});


server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
