// ELEMENTOS HTML
const openBtn = document.getElementById("open-chatbot");
const closeBtn = document.getElementById("close-chatbot");
const chatWindow = document.getElementById("chatbot-window");
const sendBtn = document.getElementById("chatbot-send");
const inputBox = document.getElementById("chatbot-input");
const messagesBox = document.getElementById("chatbot-messages");

// Abrir janela
openBtn.addEventListener("click", () => {
    chatWindow.classList.remove("hidden");
    inputBox.focus();
});

// Fechar janela
closeBtn.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
});

// Mostrar mensagens
function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = sender === "user" ? "msg-user" : "msg-bot";

    if (sender === "bot") {
        div.innerHTML = text; // aqui aceita HTML
    } else {
        div.textContent = text; // usuário continua seguro
    }

    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Enviar mensagem ao backend
async function sendMessage() {
    const msg = inputBox.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    inputBox.value = "";

    const userId = localStorage.getItem("userId");

    try {
        const response = await fetch("http://localhost:4000/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: msg,
                userId: userId ? Number(userId) : null
            })
        });

        const data = await response.json();
        addMessage(data.answer || "Não consegui entender.", "bot");

    } catch (err) {
        addMessage("Erro ao conectar ao servidor.", "bot");
    }
}
// Botão ENVIAR
sendBtn.addEventListener("click", sendMessage);

// ENTER
inputBox.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});
