// Importando SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDzUY5rtEpu9zxnLB2hJqIHZchmMbsFc2Y",
  authDomain: "rede-social-tcc.firebaseapp.com",
  projectId: "rede-social-tcc",
  storageBucket: "rede-social-tcc.firebasestorage.app",
  messagingSenderId: "763136516576",
  appId: "1:763136516576:web:7c8d1bbbad6f60c7390b85",
  measurementId: "G-942X9EZ18B"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ------------------------- CADASTRO -------------------------
document.getElementById("formCadastro")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    // Salva nome do usuário no Firestore
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nome: nome,
      email: email,
      criadoEm: new Date()
    });

    alert("Conta criada com sucesso!");
    window.location.href = "/";
  } catch (err) {
    alert("Erro ao criar conta: " + err.message);
  }
});

// ------------------------- LOGIN -------------------------
document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado!");
    window.location.href = "/";
  } catch (err) {
    alert("Erro ao logar: " + err.message);
  }
});

// ------------------------- LOGOUT -------------------------
export function sair() {
  signOut(auth).then(() => {
    sessionStorage.removeItem("usuario");
    window.location.href = "/login";
  });
}

// ------------------------- HEADER -------------------------
onAuthStateChanged(auth, async (user) => {
  const headerRight = document.querySelector(".header-right");
  if (!headerRight) return;

  headerRight.innerHTML = "";

  if (user) {
    // Busca nome no Firestore
    const docSnap = await getDoc(doc(db, "usuarios", user.uid));
    const nome = docSnap.exists() ? docSnap.data().nome : user.email;

    headerRight.innerHTML = `
      <div class="user-info">
        <span class="user-name">${nome}</span>
        <button id="logoutBtn">🚪 Sair</button>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", sair);
  } else {
    headerRight.innerHTML = `<a href="/login">Login</a>`;
  }
});

// ------------------------- POSTS -------------------------
document.getElementById("formPost")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const conteudo = document.getElementById("conteudoPost").value.trim();
  if (!conteudo) return alert("Escreva algo!");

  const user = auth.currentUser;
  if (!user) return alert("Você precisa estar logado!");

  try {
    const docSnap = await getDoc(doc(db, "usuarios", user.uid));
    const nome = docSnap.exists() ? docSnap.data().nome : user.email;

    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      autor: nome,
      conteudo: conteudo,
      criadoEm: new Date()
    });

    document.getElementById("conteudoPost").value = "";
  } catch (err) {
    alert("Erro ao publicar: " + err.message);
  }
});

// ------------------------- LISTAR POSTS -------------------------
const postsContainer = document.getElementById("postsContainer");

if (postsContainer) {
  const q = query(collection(db, "posts"), orderBy("criadoEm", "desc"));
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const post = docSnap.data();
      postsContainer.innerHTML += `
        <div class="post">
          <p><strong>${post.autor}</strong></p>
          <p>${post.conteudo}</p>
          ${auth.currentUser?.uid === post.uid ? 
            `<button onclick="excluirPost('${docSnap.id}')">Excluir</button>` : ""}
        </div>
      `;
    });
  });
}

// ------------------------- EXCLUIR POST -------------------------
window.excluirPost = async (id) => {
  if (confirm("Tem certeza que deseja excluir este post?")) {
    await deleteDoc(doc(db, "posts", id));
  }
};
