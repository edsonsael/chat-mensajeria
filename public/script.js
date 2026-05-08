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


        if(data.type === 'users'){
            const usersList = document.getElementById('users-list');
            usersList.innerHTML =
                '<strong>Usuarios conectados:</strong><br>' +
                data.users.join('<br>');
            return;
        }

        if(data.type === 'system'){
           item.textContent = data.message;
           item.classList.add('system-message');
        }else{
            if(data.username === username){
                item.classList.add('my-message');
            }else{
                item.classList.add('other-message');
            }

           item.innerHTML = `
                <div class="message-username">
                    ${data.username}
                </div>

                <div class="message-text">
                    ${data.message}
                </div>

                <div class="message-time">
                    ${data.time}
                </div>

            `;
        }

        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
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