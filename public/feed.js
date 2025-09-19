const socket = io(); // inicializa socket.io client

// Ouve novos posts em tempo real
socket.on("novoPost", (post) => {
  const container = document.getElementById("posts");

  const div = document.createElement("div");
  div.className = "post";

  div.innerHTML = `
    <p><strong>${post.autor}</strong> <small>${new Date(post.data).toLocaleString()}</small></p>
    <p>${post.texto}</p>
    <div class="reacoes">
      <button onclick="reagir('${post.id}', 'like')">👍 ${post.reacoes.like}</button>
      <button onclick="reagir('${post.id}', 'love')">❤️ ${post.reacoes.love}</button>
      <button onclick="reagir('${post.id}', 'haha')">😂 ${post.reacoes.haha}</button>
    </div>
    <hr />
  `;

  container.prepend(div); // Adiciona no topo
});


// Carrega os posts ao abrir a página
async function buscarPosts() {
  const res = await fetch("/posts");
  const posts = await res.json();

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const container = document.getElementById("posts");
  container.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));

    let excluirBtn = "";
    if (usuario && usuario.uid === post.autorId) {
      excluirBtn = `<button onclick="excluirPost('{post.id}')">Excluir</button>`;
    };

    div.innerHTML = `
      <p><strong>${post.autor}</strong> <small>${new Date(post.data).toLocaleString()}</small></p>
      <p>${post.texto}</p>
      <div class="reacoes">
        <button onclick="reagir('${post.id}', 'like')">👍 ${post.reacoes.like}</button>
        <button onclick="reagir('${post.id}', 'love')">❤️ ${post.reacoes.love}</button>
        <button onclick="reagir('${post.id}', 'haha')">😂 ${post.reacoes.haha}</button>
      </div>
      <hr />
    `;

    container.appendChild(div);
  });
}
//excluir Post
async function excluirPost(postId) {
  if (!confirm("Tem certeza que deseja excluir este post?")) return;

  const res = await fetch(`/posts/${postId}`, { method: "DELETE" });

  if (res.ok) {
    buscarPosts();
  } else {
    alert("Erro ao excluir post");
  }
}
// Envia novo post
document.getElementById("formPost").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  if (!usuario) {
    alert("Você precisa estar logado e escrever algo!");
    return;
  }

  const novoPost = {
    autorId: usuario.uid,
    autor: usuario.nome || usuario.email,
    texto: texto,
    data: new Date().toISOString(),
  };

  const res = await fetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ autor, texto })
  });

  if (res.ok) {
    document.getElementById("texto").value = "";
    buscarPosts();
  } else {
    alert("Erro ao publicar post");
  }
});

// Função para reagir com toggle
async function reagir(postId, tipo) {
  const key = `reacao-${postId}`;
  let reacoesLocais = JSON.parse(localStorage.getItem(key)) || {};
  const jaReagiu = reacoesLocais[tipo];

  const res = await fetch(`/posts/${postId}/reagir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, desfazer: !!jaReagiu })
  });

  if (res.ok) {
    if (jaReagiu) delete reacoesLocais[tipo];
    else reacoesLocais[tipo] = true;

    localStorage.setItem(key, JSON.stringify(reacoesLocais));
    buscarPosts();
  } else {
    alert("Erro ao reagir");
  }
}

// Inicializa
window.onload = buscarPosts;
