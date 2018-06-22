var express = require('express');
var app = express();


var fs = require('fs');
var options = {
    key: fs.readFileSync('/etc/ssl/private/apache-selfsigned.key'),
    cert: fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt'),
    ca: fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

var https = require('https').createServer(options, app);
var http = require('http').createServer(app);

var IoServer = require('socket.io');
var path = require('path');
app.use(express.static(path.join(__dirname,'public')));
app.use('/img',express.static(path.join(__dirname,'img')));

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/test', function(req, res){
    res.render('test.ejs');
});

app.get('/test2', function(req, res){
    res.render('test2.ejs');
});

app.get('/conference', function(req, res){
    res.render('conference.ejs');
});

app.get('/multi-conference', function(req, res){
    res.render('mutli-conference.ejs');
});


var io = new IoServer();

io.attach(https);
io.attach(http);

io.on('connection', function (socket) {

	socket.on("send",function(data){
        io.sockets.in(data.room).emit('message', {
            message: data.message,
            author: data.author
        });
	});

	socket.on("mouse_move",function(data){
        socket.broadcast.emit('mouse_move', data);
	});

    socket.on("mouse_click",function(data){
        socket.broadcast.emit('mouse_click', data);
    });

    socket.on("signal",function(data){
        socket.broadcast.emit('signal', data)
    });

    /*socket.on("signal",function(data){
        socket.broadcast.emit('signal', {
            user_type: data.user_type,
            user_name: data.user_name,
            user_data: data.user_data,
            command: data.command
        })
    });*/

    socket.on("test",function(data){
        socket.broadcast.emit('test', data);
    });

   /* socket.on("video_signal",function(data){
        socket.broadcast.emit('video_signal', data);
    });*/

    socket.on("video_signal",function(data){
        socket.broadcast.emit('video_signal', data);
    });

    socket.on("video_signal_conference",function(data){
        socket.broadcast.to(data.to_id).emit('video_signal_conference', data);
    });

    socket.on("start_video_call",function(data){
        var socketsObj = Object.keys(io.sockets.sockets);
        var sockets = [];
        socketsObj.forEach(function(key){
            sockets.push(key);
        });
        data.sockets = sockets;
        socket.broadcast.emit('start_video_call', data);
    });

    socket.on("join_video_call",function(data){
        var socketsObj = Object.keys(io.sockets.sockets);
        var sockets = [];
        socketsObj.forEach(function(key){
            sockets.push(key);
        });
        data.sockets = sockets;
        socket.emit('join_video_call', data);
    });

    socket.on("leave_video_call",function(data){
        socket.broadcast.emit('leave_video_call', data);
    });

    socket.on("stop_video_call",function(data){
        socket.broadcast.emit('stop_video_call', data);
    });

});

process.on('uncaughtException', function (err) {
    console.log("caught exception : ");
    console.log(err);
});

process.setMaxListeners(0);

https.listen(6001, function () {
    console.log('listening on *:6001');
});

http.listen(6000, function () {
    console.log('listening on *:6000');
});