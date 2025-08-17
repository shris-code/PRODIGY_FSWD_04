// public/client.js
let socket;
const $ = (sel) => document.querySelector(sel);

const loginCard = $('#login-card');
const chatUI = $('#chat-ui');
const usernameEl = $('#username');
const roomEl = $('#room');
const joinBtn = $('#joinBtn');
const messages = $('#messages');
const m = $('#m');
const sendBtn = $('#sendBtn');
const typingDiv = $('#typing');
const userList = $('#userList');
const userCount = $('#userCount');
const roomName = $('#roomName');

function addMsg({ username, text, system, ts }) {
  const li = document.createElement('li');
  if (system) li.classList.add('system');
  li.innerHTML = system
    ? escapeHtml(text)
    : `<strong>${escapeHtml(username)}:</strong> ${escapeHtml(text)}`;
  li.title = new Date(ts || Date.now()).toLocaleString();
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function join() {
  const username = usernameEl.value.trim() || 'Anonymous';
  const room = roomEl.value.trim() || 'general';
  roomName.textContent = `#${room}`;
  loginCard.classList.add('hidden');
  chatUI.classList.remove('hidden');
  socket = io();

  socket.on('connect', () => {
    socket.emit('join', { username, room });
  });

  socket.on('history', (hist) => {
    messages.innerHTML = '';
    hist.forEach(addMsg);
  });

  socket.on('message', addMsg);

  socket.on('users', (list) => {
    userList.innerHTML = '';
    list.forEach(u => {
      const li = document.createElement('li');
      li.textContent = u;
      userList.appendChild(li);
    });
    userCount.textContent = list.length;
  });

  let typingTimeout;
  m.addEventListener('input', () => {
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('typing', false), 800);
  });

  socket.on('typing', ({ username, isTyping }) => {
    typingDiv.textContent = isTyping ? `${username} is typing…` : '';
  });
}

joinBtn.addEventListener('click', join);
m.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && m.value.trim()) {
    e.preventDefault();
    send();
  }
});
sendBtn.addEventListener('click', send);

function send() {
  if (!m.value.trim()) return;
  socket.emit('message', m.value.trim());
  m.value = '';
  socket.emit('typing', false);
}
