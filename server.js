const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");
const { db } = require("./firebase/admin"); 

const app = express();

// Configurações do Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors({
  origin: ["https://rede-social-tcc.firebaseapp.com"]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Referência à coleção mensagens no Firestore
const mensagensRef = db.collection("mensagens");

// Rota página inicial
app.get("/", (req, res) => {
  res.render("index");
});

// Rota para buscar mensagens antigas
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

app.get("/chat", async (req, res) => {
  try {
    const snapshot = await mensagensRef.orderBy("horario").get();
    const mensagens = snapshot.docs.map(doc => ({
      texto: doc.data().texto,
      usuario: doc.data().usuario,
      horario: doc.data().horario.toDate(),
    }));
    res.render("chat", { mensagens });
  } catch (err) {
    res.status(500).send("Erro ao carregar chat");
  }
});

app.post("/posts", async (req, res) => {
  const { autor, texto } = req.body;

  if ( !autor || !texto) {
    return res.status(400).json({ erro: "Autor e texto são obrigatórios"});
  }

  try {
    await db.collection("posts").add({
      autor,
      texto,
      data: new Date(),
      reacoes: {like: 0, love:0, haha: 0}
    });

    res.status(201).json({ mensagem: "Post criado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar post."});
  }
});

app.get("/posts", async (req, res) => {
  try{
    const snapshot = await db.collection("posts").orderBy("data", "desc").get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      autor: doc.data().autor,
      texto: doc.data().texto,
      data: doc.data().data.toDate(),
      reacoes: doc.data().reacoes
    }));

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar posts." });
  }
});


app.post("/posts/:id/reagir", async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body; // like, love, haha

  if (!["like", "love", "haha"].includes(tipo)) {
    return res.status(400).json({ erro: "Tipo de reação inválido." });
  }

  try {
    const postRef = db.collection("posts").doc(id);
    await postRef.update({
      [`reacoes.${tipo}`]: firebaseAdmin.firestore.FieldValue.increment(1)
    });
    res.json({ mensagem: "Reação adicionada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao adicionar reação." });
  }
});



// Cria servidor HTTP + Socket.io
const server = http.createServer(app);
const io = socketio(server);

// Escuta conexões WebSocket
io.on("connection", (socket) => {
  console.log("Usuário conectado");

  socket.on("novaMensagem", async (msg) => {
    console.log("Mensagem recebida:", msg);
    try {
      // Salva mensagem no Firestore
      await mensagensRef.add({
        texto: msg.texto,
        usuario: msg.usuario,
        horario: new Date(),
      });

      // Envia para todos os clientes conectados
      io.emit("mensagemRecebida", msg);
    } catch (err) {
      console.error("Erro ao salvar mensagem:", err);
    }
  });
});



// Porta e start do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
