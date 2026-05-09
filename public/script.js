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

    let lastUsername = null;
    socket.onmessage = (event) => {
        const messages = document.getElementById('messages');
        const item = document.createElement('li');
        const data = JSON.parse(event.data);


        if(data.type === 'users'){
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = '';

            data.users.forEach((user) => {
                usersList.innerHTML += `
                     <div class="user-item">
                        🟢 ${user}
                    </div>
                `;
            });
            return;
        }

        if(data.type === 'system'){
           item.innerHTML = `

    <div class="system-text">
        ${data.message}
    </div>

`;
           item.classList.add('system-message');
        }else{
            const sameUser = lastUsername === data.username;
            if(data.username === username){
                item.classList.add('my-message');
            }else{
                item.classList.add('other-message');
            }

           const initial = data.username.charAt(0).toUpperCase();
           item.innerHTML = `

    <div class="message-row">

        ${!sameUser ? `
           ${data.username !== username ? `

    <div class="avatar">
        ${initial}
    </div>

` : ''}
        ` : `
            <div class="avatar-space"></div>
        `}

        <div class="message-bubble">

            ${!sameUser ? `
                <div class="message-username">
                    ${data.username}
                </div>
            ` : ''}

            <div class="message-text">
                ${data.message}
            </div>

            <div class="message-time">
                ${data.time}
            </div>

        </div>

    </div>

`;
        }

        messages.appendChild(item);
        lastUsername = data.username;
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