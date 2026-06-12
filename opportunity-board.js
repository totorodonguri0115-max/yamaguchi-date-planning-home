(function () {
  "use strict";

  const api = window.WEEKLY_HISTORY_UI;
  const taxonomy = window.DATE_PLANNING_TAXONOMY;
  const top = document.getElementById("top");
  const toolbar = document.querySelector(".weekly-toolbar");
  if (!api || !taxonomy || !top || !toolbar) return;

  const facetConfig = [
    ["season", "季節", taxonomy.values.season],
    ["weather", "天気", taxonomy.values.weather],
    ["time", "時間帯", taxonomy.values.time],
    ["duration", "長さ", taxonomy.values.duration],
    ["indoorOutdoor", "屋内外", taxonomy.values.indoorOutdoor],
    ["budget", "予算", taxonomy.values.budget],
    ["quick", "過ごし方", ["近場", "遠出", "雨の日", "食事", "会話重視", "新体験", "負担軽め"]]
  ];

  facetConfig.forEach(([group]) => {
    if (!Array.isArray(api.state.facets[group])) api.state.facets[group] = [];
  });

  const style = document.createElement("style");
  style.textContent = `
    .opportunity-board{scroll-margin-top:82px;position:relative;margin-top:22px;padding:22px;border:1px solid rgba(98,74,65,.13);border-radius:30px;background:linear-gradient(145deg,#fff8f1,#f2faf7);box-shadow:0 18px 46px rgba(86,62,48,.09);overflow:hidden}
    .hero-preview-details{margin-top:16px;border:1px solid rgba(98,74,65,.13);border-radius:18px;background:rgba(255,255,255,.72);overflow:hidden}.hero-preview-details>summary{min-height:48px;display:flex;align-items:center;padding:10px 14px;cursor:pointer;font-weight:850;color:#70494a}.hero-preview-details[open]>summary{border-bottom:1px solid rgba(98,74,65,.11)}.hero-preview-details .hero-primary{margin:0;padding:14px}
    .opportunity-board::before{content:"";position:absolute;width:280px;height:280px;border-radius:50%;right:-120px;top:-150px;background:rgba(197,111,115,.13);pointer-events:none}
    .opportunity-heading{position:relative;display:flex;justify-content:space-between;align-items:end;gap:14px;margin-bottom:16px}.opportunity-heading h2{font-size:clamp(1.65rem,4vw,2.5rem);line-height:1.2}.opportunity-heading p{margin-top:7px;color:#5f514a;line-height:1.75;max-width:760px}.opportunity-scroll{display:flex;gap:7px}.opportunity-scroll button{width:46px;height:46px;border-radius:50%;border:1px solid #d5c2b8;background:#fff;color:#624c43;font:inherit;font-size:1.2rem;font-weight:900;cursor:pointer}
    .opportunity-grid{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(270px,300px);gap:13px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 10px;scrollbar-width:thin;scrollbar-color:#d4b9ae transparent}
    .opportunity-card{display:flex;flex-direction:column;min-width:0;border:1px solid rgba(98,74,65,.13);border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 10px 26px rgba(75,53,43,.07);scroll-snap-align:start}
    .opportunity-photo{position:relative;aspect-ratio:16/9;background:#eaded7;overflow:hidden}.opportunity-photo img{height:100%;object-fit:cover}.opportunity-label{position:absolute;left:10px;top:10px;padding:6px 9px;border-radius:999px;background:rgba(52,41,36,.82);color:#fff;font-size:.78rem;font-weight:850;backdrop-filter:blur(7px)}
    .opportunity-body{padding:14px;display:flex;flex-direction:column;gap:9px;flex:1}.opportunity-body h3{font-size:1.05rem;line-height:1.45}.opportunity-meta,.planning-chip-row{display:flex;flex-wrap:wrap;gap:6px}.planning-chip{display:inline-flex;align-items:center;min-height:30px;padding:5px 9px;border-radius:999px;background:#f6efea;color:#5e4d44;border:1px solid rgba(98,74,65,.09);font-size:.79rem;font-weight:750}
    .opportunity-more{border-top:1px solid rgba(98,74,65,.1);padding-top:7px}.opportunity-more>summary{min-height:40px;display:flex;align-items:center;cursor:pointer;color:#744d48;font-size:.84rem;font-weight:850}.opportunity-outfit,.opportunity-invite{font-size:.87rem;line-height:1.65;color:#5c4e47}.opportunity-invite{margin-top:8px;padding:10px 11px;border-radius:13px;background:#fff5f2;color:#70494a}.opportunity-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto}.opportunity-actions a,.opportunity-actions button{display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:13px;padding:8px 10px;font:inherit;font-size:.84rem;font-weight:850;text-align:center;cursor:pointer}.opportunity-actions a{background:#994d50;color:#fff}.opportunity-actions button{border:1px solid #ccb9af;background:#fff;color:#574840}
    .condition-panel{scroll-margin-top:90px;margin-bottom:14px;padding:16px;border:1px solid rgba(93,72,61,.13);border-radius:22px;background:rgba(255,255,255,.94);box-shadow:0 12px 28px rgba(73,52,42,.07)}
    .condition-head{display:flex;align-items:end;justify-content:space-between;gap:12px;flex-wrap:wrap}.condition-head h3{margin:0;font-size:1.2rem}.condition-head p{margin:4px 0 0;color:#62534c;font-size:.9rem}.condition-reset{min-height:44px;border:1px solid #cdbbb1;border-radius:999px;background:#fff;padding:8px 13px;font:inherit;font-weight:800;color:#594840;cursor:pointer}
    .condition-search{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:13px}.condition-search input{width:100%;min-height:50px;border:2px solid #ddcbc1;border-radius:15px;padding:10px 14px;font:inherit;font-size:1rem;background:#fff}.condition-search button{min-width:50px;border:1px solid #d2c0b7;border-radius:15px;background:#fff;font:inherit;font-weight:900;cursor:pointer}
    .search-suggestions{display:flex;gap:7px;overflow:auto;padding:9px 0 3px;scrollbar-width:none}.search-suggestions::-webkit-scrollbar{display:none}.search-suggestion{white-space:nowrap;min-height:44px;border:1px solid #ddcbc1;border-radius:999px;background:#fff8f4;padding:7px 12px;color:#744d48;font:inherit;font-size:.86rem;font-weight:800;cursor:pointer}
    .facet-groups{display:grid;gap:10px;margin-top:13px}.facet-group{display:grid;grid-template-columns:78px minmax(0,1fr);gap:9px;align-items:start}.facet-label{padding-top:8px;font-size:.87rem;font-weight:900;color:#594840}.facet-buttons{display:flex;gap:7px;flex-wrap:wrap}.facet-button{min-height:44px;border:1px solid #dac9c0;border-radius:999px;background:#fff;padding:7px 12px;color:#5d4d45;font:inherit;font-size:.86rem;font-weight:800;cursor:pointer}.facet-button.active{background:#4f7d75;border-color:#4f7d75;color:#fff}.condition-more{margin-top:12px;border-top:1px solid rgba(93,72,61,.12);padding-top:10px}.condition-more>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:#744d48;font-weight:850}.selected-conditions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px;min-height:30px}.selected-condition{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:#edf6f3;color:#3f6d64;font-size:.82rem;font-weight:800}
    .weekly-search{display:none!important}.weekly-toolbar{grid-template-columns:auto minmax(150px,1fr) minmax(180px,220px)!important}.planning-summary{display:grid;gap:8px;padding:11px;border-radius:15px;background:#fbf7f4;border:1px solid rgba(93,72,61,.1)}.planning-summary strong{font-size:.9rem}.planning-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.planning-detail{padding:8px 9px;border-radius:11px;background:#fff;border:1px solid rgba(93,72,61,.1);font-size:.82rem;line-height:1.55;color:#554840}.planning-invite{padding:11px;border-radius:14px;background:#f4faf7;border:1px solid #d8e8e2;color:#45645d;font-size:.88rem;line-height:1.6}.planning-copy{min-height:44px;border:1px solid #b9d2ca;border-radius:999px;background:#fff;color:#45645d;padding:8px 13px;font:inherit;font-size:.84rem;font-weight:850;cursor:pointer}
    @media(max-width:900px){.weekly-toolbar{grid-template-columns:1fr 1fr!important}.weekly-tabs{grid-column:1/-1}}
    @media(max-width:650px){.opportunity-board{padding:18px 14px;border-radius:24px}.opportunity-heading{align-items:start}.opportunity-scroll{display:none}.opportunity-grid{grid-auto-columns:min(86vw,330px);scrollbar-width:none}.opportunity-grid::-webkit-scrollbar{display:none}.condition-panel{padding:14px}.facet-group{grid-template-columns:1fr}.facet-label{padding-top:0}.facet-buttons{flex-wrap:nowrap;overflow-x:auto;padding-bottom:3px;scrollbar-width:none}.facet-button{white-space:nowrap}.weekly-toolbar{grid-template-columns:1fr!important}.planning-detail-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const board = document.createElement("section");
  board.className = "opportunity-board";
  board.id = "opportunity-board";
  board.innerHTML = `<div class="opportunity-heading"><div><span class="section-kicker">場所より先に、今日の条件</span><h2>今日のデート機会ボード</h2><p>季節・天気・時間帯・体力・服装・予算から、今週末に合う過ごし方を先に選びます。写真レールは横に送れます。</p></div><div class="opportunity-scroll" aria-label="機会ボードを送る"><button type="button" data-board-scroll="-1" aria-label="前の候補へ">←</button><button type="button" data-board-scroll="1" aria-label="次の候補へ">→</button></div></div><div class="opportunity-grid" id="opportunityGrid"></div>`;
  top.insertAdjacentElement("afterend", board);

  const heroPrimary = document.getElementById("heroPrimary");
  if (heroPrimary && !heroPrimary.closest(".hero-preview-details")) {
    const details = document.createElement("details");
    details.className = "hero-preview-details";
    details.innerHTML = "<summary>写真から先に見たいときは、今日の候補を開く</summary>";
    heroPrimary.insertAdjacentElement("beforebegin", details);
    details.appendChild(heroPrimary);
  }
  const navStrip = top.querySelector(".nav-strip");
  if (navStrip && !navStrip.querySelector('[href="#opportunity-board"]')) {
    navStrip.insertAdjacentHTML("afterbegin", '<a class="nav-pill" href="#opportunity-board">条件から選ぶ</a>');
  }

  const conditionPanel = document.createElement("section");
  conditionPanel.className = "condition-panel";
  conditionPanel.id = "condition-filters";
  conditionPanel.innerHTML = `
    <div class="condition-head"><div><h3>条件を押して候補を絞る</h3><p>同じ行はどれか1つ、違う行はすべて満たす候補を表示します。</p></div><button class="condition-reset" id="conditionReset" type="button">条件をすべて解除</button></div>
    <div class="condition-search"><input id="conditionSearch" type="search" placeholder="場所・季節・雨・夜・展示・食事などで検索" aria-label="候補をキーワード検索"><button id="conditionSearchClear" type="button" aria-label="検索を消す">×</button></div>
    <div class="search-suggestions" aria-label="検索候補">
      <button class="search-suggestion" type="button" data-suggestion-group="weather" data-suggestion-value="雨">雨でも</button>
      <button class="search-suggestion" type="button" data-suggestion-group="time" data-suggestion-value="夕方から">夕方から</button>
      <button class="search-suggestion" type="button" data-suggestion-group="duration" data-suggestion-value="ショート">短時間</button>
      <button class="search-suggestion" type="button" data-suggestion-filter="limited">期間限定</button>
      <button class="search-suggestion" type="button" data-suggestion-filter="exhibition">展示・美術館</button>
      <button class="search-suggestion" type="button" data-suggestion-group="quick" data-suggestion-value="近場">近場</button>
      <button class="search-suggestion" type="button" data-suggestion-group="quick" data-suggestion-value="新体験">新しい体験</button>
    </div>
    <div class="facet-groups">${facetConfig.slice(0, 3).map(([group, label, options]) => `<div class="facet-group" id="facet-${group}"><div class="facet-label">${label}</div><div class="facet-buttons">${options.map((value) => `<button class="facet-button" type="button" aria-pressed="false" data-facet-group="${group}" data-facet-value="${value}">${value}</button>`).join("")}</div></div>`).join("")}</div>
    <details class="condition-more"><summary>長さ・屋内外・予算・過ごし方も選ぶ</summary><div class="facet-groups">${facetConfig.slice(3).map(([group, label, options]) => `<div class="facet-group" id="facet-${group}"><div class="facet-label">${label}</div><div class="facet-buttons">${options.map((value) => `<button class="facet-button" type="button" aria-pressed="false" data-facet-group="${group}" data-facet-value="${value}">${value}</button>`).join("")}</div></div>`).join("")}</div></details>
    <div class="selected-conditions" id="selectedConditions" aria-live="polite"></div>`;
  toolbar.insertAdjacentElement("beforebegin", conditionPanel);

  const originalSearch = document.getElementById("weeklySearch");
  const search = document.getElementById("conditionSearch");
  const filter = document.getElementById("weeklyFilter");
  const sort = document.getElementById("weeklySort");
  search.value = originalSearch.value;

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
  }

  function currentItems() {
    const week = api.data.weeks[api.state.index];
    return (week?.context || []).map((id, rank) => ({ item: api.data.catalog[id], rank: rank + 1 })).filter((row) => row.item);
  }

  function weight(value) { return ({ 高: 3, 中: 2, 低: 1 }[value] || 0); }

  const opportunities = [
    { id: "main", label: "今日の本命", score: (m, row) => 180 - row.rank * 4 + weight(m.missRisk) * 5, facets: {} },
    { id: "miss", label: "今逃すと惜しい期間限定", score: (m) => weight(m.missRisk) * 40, facets: { miss: "高" } },
    { id: "sunny", label: "晴れの日向け", score: (m) => m.weatherFit.includes("晴れ") ? 100 : 0, facets: { weather: "晴れ" } },
    { id: "cloudy", label: "曇りの日向け", score: (m) => m.weatherFit.includes("曇り") ? 100 : 0, facets: { weather: "曇り" } },
    { id: "rain", label: "雨の日向け", score: (m) => m.weatherFit.includes("雨") ? 110 : 0, facets: { weather: "雨" } },
    { id: "morning", label: "午前だけ", score: (m) => m.timeSlots.includes("午前だけ") ? 100 : 0, facets: { time: "午前だけ" } },
    { id: "evening", label: "夕方から", score: (m) => m.timeSlots.includes("夕方から") ? 100 : 0, facets: { time: "夕方から" } },
    { id: "night", label: "夜・星空・夜景だけ", score: (m) => m.timeSlots.includes("夜だけ") ? 110 : 0, facets: { time: "夜だけ" } },
    { id: "short", label: "ショートデート", score: (m) => m.durationType === "ショート" ? 100 : 0, facets: { duration: "ショート" } },
    { id: "long", label: "ロングデート", score: (m) => m.durationType === "ロング" ? 100 : 0, facets: { duration: "ロング" } },
    { id: "split", label: "午前外出＋午後は家でゆっくり", score: (m) => m.durationType === "ショート" && m.quickTags.includes("近場") ? 120 : 0, facets: { duration: "ショート", quick: "近場" } },
    { id: "novelty", label: "マンネリ回避", score: (m) => weight(m.mannerismAvoidance) * 40, facets: { quick: "新体験" } }
  ];

  function chooseOpportunity(rows, opportunity, used) {
    const ranked = rows.map((row) => ({ ...row, meta: taxonomy.infer(row.item) }))
      .sort((a, b) => opportunity.score(b.meta, b) - opportunity.score(a.meta, a) || a.rank - b.rank);
    return ranked.find((row) => opportunity.score(row.meta, row) > 0 && !used.has(row.item.id))
      || ranked.find((row) => opportunity.score(row.meta, row) > 0);
  }

  function opportunityCard(opportunity, row) {
    if (!row) return `<article class="opportunity-card" id="opportunity-${opportunity.id}"><div class="opportunity-body"><span class="planning-chip">${esc(opportunity.label)}</span><h3>今週は該当候補を確認中</h3><div class="opportunity-outfit">条件に合わない場所を無理に表示せず、次回の自動提案で補います。</div></div></article>`;
    const item = row.item;
    const meta = row.meta;
    const encoded = encodeURIComponent(JSON.stringify(opportunity.facets));
    return `<article class="opportunity-card" id="opportunity-${opportunity.id}"><div class="opportunity-photo"><img src="${esc(item.image)}" alt="${esc(item.name)}の写真" loading="lazy" decoding="async"><span class="opportunity-label">${esc(opportunity.label)}</span></div><div class="opportunity-body"><h3>${esc(item.name)}</h3><div class="opportunity-meta"><span class="planning-chip">${esc(meta.seasonFit.join("・"))}</span><span class="planning-chip">${esc(meta.weatherFit.slice(0, 3).join("・"))}</span><span class="planning-chip">${esc(meta.timeSlots.slice(0, 2).join("・"))}</span><span class="planning-chip">${esc(meta.durationType)}</span><span class="planning-chip">${esc(meta.indoorOutdoor)}</span><span class="planning-chip">予算 ${esc(meta.budgetLevel)}</span><span class="planning-chip">片道 ${esc(item.travel || "概算を確認")}</span></div><details class="opportunity-more"><summary>服装・写真・誘い方を見る</summary><div class="opportunity-outfit"><strong>服装:</strong> ${esc(meta.outfit)}<br><strong>写真の魅力:</strong> ${esc(item.photo || "公式写真で雰囲気を確認")}</div><div class="opportunity-invite">${esc(meta.inviteText)}</div></details><div class="opportunity-actions"><a href="${esc(item.url)}" target="_blank" rel="noreferrer">公式・写真 ↗</a><button type="button" data-opportunity-facets="${encoded}">この条件で探す</button></div></div></article>`;
  }

  function renderBoard() {
    const rows = currentItems();
    const used = new Set();
    const chosen = opportunities.map((opportunity) => {
      const row = chooseOpportunity(rows, opportunity, used);
      if (row) used.add(row.item.id);
      return opportunityCard(opportunity, row);
    });
    document.getElementById("opportunityGrid").innerHTML = chosen.join("");
  }

  function renderFacetState() {
    document.querySelectorAll("[data-facet-group]").forEach((button) => {
      const active = api.state.facets[button.dataset.facetGroup]?.includes(button.dataset.facetValue);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(Boolean(active)));
    });
    const selected = facetConfig.flatMap(([group, label]) => (api.state.facets[group] || []).map((value) => `${label}: ${value}`));
    const more = conditionPanel.querySelector(".condition-more");
    if (more && facetConfig.slice(3).some(([group]) => api.state.facets[group]?.length)) more.open = true;
    const extras = [];
    if (filter.value !== "all") extras.push(`種類: ${filter.options[filter.selectedIndex]?.text}`);
    if (search.value.trim()) extras.push(`検索: ${search.value.trim()}`);
    const resultCount = document.querySelector(".weekly-result-count")?.textContent || "";
    document.getElementById("selectedConditions").innerHTML = selected.concat(extras).length
      ? selected.concat(extras).map((value) => `<span class="selected-condition">${esc(value)}</span>`).join("") + (resultCount ? `<span class="selected-condition">結果: ${esc(resultCount)}</span>` : "")
      : '<span class="selected-condition">条件なし。20件を広く表示中</span>';
  }

  function refresh() {
    api.state.showAll = false;
    api.render();
    renderFacetState();
  }

  conditionPanel.addEventListener("click", (event) => {
    const facet = event.target.closest("[data-facet-group]");
    if (facet) {
      const rows = api.state.facets[facet.dataset.facetGroup];
      const value = facet.dataset.facetValue;
      api.state.facets[facet.dataset.facetGroup] = rows.includes(value) ? rows.filter((row) => row !== value) : [...rows, value];
      refresh();
      return;
    }
    const suggestion = event.target.closest("[data-suggestion-group]");
    if (suggestion) {
      api.state.facets[suggestion.dataset.suggestionGroup] = [suggestion.dataset.suggestionValue];
      refresh();
      return;
    }
    const filterSuggestion = event.target.closest("[data-suggestion-filter]");
    if (filterSuggestion) {
      filter.value = filterSuggestion.dataset.suggestionFilter;
      filter.dispatchEvent(new Event("change", { bubbles: true }));
      renderFacetState();
      return;
    }
    if (event.target.closest("#conditionReset")) {
      facetConfig.forEach(([group]) => { api.state.facets[group] = []; });
      search.value = "";
      originalSearch.value = "";
      filter.value = "all";
      originalSearch.dispatchEvent(new Event("input", { bubbles: true }));
      filter.dispatchEvent(new Event("change", { bubbles: true }));
      renderFacetState();
    }
    if (event.target.closest("#conditionSearchClear")) {
      search.value = "";
      originalSearch.value = "";
      originalSearch.dispatchEvent(new Event("input", { bubbles: true }));
      search.focus();
      renderFacetState();
    }
  });

  search.addEventListener("input", () => {
    originalSearch.value = search.value;
    originalSearch.dispatchEvent(new Event("input", { bubbles: true }));
    renderFacetState();
  });
  filter.addEventListener("change", renderFacetState);
  sort.addEventListener("change", renderFacetState);

  board.addEventListener("click", (event) => {
    const scrollButton = event.target.closest("[data-board-scroll]");
    if (scrollButton) {
      document.getElementById("opportunityGrid").scrollBy({ left: Number(scrollButton.dataset.boardScroll) * 313, behavior: "smooth" });
      return;
    }
    const button = event.target.closest("[data-opportunity-facets]");
    if (!button) return;
    const facets = JSON.parse(decodeURIComponent(button.dataset.opportunityFacets));
    facetConfig.forEach(([group]) => { api.state.facets[group] = []; });
    Object.entries(facets).forEach(([group, value]) => {
      if (group === "miss") { sort.value = "miss"; sort.dispatchEvent(new Event("change", { bubbles: true })); return; }
      api.state.facets[group] = [value];
    });
    api.state.tab = "context";
    refresh();
    document.getElementById("condition-filters").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function decorateCards() {
    api.results.querySelectorAll(".weekly-card[data-weekly-id]").forEach((card) => {
      const item = api.data.catalog[card.dataset.weeklyId];
      if (!item) return;
      const meta = taxonomy.infer(item);
      let summary = card.querySelector(".planning-summary");
      if (!summary) {
        summary = document.createElement("div");
        summary.className = "planning-summary";
        card.querySelector(".weekly-card-more")?.insertAdjacentElement("beforebegin", summary);
      }
      const signature = JSON.stringify(meta);
      if (summary.dataset.planningSignature !== signature) {
        summary.dataset.planningSignature = signature;
        summary.innerHTML = `<strong>この日の条件</strong><div class="planning-chip-row"><span class="planning-chip">季節 ${esc(meta.seasonFit.join("・"))}</span><span class="planning-chip">天気 ${esc(meta.weatherFit.slice(0, 3).join("・"))}</span><span class="planning-chip">時間 ${esc(meta.timeSlots.slice(0, 2).join("・"))}</span><span class="planning-chip">${esc(meta.durationType)}</span><span class="planning-chip">${esc(meta.indoorOutdoor)}</span><span class="planning-chip">予算 ${esc(meta.budgetLevel)}</span></div>`;
      }
      const details = card.querySelector(".weekly-card-more-body");
      if (details && !details.querySelector(".planning-detail-grid")) {
        details.insertAdjacentHTML("afterbegin", `<div class="planning-detail-grid"><div class="planning-detail"><strong>服装・持ち物</strong><br>${esc(meta.outfit)}</div><div class="planning-detail"><strong>予算目安</strong><br>${esc(meta.budgetNote)}</div><div class="planning-detail"><strong>今逃すと惜しい理由</strong><br>${esc(meta.missReason)}</div><div class="planning-detail"><strong>マンネリ回避</strong><br>${esc(meta.mannerismReason)}</div></div>`);
      }
      let invite = card.querySelector(".planning-invite");
      if (!invite) {
        invite = document.createElement("div");
        invite.className = "planning-invite";
        card.querySelector(".weekly-card-actions")?.insertAdjacentElement("beforebegin", invite);
      }
      if (invite.dataset.planningSignature !== meta.inviteText) {
        invite.dataset.planningSignature = meta.inviteText;
        invite.innerHTML = `<strong>彼女に相談するなら</strong><br>${esc(meta.inviteText)}<br><button class="planning-copy" type="button" data-copy-invite="${encodeURIComponent(meta.inviteText)}">一言をコピー</button>`;
      }
    });
  }

  function findPlannerSpot(name) {
    for (const day of window.DATE_PLANNER_DATA?.days || []) {
      const spot = day.spots?.find((item) => item.name === name);
      if (spot) return spot;
    }
    return null;
  }

  function decoratePlannerCards() {
    document.querySelectorAll("#spotGrid .spot").forEach((card) => {
      const spot = findPlannerSpot(card.querySelector("h3")?.textContent?.trim());
      if (!spot) return;
      const meta = taxonomy.infer(spot);
      let summary = card.querySelector(".planning-summary");
      if (!summary) {
        summary = document.createElement("div");
        summary.className = "planning-summary";
        card.querySelector(".chips")?.insertAdjacentElement("afterend", summary);
      }
      const signature = JSON.stringify(meta);
      if (summary.dataset.planningSignature === signature) return;
      summary.dataset.planningSignature = signature;
      summary.innerHTML = `<strong>この日の条件</strong><div class="planning-chip-row"><span class="planning-chip">季節 ${esc(meta.seasonFit.join("・"))}</span><span class="planning-chip">天気 ${esc(meta.weatherFit.slice(0, 3).join("・"))}</span><span class="planning-chip">時間 ${esc(meta.timeSlots.slice(0, 2).join("・"))}</span><span class="planning-chip">${esc(meta.durationType)}</span><span class="planning-chip">${esc(meta.indoorOutdoor)}</span><span class="planning-chip">予算 ${esc(meta.budgetLevel)}</span></div><div class="planning-detail-grid"><div class="planning-detail"><strong>服装・持ち物</strong><br>${esc(meta.outfit)}</div><div class="planning-detail"><strong>予算目安</strong><br>${esc(meta.budgetNote)}</div><div class="planning-detail"><strong>今逃すと惜しい理由</strong><br>${esc(meta.missReason)}</div><div class="planning-detail"><strong>マンネリ回避</strong><br>${esc(meta.mannerismReason)}</div></div>`;
    });
  }

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-invite]");
    if (!button) return;
    const text = decodeURIComponent(button.dataset.copyInvite);
    try {
      await navigator.clipboard.writeText(text);
      if (typeof showToast === "function") showToast("彼女に相談する一言をコピーしました");
    } catch (_) {
      if (typeof showToast === "function") showToast("コピーできませんでした");
    }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("#copyFinalPlan");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const title = document.getElementById("finalTitle")?.value.trim();
    const note = document.getElementById("finalNote")?.value.trim();
    const day = window.DATE_PLANNER_DATA?.days?.find((item) => item.date === document.querySelector(".date-button.active strong")?.closest("button")?.dataset.date);
    const fallback = title || document.querySelector("#dayHeroCard h3")?.textContent?.trim() || day?.title || "このプラン";
    const text = note ? `「${fallback}」、候補に入れてみたいんだけどどうかな？ ${note}` : `「${fallback}」、次の休みの候補に入れてみたいんだけどどうかな？`;
    try {
      await navigator.clipboard.writeText(text);
      if (typeof showToast === "function") showToast("彼女に相談する一言をコピーしました");
    } catch (_) {
      if (typeof showToast === "function") showToast("コピーできませんでした");
    }
  }, true);

  const menu = document.querySelector(".menu-list");
  if (menu) {
    menu.querySelectorAll('[data-reveal-utility="monitor"],[data-reveal-utility="roadmap"]').forEach((link) => link.remove());
    const first = menu.firstElementChild;
    [
      ["#opportunity-board", "デート機会ボード", "条件から"],
      ["#opportunity-miss", "今逃すと惜しい", "期間限定"],
      ["#facet-weather", "天気別", "晴れ・雨"],
      ["#facet-time", "時間帯別", "午前・夜"]
    ].reverse().forEach(([href, label, small]) => first?.insertAdjacentHTML("beforebegin", `<a class="menu-link" href="${href}"><span>${label}</span><small>${small}</small></a>`));
    menu.addEventListener("click", (event) => {
      if (!event.target.closest("a[href^='#']")) return;
      document.getElementById("menuPanel")?.classList.remove("open");
      document.getElementById("menuButton")?.setAttribute("aria-expanded", "false");
    });
  }

  function renameConsultButton() {
    const button = document.getElementById("copyFinalPlan");
    if (button) button.textContent = "彼女に相談する一言をコピー";
  }

  function decorateExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      if (link.dataset.externalExplained === "true") return;
      const label = link.textContent.trim();
      link.dataset.externalExplained = "true";
      link.title = `${label.replace(/\s*↗$/, "")}（新しいタブで開きます）`;
      link.setAttribute("aria-label", link.title);
      if (!/↗$/.test(label)) link.append(" ↗");
    });
  }

  const observer = new MutationObserver(() => {
    decorateCards();
    decoratePlannerCards();
    renameConsultButton();
    decorateExternalLinks();
    renderBoard();
    renderFacetState();
  });
  observer.observe(api.results, { childList: true });
  observer.observe(document.getElementById("weeklyHero"), { childList: true });
  const spotGrid = document.getElementById("spotGrid");
  if (spotGrid) observer.observe(spotGrid, { childList: true });
  const decisionGrid = document.getElementById("decisionGrid");
  if (decisionGrid) observer.observe(decisionGrid, { childList: true });
  const externalObserver = new MutationObserver(decorateExternalLinks);
  [heroPrimary, document.getElementById("scenarioGrid"), document.getElementById("compareSectionGrid")]
    .filter(Boolean)
    .forEach((element) => externalObserver.observe(element, { childList: true }));
  decorateCards();
  decoratePlannerCards();
  renameConsultButton();
  decorateExternalLinks();
  renderBoard();
  renderFacetState();
})();
