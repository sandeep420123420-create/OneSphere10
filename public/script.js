const socket = io();

const SECRET_KEY = "onesphere_secret";

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const messagesDiv = document.getElementById("messages");
const usersDiv = document.getElementById("users");
const typingDiv = document.getElementById("typing");

const errorDiv = document.getElementById("error");

let currentUser = "";

loginBtn.onclick = () => {

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if(!username || !password){
    errorDiv.innerText = "All fields required";
    return;
  }

  socket.emit("login", {
    username,
    password
  });
};

socket.on("login_success", data => {

  currentUser = data.username;

  loginPage.classList.add("hidden");

  chatPage.classList.remove("hidden");
});

socket.on("login_error", msg => {
  errorDiv.innerText = msg;
});

socket.on("users", users => {

  usersDiv.innerHTML = `
    <h3>Online Users</h3>
    ${users.map(u => `<p>🟢 ${u}</p>`).join("")}
  `;
});

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keypress", e => {

  if(e.key === "Enter"){
    sendMessage();
  }

  socket.emit("typing", currentUser);
});

function sendMessage(){

  const msg = messageInput.value.trim();

  if(!msg) return;

  const encrypted = CryptoJS.AES.encrypt(
    msg,
    SECRET_KEY
  ).toString();

  socket.emit("message", encrypted);

  messageInput.value = "";
}

socket.on("message", data => {

  const bytes = CryptoJS.AES.decrypt(
    data.text,
    SECRET_KEY
  );

  const decrypted = bytes.toString(
    CryptoJS.enc.Utf8
  );

  addMessage(
    `${data.user}: ${decrypted}`
  );
});

socket.on("system", msg => {

  addSystem(msg);
});

socket.on("typing", user => {

  typingDiv.innerText = `${user} is typing...`;

  setTimeout(() => {
    typingDiv.innerText = "";
  }, 1500);
});

function addMessage(text){

  const div = document.createElement("div");

  div.className = "message";

  div.innerText = text;

  messagesDiv.appendChild(div);

  messagesDiv.scrollTop =
    messagesDiv.scrollHeight;
}

function addSystem(text){

  const div = document.createElement("div");

  div.className = "message system";

  div.innerText = text;

  messagesDiv.appendChild(div);
}

logoutBtn.onclick = () => {
  location.reload();
};
