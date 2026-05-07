const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.static(path.join(__dirname, 'public')));
wss.on('connection', (ws) => {
    console.log('Cliente conectado');
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(data);
    // Reenviar el mensaje a todos los clientes conectados
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
        });
    });
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});
server.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});