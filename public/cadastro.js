// Importando SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } 
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

// Cadastro
document.getElementById("formCadastro")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    // Salva dados do usuário no Firestore
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nome: nome,
      email: email,
      criadoEm: new Date()
    });

    alert("Conta criada com sucesso!");
    window.location.href = "/index";
  } catch (err) {
    alert("Erro ao criar conta: " + err.message);
  }
});
