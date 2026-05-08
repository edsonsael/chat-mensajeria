const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const messages = [];   //almacenar mensajes
const connectedUsers = []; //lista de usuarios conectados

app.use(express.static(path.join(__dirname, 'public')));

function broadcastUsers(){
    const usersMessage = {
        type: 'users',
        users: connectedUsers
    };

    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(usersMessage));
        }
    });
}

wss.on('connection', (ws) => {

    console.log('Cliente conectado');

    //cuando alguien entre se mostrara todos los mensajes anteriores
    messages.forEach((msg) => {
        ws.send(JSON.stringify(msg));
    });

    ws.on('message', (message) => {

        const data = JSON.parse(message.toString());
        ws.username = data.username;
        console.log(data);

        if(data.type === 'join'){
            connectedUsers.push(ws.username);

            const joinMessage = {
                type: 'system',
                message: ws.username + ' se unió al chat'
            };

            broadcastUsers();

            wss.clients.forEach((client) => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify(joinMessage));
                }
            });

            return;
        }

        //guarda todos los mensajes
        if(data.type === 'message'){
            messages.push(data);
        }

        //reenvia los mensajes
        wss.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(data));
            }
        });

    });

    ws.on('close', () => {

        console.log('Cliente desconectado');

        const leaveMessage = {
            type: 'system',
            message: ws.username + ' salió del chat'
        };

        const index = connectedUsers.indexOf(ws.username);
        if(index !== -1){
            connectedUsers.splice(index, 1);
        }

        broadcastUsers();

        wss.clients.forEach((client) => {

            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(leaveMessage));
            }

        });

    });

});

server.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});