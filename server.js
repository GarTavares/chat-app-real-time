const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");
const { db } = require("./firebase/admin");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const mensagensRef = db.collection("mensagens");

// Carrega histórico de mensagens
app.get("/mensagens", async (req, res) => {
  try {
    const snapshot = await mensagensRef.orderBy("horario").get();
    const mensagens = snapshot.docs.map(doc => ({
      texto: doc.data().texto,
      usuario: doc.data().usuario,
      horario: doc.data().horario.toDate(),
    }));
    res.json(mensagens);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar mensagens." });
  }
});

// Escuta conexões em tempo real
io.on("connection", (socket) => {
  console.log("Usuário conectado");

  socket.on("novaMensagem", async (msg) => {
    // Armazena no Firestore
    await mensagensRef.add({
      texto: msg.texto,
      usuario: msg.usuario,
      horario: new Date(),
    });

    // Envia para todos os dispositivos conectados
    io.emit("mensagemRecebida", msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
});
