const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); //importar sqlite

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const db = new sqlite3.Database('./database.db'); //creamos la conexion a la base de datos
const messages = [];   //almacenar mensajes
const connectedUsers = []; //lista de usuarios conectados

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            message TEXT,
            time TEXT
        )
    `);

});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/messages', (req, res) => {
    db.all(
        'SELECT username, message, time FROM messages',
        [],
        (err, rows) => {
            if(err){
                res.status(500).json({
                    error: err.message
                });
                return;
            }
            res.json(rows);
        }
    );

});

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
    db.all(
        'SELECT username, message, time FROM messages',
        [],
        (err, rows) => {
            if(err){
                console.log(err.message);
                return;
            }

            rows.forEach((row) => {
                ws.send(JSON.stringify({
                    type: 'message',
                    username: row.username,
                    message: row.message,
                    time: row.time
                }));
            });

        }
    );

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

        //guarda todos los mensajes en la base de datos
        if(data.type === 'message'){
              db.run(
                    'INSERT INTO messages(username, message, time) VALUES (?, ?, ?)',
                    [data.username, data.message, data.time]
              );
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