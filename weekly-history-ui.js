(function () {
  "use strict";

  const data = window.WEEKLY_HISTORY_DATA;
  const anchor = document.getElementById("archive");
  if (!data || !data.weeks?.length || !anchor) return;

  const storageKey = "yamaguchi-date-weekly-history-v1";
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
    catch (_) { return {}; }
  })();
  const initialIndex = data.weeks.findIndex((week) => week.weekStart === saved.weekStart);
  const state = {
    index: initialIndex >= 0 && saved.weekStart ? initialIndex : data.weeks.length - 1,
    tab: saved.tab === "general" ? "general" : "context",
    filter: saved.filter || "all",
    sort: saved.sort || "rank",
    query: "",
    favorites: saved.favorites || {}
  };

  const style = document.createElement("style");
  style.textContent = `
    .weekly-history{scroll-margin-top:88px;position:relative;overflow:hidden}
    .weekly-history::before{content:"";position:absolute;inset:0 0 auto;height:310px;background:radial-gradient(circle at 12% 5%,rgba(255,190,174,.34),transparent 42%),radial-gradient(circle at 88% 8%,rgba(119,181,171,.25),transparent 40%);pointer-events:none}
    .weekly-shell{position:relative}
    .weekly-intro{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:18px;align-items:stretch;margin-bottom:18px}
    .weekly-title-card,.weekly-jump-card{background:rgba(255,255,255,.88);border:1px solid rgba(101,82,70,.13);border-radius:28px;padding:24px;box-shadow:0 18px 50px rgba(86,62,48,.08);backdrop-filter:blur(12px)}
    .weekly-title-card h2{font-size:clamp(1.7rem,4vw,2.55rem);line-height:1.2;margin:8px 0 10px}
    .weekly-kicker{font-size:.78rem;font-weight:800;letter-spacing:.12em;color:#a75455;text-transform:uppercase}
    .weekly-lead{font-size:1rem;line-height:1.9;color:#5e514a;max-width:720px}
    .weekly-jump-card{display:grid;gap:12px;align-content:start}
    .weekly-jump-card strong{font-size:1.05rem}
    .weekly-nav{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .weekly-button{border:1px solid rgba(93,72,61,.16);background:#fff;border-radius:999px;padding:11px 12px;color:#4e4039;font:inherit;font-weight:750;cursor:pointer;min-height:44px}
    .weekly-button:hover,.weekly-button:focus-visible{border-color:#b76061;background:#fff8f5;outline:none}
    .weekly-button.primary{background:#9e4f51;color:#fff;border-color:#9e4f51}
    .weekly-button:disabled{opacity:.38;cursor:not-allowed}
    .weekly-select-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .weekly-field{display:grid;gap:6px;font-size:.78rem;font-weight:800;color:#716159}
    .weekly-field select,.weekly-field input{width:100%;border:1px solid rgba(93,72,61,.16);border-radius:14px;background:#fff;padding:11px 12px;color:#40352f;font:inherit;min-height:44px}
    .weekly-field.week{grid-column:1/-1}
    .weekly-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end;background:linear-gradient(135deg,#8f4648,#bd756a);color:#fff;padding:22px;border-radius:26px;margin-bottom:14px;box-shadow:0 18px 42px rgba(131,66,65,.2)}
    .weekly-hero h3{font-size:clamp(1.35rem,3vw,2rem);margin:5px 0 8px}
    .weekly-hero p{line-height:1.7;opacity:.92}
    .weekly-counts{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
    .weekly-count{background:rgba(255,255,255,.17);border:1px solid rgba(255,255,255,.25);padding:8px 11px;border-radius:999px;font-size:.78rem;font-weight:800;white-space:nowrap}
    .weekly-notice{margin:0 0 14px;padding:14px 16px;border-radius:18px;background:#fff8e8;border:1px solid #eedcab;color:#68552f;font-size:.88rem;line-height:1.7}
    .weekly-toolbar{display:grid;grid-template-columns:auto minmax(180px,1fr) 160px 160px;gap:10px;align-items:center;background:#fff;border:1px solid rgba(93,72,61,.12);padding:10px;border-radius:20px;position:sticky;top:72px;z-index:8;box-shadow:0 12px 28px rgba(73,52,42,.08);margin-bottom:16px}
    .weekly-tabs{display:flex;gap:6px;background:#f4ece7;padding:5px;border-radius:999px}
    .weekly-tab{border:0;background:transparent;border-radius:999px;padding:9px 13px;font:inherit;font-size:.86rem;font-weight:800;color:#6c5b53;cursor:pointer;white-space:nowrap}
    .weekly-tab.active{background:#fff;color:#984d50;box-shadow:0 4px 12px rgba(76,52,42,.09)}
    .weekly-search,.weekly-filter,.weekly-sort{border:1px solid rgba(93,72,61,.14);border-radius:13px;background:#fff;padding:10px 12px;font:inherit;min-width:0}
    .weekly-panel-head{display:flex;align-items:end;justify-content:space-between;gap:14px;margin:24px 2px 12px}
    .weekly-panel-head h3{font-size:1.35rem;margin:0}
    .weekly-panel-head p{color:#76665e;margin:5px 0 0;font-size:.88rem}
    .weekly-result-count{font-size:.82rem;font-weight:800;color:#994d50;white-space:nowrap}
    .weekly-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .weekly-card{display:grid;grid-template-columns:190px minmax(0,1fr);background:#fff;border:1px solid rgba(93,72,61,.12);border-radius:24px;overflow:hidden;box-shadow:0 14px 34px rgba(75,53,43,.07);min-height:250px}
    .weekly-card-media{position:relative;min-height:250px;background:linear-gradient(145deg,#eadad0,#bad5ce)}
    .weekly-card-media img{width:100%;height:100%;object-fit:cover;display:block}
    .weekly-rank{position:absolute;top:12px;left:12px;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(53,39,34,.83);color:#fff;font-weight:900;backdrop-filter:blur(8px)}
    .weekly-card-body{padding:18px;display:flex;flex-direction:column;gap:10px;min-width:0}
    .weekly-card h4{font-size:1.13rem;line-height:1.45;margin:0;color:#352b27}
    .weekly-badges{display:flex;flex-wrap:wrap;gap:6px}
    .weekly-badge{display:inline-flex;align-items:center;border-radius:999px;padding:5px 8px;background:#f4ece7;color:#6b5549;font-size:.72rem;font-weight:800}
    .weekly-badge.exhibit{background:#e7f2ee;color:#366b60}
    .weekly-badge.limited{background:#fff0e4;color:#9b5536}
    .weekly-badge.context{background:#f7e7e8;color:#934b50}
    .weekly-meta{display:flex;flex-wrap:wrap;gap:7px;font-size:.8rem;color:#66564e}
    .weekly-meta span{padding:6px 8px;background:#faf7f4;border-radius:9px}
    .weekly-photo-note{font-weight:750;color:#4e4039;line-height:1.65}
    .weekly-reason{font-size:.88rem;line-height:1.75;color:#65574f}
    .weekly-details{display:grid;gap:7px;margin-top:2px}
    .weekly-detail{font-size:.8rem;line-height:1.6;padding:8px 10px;border-left:3px solid #d8a59d;background:#fffaf8;border-radius:0 10px 10px 0;color:#5e5048}
    .weekly-card-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:2px}
    .weekly-link,.weekly-favorite{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:999px;padding:8px 12px;font-size:.8rem;font-weight:850;text-decoration:none;cursor:pointer}
    .weekly-link{background:#994d50;color:#fff;border:1px solid #994d50}
    .weekly-favorite{background:#fff;border:1px solid #dbc8bf;color:#6d574e}
    .weekly-favorite.active{background:#fff0ee;border-color:#bd6968;color:#a34448}
    .weekly-empty{grid-column:1/-1;padding:40px 18px;text-align:center;border:1px dashed #cdbbb1;border-radius:20px;color:#75645b;background:rgba(255,255,255,.72)}
    .weekly-foot{margin-top:16px;color:#76665e;font-size:.8rem;line-height:1.75}
    @media(max-width:980px){.weekly-intro{grid-template-columns:1fr}.weekly-toolbar{grid-template-columns:1fr 1fr}.weekly-tabs{grid-column:1/-1}.weekly-grid{grid-template-columns:1fr}.weekly-card{grid-template-columns:170px minmax(0,1fr)}}
    @media(max-width:650px){.weekly-title-card,.weekly-jump-card{padding:18px;border-radius:22px}.weekly-nav{grid-template-columns:1fr 1fr}.weekly-hero{grid-template-columns:1fr;padding:18px}.weekly-counts{justify-content:flex-start}.weekly-toolbar{top:66px;grid-template-columns:1fr;padding:8px;border-radius:17px}.weekly-tabs{display:grid;grid-template-columns:1fr 1fr}.weekly-search,.weekly-filter,.weekly-sort{width:100%}.weekly-grid{gap:12px}.weekly-card{grid-template-columns:1fr;border-radius:20px}.weekly-card-media{min-height:210px;max-height:270px}.weekly-card-body{padding:16px}.weekly-panel-head{align-items:flex-start}.weekly-panel-head p{font-size:.82rem}}
  `;
  document.head.appendChild(style);

  anchor.insertAdjacentHTML("beforebegin", `
    <section class="section weekly-history" id="weekly-history">
      <div class="weekly-shell">
        <div class="weekly-intro">
          <div class="weekly-title-card">
            <div class="weekly-kicker">Weekly memory book</div>
            <h2>前の週、去年の今ごろを見にいく</h2>
            <p class="weekly-lead">2024年6月から今週まで、週ごとの一般AIおすすめ20件と、二人向けおすすめ20件を写真付きで振り返れます。昔の候補を見つけ直して、今度のデートへ持ち帰るページです。</p>
          </div>
          <div class="weekly-jump-card">
            <strong>見たい週へ</strong>
            <div class="weekly-select-grid">
              <label class="weekly-field">年<select id="weeklyYear"></select></label>
              <label class="weekly-field">月<select id="weeklyMonth"></select></label>
              <label class="weekly-field week">週<select id="weeklyWeek"></select></label>
            </div>
            <div class="weekly-nav">
              <button class="weekly-button" id="weeklyPrev" type="button">前の週</button>
              <button class="weekly-button" id="weeklyNext" type="button">次の週</button>
              <button class="weekly-button" id="weeklyLastYear" type="button">去年の同じ週</button>
              <button class="weekly-button primary" id="weeklyLatest" type="button">最新週</button>
            </div>
          </div>
        </div>
        <div id="weeklyHero"></div>
        <div class="weekly-notice"><strong>過去週の見方:</strong> 当時保存したレポートそのものではなく、山口県観光連盟の対象日検索と施設情報を基に、現在の条件を過去の各週へ適用した再構成版です。終了済みイベントの日時・料金・手帳条件は、リンク先の当時情報も確認してください。</div>
        <div class="weekly-toolbar">
          <div class="weekly-tabs" role="tablist" aria-label="おすすめ種別">
            <button class="weekly-tab" data-weekly-tab="general" type="button">一般AI 20件</button>
            <button class="weekly-tab" data-weekly-tab="context" type="button">二人向け 20件</button>
          </div>
          <input class="weekly-search" id="weeklySearch" type="search" placeholder="場所・イベント名で探す">
          <select class="weekly-filter" id="weeklyFilter" aria-label="候補の絞り込み">
            <option value="all">すべて表示</option>
            <option value="exhibition">展示・美術館</option>
            <option value="limited">期間限定</option>
            <option value="nearby">近場</option>
            <option value="far">遠出</option>
            <option value="favorite">気になる候補</option>
          </select>
          <select class="weekly-sort" id="weeklySort" aria-label="並び順">
            <option value="rank">当時のおすすめ順</option>
            <option value="score">本質評価が高い順</option>
            <option value="distance">近い順</option>
          </select>
        </div>
        <div id="weeklyResults"></div>
        <p class="weekly-foot">移動時間・距離は萩市アトラス付近からの概算です。一般AI枠と二人向け枠は別々の20件として保存し、二人向けは原則「萩市内・近郊10件／萩市外10件」です。</p>
      </div>
    </section>
  `);

  const section = document.getElementById("weekly-history");
  const yearSelect = document.getElementById("weeklyYear");
  const monthSelect = document.getElementById("weeklyMonth");
  const weekSelect = document.getElementById("weeklyWeek");
  const hero = document.getElementById("weeklyHero");
  const results = document.getElementById("weeklyResults");
  const search = document.getElementById("weeklySearch");
  const filter = document.getElementById("weeklyFilter");
  const sort = document.getElementById("weeklySort");

  function save() {
    const week = data.weeks[state.index];
    localStorage.setItem(storageKey, JSON.stringify({
      weekStart: week.weekStart, tab: state.tab, filter: state.filter,
      sort: state.sort, favorites: state.favorites
    }));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[char]);
  }

  function sourceLabel(item) {
    if (item.sourceType === "official-event") return "公式イベント復元";
    if (item.sourceType === "archive-fallback") return "展示アーカイブ補完";
    return "季節の定番候補";
  }

  function isExhibition(item) {
    return item.exhibition || /展示|美術|博物|絵画|彫刻|工芸|文化/.test(`${item.genre} ${item.name}`);
  }

  function numericDistance(item) {
    const found = String(item.distance || "").match(/\d+/);
    return found ? Number(found[0]) : 999;
  }

  function syncSelectors() {
    const selected = data.weeks[state.index];
    const year = selected.weekStart.slice(0, 4);
    const month = selected.weekStart.slice(5, 7);
    const years = [...new Set(data.weeks.map((week) => week.weekStart.slice(0, 4)))];
    yearSelect.innerHTML = years.map((value) => `<option value="${value}"${value === year ? " selected" : ""}>${value}年</option>`).join("");
    monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"))
      .map((value) => `<option value="${value}"${value === month ? " selected" : ""}>${Number(value)}月</option>`).join("");
    const candidates = data.weeks.map((week, index) => ({ week, index }))
      .filter(({ week }) => week.weekStart.startsWith(`${year}-${month}`));
    weekSelect.innerHTML = candidates.map(({ week, index }) => `<option value="${index}"${index === state.index ? " selected" : ""}>${esc(week.label)}</option>`).join("");
    document.getElementById("weeklyPrev").disabled = state.index === 0;
    document.getElementById("weeklyNext").disabled = state.index === data.weeks.length - 1;
  }

  function pickClosest(year, month) {
    const candidates = data.weeks.map((week, index) => ({ week, index }))
      .filter(({ week }) => week.weekStart.startsWith(`${year}-${month}`));
    if (candidates.length) state.index = candidates[0].index;
    else {
      const sameYear = data.weeks.map((week, index) => ({ week, index }))
        .filter(({ week }) => week.weekStart.startsWith(`${year}-`));
      if (sameYear.length) state.index = sameYear.at(-1).index;
    }
    render();
  }

  function filteredRows(ids, week) {
    let rows = ids.map((id, rank) => ({ item: data.catalog[id], rank: rank + 1 })).filter(({ item }) => item);
    const query = state.query.trim().toLowerCase();
    if (query) rows = rows.filter(({ item }) => `${item.name} ${item.area} ${item.genre} ${item.period}`.toLowerCase().includes(query));
    if (state.filter === "exhibition") rows = rows.filter(({ item }) => isExhibition(item));
    if (state.filter === "limited") rows = rows.filter(({ item }) => item.sourceType === "official-event");
    if (state.filter === "nearby") rows = rows.filter(({ item }) => item.nearby);
    if (state.filter === "far") rows = rows.filter(({ item }) => !item.nearby);
    if (state.filter === "favorite") rows = rows.filter(({ item }) => state.favorites[`${week.weekStart}:${item.id}`]);
    if (state.sort === "score") rows.sort((a, b) => (b.item.score || 0) - (a.item.score || 0));
    if (state.sort === "distance") rows.sort((a, b) => numericDistance(a.item) - numericDistance(b.item));
    return rows;
  }

  function card(row, week) {
    const item = row.item;
    const favoriteKey = `${week.weekStart}:${item.id}`;
    const favorite = Boolean(state.favorites[favoriteKey]);
    const context = state.tab === "context";
    return `
      <article class="weekly-card">
        <div class="weekly-card-media">
          <img src="${esc(item.image)}" alt="${esc(item.name)}の写真" loading="lazy">
          <span class="weekly-rank">${row.rank}</span>
        </div>
        <div class="weekly-card-body">
          <div class="weekly-badges">
            <span class="weekly-badge ${isExhibition(item) ? "exhibit" : ""}">${esc(item.genre)}</span>
            ${item.sourceType === "official-event" ? '<span class="weekly-badge limited">その週の期間限定</span>' : ""}
            ${context ? `<span class="weekly-badge context">${item.nearby ? "萩市内・近郊" : "萩市外"}</span>` : ""}
          </div>
          <h4>${esc(item.name)}</h4>
          <div class="weekly-meta">
            <span>${esc(item.area)}</span><span>${esc(item.travel)}</span><span>${esc(item.distance)}</span><span>${esc(item.stay)}</span>
          </div>
          <div class="weekly-photo-note">写真で見る魅力: ${esc(item.photo)}</div>
          <div class="weekly-reason">${esc(item.reason)}</div>
          <div class="weekly-details">
            <div class="weekly-detail"><strong>時期:</strong> ${esc(item.period)}</div>
            <div class="weekly-detail"><strong>近くで食べるなら:</strong> ${esc(item.food || "開催地周辺で営業日を確認")}</div>
            ${context ? `<div class="weekly-detail"><strong>手帳・過ごしやすさ:</strong> ${esc(item.discount || "施設ごとに確認")} ${esc(item.access || "休憩場所と混雑を確認")}</div>` : ""}
            <div class="weekly-detail"><strong>振り返り注意:</strong> ${esc(item.caution)}</div>
          </div>
          <div class="weekly-meta"><span>本質評価 ${esc(item.score)}/100</span><span>露出注意 ${esc(item.bias)}</span><span>${esc(sourceLabel(item))}</span></div>
          <div class="weekly-card-actions">
            <a class="weekly-link" href="${esc(item.url)}" target="_blank" rel="noreferrer">写真・公式情報を見る</a>
            <button class="weekly-favorite ${favorite ? "active" : ""}" type="button" data-weekly-favorite="${esc(favoriteKey)}">${favorite ? "気になるに保存済み" : "気になる"}</button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const week = data.weeks[state.index];
    syncSelectors();
    document.querySelectorAll("[data-weekly-tab]").forEach((button) => button.classList.toggle("active", button.dataset.weeklyTab === state.tab));
    filter.value = state.filter;
    sort.value = state.sort;
    const ids = week[state.tab];
    const rows = filteredRows(ids, week);
    const typeTitle = state.tab === "general" ? "一般的なAIおすすめ 20件" : "二人の文脈に基づくおすすめ 20件";
    const typeNote = state.tab === "general"
      ? "県全体の魅力・季節性・イベント性を中心にした一般向けの並びです。"
      : "絵画好き、期間限定優先、手帳条件、無理の少なさを反映した並びです。";
    hero.innerHTML = `<div class="weekly-hero"><div><div class="weekly-kicker">${esc(week.label)}</div><h3>${esc(week.theme)}</h3><p>${esc(week.reconstruction)}</p></div><div class="weekly-counts"><span class="weekly-count">一般 20件</span><span class="weekly-count">二人向け 20件</span><span class="weekly-count">近場 ${week.localCount} / 遠出 ${week.farCount}</span><span class="weekly-count">展示 ${week.exhibitionCount}件</span><span class="weekly-count">公式イベント ${week.officialEventCount}件</span></div></div>`;
    results.innerHTML = `<div class="weekly-panel-head"><div><h3>${typeTitle}</h3><p>${typeNote}</p></div><div class="weekly-result-count">${rows.length}件を表示</div></div><div class="weekly-grid">${rows.length ? rows.map((row) => card(row, week)).join("") : '<div class="weekly-empty">この条件に合う候補はありません。絞り込みを戻してみてください。</div>'}</div>`;
    save();
  }

  yearSelect.addEventListener("change", () => pickClosest(yearSelect.value, monthSelect.value));
  monthSelect.addEventListener("change", () => pickClosest(yearSelect.value, monthSelect.value));
  weekSelect.addEventListener("change", () => { state.index = Number(weekSelect.value); render(); });
  document.getElementById("weeklyPrev").addEventListener("click", () => { if (state.index > 0) { state.index -= 1; render(); } });
  document.getElementById("weeklyNext").addEventListener("click", () => { if (state.index < data.weeks.length - 1) { state.index += 1; render(); } });
  document.getElementById("weeklyLatest").addEventListener("click", () => { state.index = data.weeks.length - 1; render(); });
  document.getElementById("weeklyLastYear").addEventListener("click", () => {
    const target = state.index - 52;
    if (target >= 0) { state.index = target; render(); }
    else { section.querySelector(".weekly-notice").scrollIntoView({ behavior: "smooth", block: "center" }); }
  });
  document.querySelectorAll("[data-weekly-tab]").forEach((button) => button.addEventListener("click", () => { state.tab = button.dataset.weeklyTab; render(); }));
  search.addEventListener("input", () => { state.query = search.value; render(); });
  filter.addEventListener("change", () => { state.filter = filter.value; render(); });
  sort.addEventListener("change", () => { state.sort = sort.value; render(); });
  results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-weekly-favorite]");
    if (!button) return;
    const key = button.dataset.weeklyFavorite;
    if (state.favorites[key]) delete state.favorites[key];
    else state.favorites[key] = true;
    render();
  });

  const menu = document.querySelector(".menu-list");
  if (menu && !menu.querySelector('[href="#weekly-history"]')) {
    const link = document.createElement("a");
    link.className = "menu-link";
    link.href = "#weekly-history";
    link.innerHTML = "<span>2年間の週間おすすめ</span><small>週別</small>";
    link.addEventListener("click", () => {
      document.getElementById("menuPanel")?.classList.remove("open");
      document.getElementById("menuButton")?.setAttribute("aria-expanded", "false");
    });
    menu.appendChild(link);
  }

  render();
})();
