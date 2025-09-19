// Importando SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Login
document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);

    // Busca nome do usuário no Firestore
    const snap = await getDoc(doc(db, "usuarios", cred.user.uid));

    let nome = email; // fallback caso não exista nome
    if (snap.exists()) {
      nome = snap.data().nome;
    }

    // Salva sessão no navegador
    sessionStorage.setItem("usuario", JSON.stringify({
      uid: cred.user.uid,
      nome: nome,
      email: cred.user.email
    }));

    alert(`Bem-vindo, ${nome}!`);
    window.location.href = "/";
  } catch (err) {
    alert("Erro ao logar: " + err.message);
  }
});

// Logout
export function sair() {
  signOut(auth).then(() => {
    sessionStorage.removeItem("usuario");
    window.location.href = "/login";
  });
}
