    const socket = new WebSocket('ws://localhost:3000');
    socket.onopen = () => {
        console.log('Conectado al servidor WebSocket');
    };

    socket.onmessage = (event) => {
        const messages = document.getElementById('messages');
        const item = document.createElement('li');
        item.textContent = event.data;
        messages.appendChild(item);
    };
    socket.onclose = () => {
        console.log('Conexión cerrada');
    };
    
    function sendMessage() {
        const username = document.getElementById('username').value.trim();


    const message = document.getElementById('message').value.trim();
    if (username === '' && message === '') {
   
             alert('Debe ingresar nombre y mensaje');
       
        return;
    }
    if(username === ''){
        alert('Debe ingresar nombre y mensaje');
        return
    }
    if(message === ''){
        alert('No se puede enviar mensajes vacios');
        return
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


    const finalMessage =  username + ': ' + message + '  [' + time + '] ';
        socket.send(finalMessage);
        document.getElementById('message').value = '';
        }