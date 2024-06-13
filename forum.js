document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const createThreadForm = document.getElementById('create-thread-form');
    const joinThreadForm = document.getElementById('join-thread-form');
    const postMessageForm = document.getElementById('post-message-form');
    const threadsContainer = document.getElementById('threads');
    const messageThreadSelect = document.getElementById('message-thread');
    const logoutButton = document.getElementById('logout-button');

    if (localStorage.getItem('token')) {
        document.querySelector('.screen').classList.add('logged-in');
        loadThreads();
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            document.querySelector('.screen').classList.add('logged-in');
            loadThreads();
        } else {
            alert(data);
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            document.querySelector('.screen').classList.add('logged-in');
            loadThreads();
        } else {
            alert(data);
        }
    });

    createThreadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = event.target.title.value;
        const visibility = event.target.visibility.value;

        const res = await fetch('http://localhost:5000/api/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, visibility })
        });

        if (res.ok) {
            loadThreads();
            event.target.reset();
        } else {
            alert('Failed to create thread.');
        }
    });

    joinThreadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const threadId = event.target.threadId.value;

        // This implementation assumes that joining a thread involves just selecting the thread.
        const res = await fetch(`http://localhost:5000/api/threads/${threadId}`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });

        if (res.ok) {
            alert('Thread joined.');
        } else {
            alert('Thread not found.');
        }

        event.target.reset();
    });

    postMessageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const threadId = event.target.thread.value;
        const content = event.target.content.value;

        const res = await fetch(`http://localhost:5000/api/threads/${threadId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ content })
        });

        if (res.ok) {
            loadThreads();
            event.target.reset();
        } else {
            alert('Failed to post message.');
        }
    });

    async function loadThreads() {
        const res = await fetch('http://localhost:5000/api/threads', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });

        if (res.ok) {
            const threads = await res.json();
            threadsContainer.innerHTML = '';
            messageThreadSelect.innerHTML = '';

            threads.forEach(thread => {
                const threadDiv = document.createElement('div');
                threadDiv.className = 'thread';
                const threadContentDiv = document.createElement('div');
                threadContentDiv.classList.add('thread-content');

                const toggleButton = document.createElement('button');
                toggleButton.textContent = thread.open ? 'Fermer' : 'Ouvrir';
                toggleButton.addEventListener('click', async () => {
                    await fetch(`http://localhost:5000/api/threads/${thread._id}/toggle`, {
                        method: 'PUT',
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    loadThreads();
                });
                threadDiv.appendChild(toggleButton);

                const toggleMessagesButton = document.createElement('button');
                toggleMessagesButton.textContent = 'Cacher/Afficher Messages';
                toggleMessagesButton.classList.add('toggle-messages-button');
                toggleMessagesButton.addEventListener('click', () => {
                    const messageContainer = threadContentDiv.querySelector('.messages');
                    messageContainer.classList.toggle('hidden');
                    toggleMessagesButton.textContent = messageContainer.classList.contains('hidden') ? 'Afficher Messages' : 'Cacher Messages';
                });
                threadDiv.appendChild(toggleMessagesButton);

                const closeButton = document.createElement('button');
                closeButton.textContent = 'Supprimer';
                closeButton.addEventListener('click', async () => {
                    await fetch(`http://localhost:5000/api/threads/${thread._id}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    loadThreads();
                });
                threadDiv.appendChild(closeButton);

                const threadTitle = document.createElement('h3');
                threadTitle.textContent = `${thread.title} (${thread.visibility}) - ID: ${thread._id}`;
                threadContentDiv.appendChild(threadTitle);

                const messageContainer = document.createElement('div');
                messageContainer.classList.add('messages');
                thread.messages.forEach(message => {
                    const messageP = document.createElement('p');
                    messageP.textContent = message.content;
                    messageContainer.appendChild(messageP);
                });
                threadContentDiv.appendChild(messageContainer);

                threadDiv.appendChild(threadContentDiv);
                threadsContainer.appendChild(threadDiv);

                const option = document.createElement('option');
                option.value = thread._id;
                option.textContent = `${thread.title} (${thread.visibility})`;
                messageThreadSelect.appendChild(option);
            });
        } else {
            alert('Failed to load threads.');
        }
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        document.querySelector('.screen').classList.remove('logged-in');
    });
});
