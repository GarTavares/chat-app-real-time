// Função para buscar e mostrar posts
async function buscarPosts() {
  const res = await fetch("/posts");
  const posts = await res.json();

  const container = document.getElementById("posts");
  container.innerHTML = "";

  posts.forEach(post => {
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
    `;

    container.appendChild(div);
  });
}

// Enviar novo post ao submeter o formulário
document.getElementById("formPost").addEventListener("submit", async e => {
  e.preventDefault();

  const autor = document.getElementById("autor").value.trim();
  const texto = document.getElementById("texto").value.trim();

  if (!autor || !texto) {
    alert("Preencha nome e texto");
    return;
  }

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

// Função para reagir (vamos implementar no próximo passo)
async function reagir(postId, tipo) {
  const res = await fetch(`/posts/${postId}/reagir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo })
  });

  if (res.ok) {
    buscarPosts();
  } else {
    alert("Erro ao reagir");
  }
}


// Buscar posts ao carregar a página
window.onload = buscarPosts;
