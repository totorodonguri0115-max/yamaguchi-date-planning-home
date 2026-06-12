(function () {
  "use strict";

  const placeholder = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f3ddd5"/><stop offset="1" stop-color="#cfe3dd"/></linearGradient></defs>
      <rect width="800" height="500" fill="url(#g)"/>
      <path d="M0 390 190 245l120 96 125-124 365 173v110H0z" fill="#fff" opacity=".55"/>
      <circle cx="635" cy="125" r="54" fill="#fff" opacity=".65"/>
      <text x="400" y="455" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#594840">写真は公式ページで確認できます</text>
    </svg>`)}`;

  const style = document.createElement("style");
  style.textContent = `
    body{font-size:16px}.mini,.meta,.mood-note,.spot-meta,.meal-note,.meal-caution,.scenario-meta,.scenario-food p,.compare-cell small,.metric,.menu-link small{font-size:14px!important;color:#62534c!important}
    button,select,input,a.button,.tiny-btn,.nav-pill,.mood-pill,.reaction-btn{min-height:48px}.sticky a{min-height:48px;font-size:14px}.menu-button{min-height:48px}.menu-button strong{font-size:14px}
    a[target="_blank"]{text-decoration-thickness:1px;text-underline-offset:3px}a[target="_blank"]:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #2f746d!important;outline-offset:3px}
    .image-fallback{object-fit:cover;background:#eaded7}.scenario-more-wrap{display:flex;justify-content:center;margin-top:18px}.scenario-more-wrap .button{min-width:min(100%,360px)}
    @media(max-width:650px){.shell{width:min(100% - 16px,var(--max))}.section{margin-top:18px}.card-body{padding:17px}}
  `;
  document.head.appendChild(style);

  function prepareImage(image) {
    if (!image.hasAttribute("loading") && !image.closest(".hero-highlight")) image.loading = "lazy";
    image.decoding = "async";
  }

  function prepareLink(link) {
    if (link.target !== "_blank") return;
    link.rel = "noreferrer noopener";
    if (!link.textContent.includes("↗")) link.append(" ↗");
    const label = link.getAttribute("aria-label") || link.textContent.trim();
    if (!label.includes("新しいタブ")) link.setAttribute("aria-label", `${label}（新しいタブで開きます）`);
    link.title = "新しいタブで開きます";
  }

  function prepare(root) {
    if (root instanceof HTMLImageElement) prepareImage(root);
    if (root instanceof HTMLAnchorElement) prepareLink(root);
    root.querySelectorAll?.("img").forEach(prepareImage);
    root.querySelectorAll?.('a[target="_blank"]').forEach(prepareLink);
    friendlyLanguage(root);
  }

  function friendlyLanguage(root) {
    const replacements = [
      ["一般AI", "みんな向け"],
      ["一般的なAI", "みんな向け"],
      ["本質評価", "満足期待"],
      ["露出注意", "話題先行の可能性"],
      ["一般的にはこう", "定番の楽しみ方"],
      ["迷い中に入れる", "比較に追加"],
      ["迷い中から外す", "比較から外す"]
    ];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentElement?.closest("script,style")) return;
      let value = node.nodeValue;
      replacements.forEach(([from, to]) => { value = value.replaceAll(from, to); });
      if (value !== node.nodeValue) node.nodeValue = value;
    });
  }

  window.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.classList.add("image-fallback");
    image.src = placeholder;
  }, true);

  prepare(document);
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) prepare(node);
  }))).observe(document.documentElement, { childList: true, subtree: true });
})();
