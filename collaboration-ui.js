(function () {
  "use strict";

  const weeklyData = window.WEEKLY_HISTORY_DATA;
  const section = document.getElementById("weekly-history");
  const results = document.getElementById("weeklyResults");
  if (!weeklyData || !section || !results) return;

  const storageKey = "yamaguchi-date-shared-choices-v2";
  const labels = { me: "自分", partner: "相手" };
  const reactionLabels = { like: "行きたい", hold: "気になる", pass: "今回は見送り", "": "未回答" };

  function emptyState() {
    return { activePerson: "me", reactions: {}, compare: [], candidates: {}, final: null, updatedAt: "" };
  }

  function loadState() {
    try { return { ...emptyState(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; }
    catch (_) { return emptyState(); }
  }

  let state = loadState();

  function saveState() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[char]);
  }

  function encodeShare(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodeShare(value) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized + "===".slice((normalized.length + 3) % 4));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function mergeImported(incoming) {
    if (!incoming || typeof incoming !== "object") return false;
    const mergedReactions = { ...state.reactions };
    Object.entries(incoming.reactions || {}).forEach(([key, value]) => {
      mergedReactions[key] = { ...(mergedReactions[key] || {}), ...(value || {}) };
    });
    state = {
      ...state,
      reactions: mergedReactions,
      candidates: { ...state.candidates, ...(incoming.candidates || {}) },
      compare: [...new Set([...(state.compare || []), ...(incoming.compare || [])])].slice(0, 4),
      final: incoming.final || state.final
    };
    saveState();
    return true;
  }

  function importFromUrl() {
    const url = new URL(location.href);
    const encoded = url.searchParams.get("choices");
    if (!encoded) return false;
    try {
      const imported = mergeImported(decodeShare(encoded));
      url.searchParams.delete("choices");
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash || "#weekly-history"}`);
      return imported;
    } catch (_) {
      return false;
    }
  }

  const imported = importFromUrl();
  const style = document.createElement("style");
  style.textContent = `
    .collab-panel,.collab-compare,.collab-final{background:#fff;border:1px solid rgba(93,72,61,.14);border-radius:24px;padding:18px;box-shadow:0 14px 34px rgba(75,53,43,.07);margin:0 0 16px}
    .collab-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .collab-head h3{margin:0;font-size:1.22rem}.collab-head p{margin:4px 0 0;color:#66564e;font-size:.92rem}
    .person-switch,.collab-actions,.collab-reactions{display:flex;gap:8px;flex-wrap:wrap}
    .collab-button{min-height:48px;border:1px solid #cdbbb1;border-radius:14px;background:#fff;color:#4e4039;padding:9px 14px;font:inherit;font-weight:800;cursor:pointer}
    .collab-button.active,.collab-button.primary{background:#994d50;border-color:#994d50;color:#fff}
    .collab-button.like.active{background:#3f766b;border-color:#3f766b}.collab-button.pass.active{background:#6d625d;border-color:#6d625d}
    .collab-summary{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.collab-pill{display:inline-flex;align-items:center;min-height:32px;border-radius:999px;background:#f5eeea;padding:5px 10px;font-size:.84rem;font-weight:750;color:#594840}
    .collab-notice{margin-top:12px;padding:12px 14px;border-radius:14px;background:#fff7df;color:#654f28;line-height:1.6;font-size:.9rem}
    .collab-controls{border-top:1px solid rgba(93,72,61,.11);padding-top:12px;display:grid;gap:10px}
    .collab-person-note{font-size:.88rem;font-weight:800;color:#594840}.collab-status{font-size:.86rem;color:#66564e;line-height:1.6}
    .weekly-favorite{display:none!important}.collab-reactions .collab-button{flex:1 1 108px}
    .collab-compare-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
    .collab-choice{border:1px solid rgba(93,72,61,.13);border-radius:18px;padding:14px;background:#fffaf7;display:grid;gap:8px}
    .collab-choice h4{margin:0;font-size:1.02rem}.collab-choice p{margin:0;color:#66564e;font-size:.88rem;line-height:1.6}
    .decision-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.decision-fact{padding:9px 10px;border-radius:12px;background:#fff;border:1px solid rgba(93,72,61,.1);font-size:.82rem;color:#594840}
    .collab-final{background:linear-gradient(135deg,#fff5f1,#eef8f4)}.collab-final strong{font-size:1.12rem}.collab-final p{color:#5f514a;line-height:1.7}
    .collab-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:100;max-width:calc(100% - 32px);padding:12px 16px;border-radius:999px;background:#352b27;color:#fff;font-weight:800;box-shadow:0 16px 40px rgba(0,0,0,.2)}
    @media(max-width:650px){.collab-panel,.collab-compare,.collab-final{padding:15px;border-radius:20px}.collab-compare-grid,.decision-facts{grid-template-columns:1fr}.person-switch{display:grid;grid-template-columns:1fr 1fr;width:100%}.collab-actions{display:grid;grid-template-columns:1fr;width:100%}}
  `;
  document.head.appendChild(style);

  section.insertAdjacentHTML("afterbegin", `
    <div class="collab-panel" id="collabPanel">
      <div class="collab-head">
        <div><h3>ふたりで選ぶ</h3><p>押す人を切り替えると、反応を上書きせず別々に残せます。</p></div>
        <div class="person-switch" aria-label="回答する人">
          <button class="collab-button" type="button" data-person="me">自分が回答</button>
          <button class="collab-button" type="button" data-person="partner">相手が回答</button>
        </div>
      </div>
      <div class="collab-summary" id="collabSummary"></div>
      <div class="collab-actions" style="margin-top:12px">
        <button class="collab-button primary" type="button" id="collabShare">選択内容を共有</button>
        <a class="collab-button" href="#shared-compare">比較を見る</a>
      </div>
      <div class="collab-notice">共有は送信時点の選択内容をURLに含めます。相手のスマホで回答後、もう一度共有してもらうと内容を統合できます。</div>
      ${imported ? '<div class="collab-notice"><strong>共有された選択内容を読み込みました。</strong></div>' : ""}
    </div>
  `);

  results.insertAdjacentHTML("afterend", '<div id="shared-compare"></div><div id="shared-final"></div>');
  const compareRoot = document.getElementById("shared-compare");
  const finalRoot = document.getElementById("shared-final");

  function notify(message) {
    document.querySelector(".collab-toast")?.remove();
    const node = document.createElement("div");
    node.className = "collab-toast";
    node.setAttribute("role", "status");
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2800);
  }

  function candidateKey(card) {
    return `${card.dataset.weeklyWeek}:${card.dataset.weeklyId}`;
  }

  function agreementText(reactions) {
    const me = reactions?.me || "";
    const partner = reactions?.partner || "";
    if (me === "like" && partner === "like") return "二人とも行きたい";
    if (!me || !partner) return "もう一人の回答待ち";
    if (me === "pass" && partner === "pass") return "今回は見送りで一致";
    if (me === partner) return `二人とも「${reactionLabels[me]}」`;
    return "意見が分かれています。比較して相談";
  }

  function snapshot(card) {
    const key = candidateKey(card);
    const existing = state.candidates[key] || {};
    state.candidates[key] = {
      ...existing,
      key,
      id: card.dataset.weeklyId,
      week: card.dataset.weeklyWeek,
      name: card.dataset.weeklyName,
      area: card.dataset.weeklyArea,
      travel: card.dataset.weeklyTravel,
      distance: card.dataset.weeklyDistance,
      url: card.dataset.weeklyUrl,
      image: card.querySelector("img")?.src || existing.image || "",
      facts: card.dataset.weeklyFacts ? JSON.parse(card.dataset.weeklyFacts) : existing.facts || {}
    };
    return state.candidates[key];
  }

  function renderSummary() {
    document.querySelectorAll("[data-person]").forEach((button) => button.classList.toggle("active", button.dataset.person === state.activePerson));
    const values = Object.values(state.reactions);
    const myLikes = values.filter((value) => value.me === "like").length;
    const partnerLikes = values.filter((value) => value.partner === "like").length;
    const matches = values.filter((value) => value.me === "like" && value.partner === "like").length;
    document.getElementById("collabSummary").innerHTML = `<span class="collab-pill">自分の行きたい ${myLikes}件</span><span class="collab-pill">相手の行きたい ${partnerLikes}件</span><span class="collab-pill">二人で一致 ${matches}件</span><span class="collab-pill">比較 ${state.compare.length}/4件</span>`;
  }

  function decisionFacts(candidate) {
    const facts = candidate.facts || {};
    return `<div class="decision-facts">
      <div class="decision-fact"><strong>営業時間</strong><br>${esc(facts.hours || "公式ページで当日確認")}</div>
      <div class="decision-fact"><strong>料金・手帳</strong><br>${esc(facts.fee || "公式ページで確認")}</div>
      <div class="decision-fact"><strong>予約・駐車場</strong><br>${esc(facts.booking || "予約要否・駐車場を公式確認")}</div>
      <div class="decision-fact"><strong>混雑・歩行量</strong><br>${esc(facts.load || "週末の混雑と歩行量を確認")}</div>
    </div>`;
  }

  function renderCompare() {
    const candidates = state.compare.map((key) => state.candidates[key]).filter(Boolean);
    compareRoot.innerHTML = `<section class="collab-compare"><div class="collab-head"><div><h3>比較する候補 ${candidates.length}/4</h3><p>4件を超える場合は、先に1件外してください。候補を無断で入れ替えません。</p></div></div>${candidates.length ? `<div class="collab-compare-grid">${candidates.map((candidate) => {
      const reactions = state.reactions[candidate.key] || {};
      return `<article class="collab-choice"><h4>${esc(candidate.name)}</h4><p>${esc(candidate.area)}｜${esc(candidate.travel)}｜${esc(candidate.distance)}</p><p><strong>自分:</strong> ${reactionLabels[reactions.me || ""]}　<strong>相手:</strong> ${reactionLabels[reactions.partner || ""]}</p><p>${agreementText(reactions)}</p>${decisionFacts(candidate)}<div class="collab-actions"><a class="collab-button" href="${esc(candidate.url)}" target="_blank" rel="noreferrer">公式情報 ↗</a><button class="collab-button" type="button" data-remove-compare="${esc(candidate.key)}">比較から外す</button><button class="collab-button primary" type="button" data-make-final="${esc(candidate.key)}">この候補に決める</button></div></article>`;
    }).join("")}</div>` : '<p class="collab-status">カードの「比較に追加」を押すと、ここに並びます。</p>'}</section>`;
  }

  function renderFinal() {
    const candidate = state.final ? state.candidates[state.final] : null;
    finalRoot.innerHTML = candidate ? `<section class="collab-final" id="confirmed-plan"><div class="collab-head"><div><span class="collab-pill">いまの第一候補</span><h3>${esc(candidate.name)}</h3></div><button class="collab-button" type="button" id="clearFinal">決定を戻す</button></div><p>${esc(candidate.area)}｜${esc(candidate.travel)}｜${esc(candidate.distance)}</p>${decisionFacts(candidate)}<div class="collab-actions" style="margin-top:12px"><a class="collab-button primary" href="${esc(candidate.url)}" target="_blank" rel="noreferrer">最終確認をする ↗</a><button class="collab-button" type="button" id="shareFinal">この決定を共有</button></div></section>` : "";
  }

  function renderAll() {
    renderSummary();
    decorateCards();
    renderCompare();
    renderFinal();
  }

  function decorateCards() {
    results.querySelectorAll(".weekly-card[data-weekly-id]").forEach((card) => {
      const key = candidateKey(card);
      const reactions = state.reactions[key] || {};
      let controls = card.querySelector(".collab-controls");
      if (!controls) {
        controls = document.createElement("div");
        controls.className = "collab-controls";
        card.querySelector(".weekly-card-actions")?.insertAdjacentElement("afterend", controls);
      }
      const current = reactions[state.activePerson] || "";
      const inCompare = state.compare.includes(key);
      const signature = `${state.activePerson}:${reactions.me || ""}:${reactions.partner || ""}:${inCompare}`;
      if (controls.dataset.signature === signature) return;
      controls.dataset.signature = signature;
      controls.innerHTML = `<div class="collab-person-note">${labels[state.activePerson]}の気持ちを選ぶ</div><div class="collab-reactions">
        <button class="collab-button like ${current === "like" ? "active" : ""}" type="button" data-reaction="like">行きたい</button>
        <button class="collab-button ${current === "hold" ? "active" : ""}" type="button" data-reaction="hold">気になる</button>
        <button class="collab-button pass ${current === "pass" ? "active" : ""}" type="button" data-reaction="pass">今回は見送り</button>
      </div><div class="collab-status"><strong>自分:</strong> ${reactionLabels[reactions.me || ""]}　<strong>相手:</strong> ${reactionLabels[reactions.partner || ""]}<br>${agreementText(reactions)}</div><button class="collab-button ${inCompare ? "active" : ""}" type="button" data-toggle-compare>${inCompare ? "比較に追加済み" : "比較に追加"}</button>`;
    });
  }

  async function shareChoices() {
    const url = new URL(location.href);
    url.searchParams.set("choices", encodeShare({ reactions: state.reactions, compare: state.compare, candidates: state.candidates, final: state.final }));
    url.hash = "weekly-history";
    const shareData = { title: "ふたりのデート候補", text: "行きたい候補と比較内容を共有します。", url: url.toString() };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); notify("共有URLをコピーしました"); }
    } catch (error) {
      if (error?.name !== "AbortError") notify("共有できませんでした。もう一度お試しください");
    }
  }

  document.getElementById("collabPanel").addEventListener("click", (event) => {
    const person = event.target.closest("[data-person]");
    if (person) { state.activePerson = person.dataset.person; saveState(); renderAll(); }
  });
  document.getElementById("collabShare").addEventListener("click", shareChoices);

  results.addEventListener("click", (event) => {
    const card = event.target.closest(".weekly-card[data-weekly-id]");
    if (!card) return;
    const key = candidateKey(card);
    const reactionButton = event.target.closest("[data-reaction]");
    if (reactionButton) {
      snapshot(card);
      state.reactions[key] = { ...(state.reactions[key] || {}), [state.activePerson]: reactionButton.dataset.reaction };
      saveState();
      renderAll();
      return;
    }
    if (event.target.closest("[data-toggle-compare]")) {
      snapshot(card);
      if (state.compare.includes(key)) state.compare = state.compare.filter((value) => value !== key);
      else if (state.compare.length >= 4) { notify("比較は4件までです。先に1件外してください"); return; }
      else state.compare.push(key);
      saveState();
      renderAll();
    }
  });

  compareRoot.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-compare]");
    if (remove) { state.compare = state.compare.filter((key) => key !== remove.dataset.removeCompare); saveState(); renderAll(); return; }
    const final = event.target.closest("[data-make-final]");
    if (final) { state.final = final.dataset.makeFinal; saveState(); renderAll(); document.getElementById("confirmed-plan")?.scrollIntoView({ behavior: "smooth" }); }
  });

  finalRoot.addEventListener("click", (event) => {
    if (event.target.closest("#clearFinal")) { state.final = null; saveState(); renderAll(); }
    if (event.target.closest("#shareFinal")) shareChoices();
  });

  const observer = new MutationObserver(() => decorateCards());
  observer.observe(results, { childList: true, subtree: true });
  const stickyCompare = document.querySelector('.sticky a[href="#compare"]');
  if (stickyCompare) stickyCompare.href = "#shared-compare";
  const menu = document.querySelector(".menu-list");
  if (menu && !menu.querySelector('[href="#shared-compare"]')) {
    menu.insertAdjacentHTML("beforeend", '<a class="menu-link" href="#shared-compare"><span>ふたりの比較・決定</span><small>最大4件</small></a>');
  }
  renderAll();
})();
