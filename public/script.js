    const socket = new WebSocket('ws://localhost:3000');
    socket.onopen = () => {
        console.log('Conectado al servidor WebSocket');
    };

    socket.onmessage = (event) => {
        const messages = document.getElementById('messages');
        const item = document.createElement('li');
        const data = JSON.parse(event.data);

        item.textContent =
            data.username +
            ': ' +
            data.message +
            ' [' + data.time + ']';
        messages.appendChild(item);
    };
    socket.onclose = () => {
        console.log('Conexión cerrada');
    };
    
    function sendMessage() {
        const username = document.getElementById('username').value.trim();


    const message = document.getElementById('message').value.trim();
    
    if(message === ''){
        alert('No se puede enviar mensajes vacios');
        return
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


    const finalMessage =  username + ': ' + message + '  [' + time + '] ';
       
    let finalUsername = username;

    if(finalUsername === ''){
        finalUsername = 'Usuario_' + Math.floor(Math.random() * 1000);
    }

    socket.send(JSON.stringify({
        type: 'message',
        username: finalUsername,
        message: message,
        time: time
    }));
        document.getElementById('message').value = '';
    }