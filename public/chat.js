const socket = io();

function enviar() {
  const texto = document.getElementById("mensagem").value.trim();
  const usuario = document.getElementById("usuario").value.trim();

  if (!texto || !usuario) {
    alert("Preencha nome e mensagem!");
    return;
  }

  socket.emit("novaMensagem", { texto, usuario });
  document.getElementById("mensagem").value = "";
}

socket.on("mensagemRecebida", (msg) => {
  const ul = document.getElementById("chat");
  const li = document.createElement("li");
  li.textContent = `${msg.usuario}: ${msg.texto}`;
  ul.appendChild(li);
  ul.scrollTop = ul.scrollHeight;
});
