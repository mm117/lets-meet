const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4:uuidv4} = require('uuid');
const path = require('path');
const {ExpressPeerServer}  = require('peer');
const peerServer = ExpressPeerServer(server,{
    debug:true
})
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/peerjs', peerServer);

app.get('/', (req,res)=>{
     res.render('home');
    // res.redirect(`/${uuidv4()}`);
})
app.get('/room', (req,res)=>{
    res.redirect(`/room/${uuidv4()}`);
    // res.render('room',{roomId:req.params.room});
})

app.get('/room/:roomId', (req,res)=>{
    res.render('room',{roomId:req.params.roomId});
})

app.get('/home', (req,res) => {
     console.log("home page");
    res.render('home');
})

io.on('connection', socket => {
    socket.on('join-room', (roomId,userId) => {
       socket.join(roomId);
       socket.to(roomId).broadcast.emit('user-connected', userId);
       socket.on('message', message => {
           io.to(roomId).emit('createMessage', message);
       })
       socket.on('disconnect', (userId) => {
           console.log("disconnected");
           
          io.to(roomId).emit('userLeft', userId);
      });
    })
})


server.listen(process.env.PORT || 3030);