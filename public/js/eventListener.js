document.querySelector('#createAccount').addEventListener('submit', (event) => {
  event.preventDefault()
  //document.querySelector('#createAccount')
    socket.emit('createUser', {
        username: document.querySelector('#username').value,
        password: document.querySelector('#password').value,
    })
})