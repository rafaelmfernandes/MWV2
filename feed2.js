// Renderiza os cards do feed a partir de POSTS_MOCK (js/feed-data.js)

function iconeLocal() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

function iconeEstrela() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;
}

function iconeCoracao() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`;
}

function iconeComentario() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
}

function iconeEnviar() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
}

function iconeSalvar() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>`;
}

function criarCardPost(post) {
  const temImagem = !!post.imagem;

  const avatarHtml = post.autorAvatar
    ? `<img src="${post.autorAvatar}" alt="${post.autorNome}">`
    : "";

  const imagemHtml = temImagem
    ? `<div class="post-imagem">${
        typeof post.imagem === "string"
          ? `<img src="${post.imagem}" alt="Foto de ${post.autorNome}">`
          : ""
      }</div>`
    : "";

  return `
    <article class="post-card">
      <div class="post-cabecalho">
        <div class="post-autor">
          <div class="avatar-post">${avatarHtml}</div>
          <div class="post-autor-info">
            <span class="post-autor-nome">${post.autorNome}</span>
            <span class="post-local">${iconeLocal()} ${post.autorLocal}</span>
          </div>
        </div>
        <button class="post-menu" aria-label="Mais opções">&#8942;</button>
      </div>

      ${imagemHtml}

      <div class="post-badge-wrap">
        <span class="badge-categoria">${iconeEstrela()} ${post.categoria}</span>
      </div>

      <p class="post-generos">${post.generos}</p>
      <p class="post-descricao">${post.descricao}</p>

      <div class="post-divisor"></div>

      <div class="post-acoes">
        <button aria-label="Curtir">${iconeCoracao()}</button>
        <button aria-label="Comentar">${iconeComentario()}</button>
        <button aria-label="Enviar">${iconeEnviar()}</button>
        <button aria-label="Salvar">${iconeSalvar()}</button>
      </div>
    </article>
  `;
}

function renderizarFeed() {
  const feed = document.getElementById("feed");
  if (!feed) return;
  feed.innerHTML = POSTS_MOCK.map(criarCardPost).join("");
}

document.addEventListener("DOMContentLoaded", renderizarFeed);
