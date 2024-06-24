const socket = io()
document.querySelector('#createAccount').addEventListener('submit', (event) => {
     event.preventDefault()
     //document.querySelector('#createAccount')
     socket.emit('createUser', {
         username: document.querySelector('#username').value,
         password: document.querySelector('#password').value,
     })
 })

socket.on('createUserResponse', (message) => {
    if(message === "User already exists") {
        document.getElementById('alreadyexist').style.visibility = 'visible';
    }
});