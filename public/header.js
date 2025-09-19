document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  
    const headerUser = document.getElementById("headerUser");
    const headerLogin = document.getElementById("headerLogin");
  
    if (usuario) {
      if (headerUser) {
        headerUser.innerHTML = `
          <span class="user-info">
            <i class="fas fa-user-circle"></i> ${usuario.nome}
          </span>
          <button onclick="sair()" class="btn-logout">Sair</button>
        `;
      }
      if (headerLogin) headerLogin.style.display = "none";
    } else {
      if (headerUser) headerUser.style.display = "none";
    }
  });
  