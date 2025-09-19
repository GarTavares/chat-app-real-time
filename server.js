const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");
const firebaseAdmin = require("firebase-admin");
const { db } = require("./firebase/admin");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Configuração do EJS e pastas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Rota principal (feed)
app.get("/", (req, res) => {
  res.render("index"); // renderiza views/index.ejs
});

// Firebase: Referência ao Firestore
const mensagensRef = db.collection("mensagens");
const postsRef = db.collection("posts");

// Rota: Mensagens (para o chat)
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

// Página do chat
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

// Rota: Buscar todos os posts
app.get("/posts", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").orderBy("data", "desc").get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      autorId: doc.data().autorId,
      autor: doc.data().autor,
      texto: doc.data().texto,
      data: doc.data().data.toDate(),
      reacoes: doc.data().reacoes || { like: 0, love: 0, haha: 0 },
    }));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar posts." });
  }
});

// Rota: Criar um novo post
app.post("/posts", async (req, res) => {
  const { autor, texto } = req.body;
  if (!autor || !texto) {
    return res.status(400).json({ erro: "Autor e texto são obrigatórios." });
  }

  try {
    const novoPost = {
      autor,
      texto,
      data: new Date(),
      reacoes: { like: 0, love: 0, haha: 0 },
    };

    const docRef = await db.collection("posts").add(novoPost);
    novoPost.id = docRef.id;  
    await postsRef.add(novoPost);
    io.emit("novoPost", novoPost); // Envia para todos os clientes conectados

    res.status(201).json({ mensagem: "Post criado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar post." });
  }
});

// Rota: Reagir a um post
app.post("/posts/:id/reagir", async (req, res) => {
  const { id } = req.params;
  const { tipo, desfazer } = req.body;

  if (!["like", "love", "haha"].includes(tipo)) {
    return res.status(400).json({ erro: "Tipo de reação inválido." });
  }

  try {
    const postRef = postsRef.doc(id);
    await postRef.update({
      [`reacoes.${tipo}`]: firebaseAdmin.firestore.FieldValue.increment(desfazer ? -1 : 1)
    });

    res.json({ mensagem: "Reação atualizada." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao reagir ao post." });
  }
});
//Rota para deletar Post
app.delete("/posts/:id", (req, res) => {
  const postId = req.params.id;
  posts = posts.filter(p => p.id !== postId);
  res.status(200).send({ message: "Post excluído" });
});



// rota para página de login
app.get("/login", (req, res) => {
  res.render("login");
});

// rota para página de cadastro
app.get("/cadastro", (req, res) => {
  res.render("cadastro");
});

// WebSocket (chat em tempo real)
io.on("connection", (socket) => {
  console.log("Usuário conectado");

  socket.on("novaMensagem", async (msg) => {
    try {
      await mensagensRef.add({
        texto: msg.texto,
        usuario: msg.usuario,
        horario: new Date(),
      });

      io.emit("mensagemRecebida", msg);
    } catch (err) {
      console.error("Erro ao salvar mensagem:", err);
    }
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
});
