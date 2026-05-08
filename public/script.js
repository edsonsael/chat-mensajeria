let username = localStorage.getItem('username'); //almacena el usuario para cada sesion

if(!username){
    username = 'Usuario_' + Math.floor(Math.random() * 1000);
    localStorage.setItem('username', username);
}


const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
        console.log('Conectado al servidor WebSocket');
        socket.send(JSON.stringify({
            type: 'join',
            username: username
        }));
    };

    socket.onmessage = (event) => {
        const messages = document.getElementById('messages');
        const item = document.createElement('li');
        const data = JSON.parse(event.data);

        if(data.type === 'system'){
           item.textContent = data.message;
        }else{
            item.textContent =
                data.username +
                ': ' +
                data.message +
                ' [' + data.time + ']';
        }

        messages.appendChild(item);
    };
    socket.onclose = () => {
        console.log('Conexión cerrada');
    };
    
    function sendMessage() {
    
    const message = document.getElementById('message').value.trim();
    
    if(message === ''){
        alert('No se puede enviar mensajes vacios');
        return
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socket.send(JSON.stringify({
        type: 'message',
        username: username,
        message: message,
        time: time
    }));
        document.getElementById('message').value = '';
    }

    function handleKeyPress(event){
        if(event.key === 'Enter'){
            sendMessage();
        }
    }