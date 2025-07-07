const socket = io();

function enviar() {
  const texto = document.getElementById("mensagem").value;
  const usuario = document.getElementById("usuario").value;

  if (!texto || !usuario) return;

  socket.emit("novaMensagem", { texto, usuario });
  document.getElementById("mensagem").value = "";
}

// Adiciona mensagem na tela
function adicionarMensagemNaTela(msg) {
  const ul = document.getElementById("chat");
  const li = document.createElement("li");
  li.textContent = `${msg.usuario}: ${msg.texto}`;
  ul.appendChild(li);
}

// Recebe mensagens em tempo real
socket.on("mensagemRecebida", (msg) => {
  adicionarMensagemNaTela(msg);
});

// Carrega mensagens anteriores
async function carregarMensagens() {
  const resposta = await fetch("/mensagens");
  const mensagens = await resposta.json();

  mensagens.forEach((msg) => {
    adicionarMensagemNaTela(msg);
  });
}

window.addEventListener("load", carregarMensagens);
