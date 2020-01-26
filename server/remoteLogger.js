import socketIO from 'socket.io';

let io;

export const registerRemoteLogger = server => {
    io = socketIO(server);
    io.sockets.on('connection', function(socket) {
      socket.on('room', function(room) {
        socket.join(room);
      });
    });
};

export const sendRemoteLog = (apiId, log) => 
    io.sockets.in(apiId).emit('log', log);
