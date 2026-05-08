const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const messages = [];   //almacenar mensajes

app.use(express.static(path.join(__dirname, 'public')));

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
            const joinMessage = {
                type: 'system',
                message: ws.username + ' se unió al chat'
            };

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