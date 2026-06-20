(function () {
  "use strict";

  const library = window.FOOD_LIBRARY_DATA || { places: [] };
  const places = Array.isArray(library.places) ? library.places : [];
  if (!places.length) return;

  const options = {
    area: ["すべて", "萩市", "長門市", "美祢市", "山口市", "防府市", "下関市", "宇部市", "山陽小野田市", "周南市", "岩国市", "その他山口県内"],
    distance: ["すべて", "近場", "軽い遠出", "半日遠出", "ロング遠出"],
    genre: ["すべて", "海鮮", "郷土料理", "和食", "洋食", "イタリアン", "カフェ", "甘味", "スイーツ", "アフタヌーンティー", "軽食", "テイクアウト", "市場", "温泉街ごはん", "道の駅・直売所", "ファミレス・気軽な食事", "記念日・少し特別", "夜ごはん", "朝ごはん", "ホテルラウンジ", "喫茶店", "パン", "ラーメン", "うどん", "そば", "焼き鳥", "焼肉", "定食", "寿司", "カレー", "中華", "旅館・ホテルごはん"],
    time: ["すべて", "朝", "ランチ", "カフェ", "夕方", "夜ごはん", "デート後の締め", "短時間休憩", "午前だけ", "午後だけ", "夕方から", "夜だけ"],
    budget: ["すべて", "低", "中", "高", "特別"],
    condition: ["すべて", "相談優先", "雨の日でも使いやすい", "暑い日でも使いやすい", "寒い日でも使いやすい", "歩き疲れた後に使いやすい", "静かに話しやすい", "写真で雰囲気が伝わる", "予約した方がよい", "駐車場確認が必要", "混雑注意", "短時間でも使える", "ロングデートの途中に使える", "夕方からでも使える", "午前だけでも使える", "少し特別にできる", "近場で安心", "遠出のごほうび", "雨の日の屋内休憩", "甘い休憩", "山口らしさがある"],
    mood: ["すべて", "ゆっくり話したい", "甘いものを食べたい", "山口らしいものを食べたい", "海鮮を食べたい", "うどんを食べたい", "カフェに行きたい", "アフタヌーンティーに行きたい", "軽く済ませたい", "少し特別にしたい", "雨の日に落ち着きたい", "近場で安心したい", "遠出のごほうびにしたい", "夜ごはんを楽しみたい", "休憩を優先したい", "写真で雰囲気を見て決めたい"],
    sort: ["おすすめ順", "近い順", "予算が軽い順", "夜に使いやすい順", "雨の日に使いやすい順", "特別感がある順", "山口らしさ優先", "静かに話しやすい順"]
  };

  const state = {
    query: "",
    area: "すべて",
    distance: "すべて",
    genre: "すべて",
    time: "すべて",
    budget: "すべて",
    condition: "すべて",
    mood: "すべて",
    sort: "おすすめ順",
    visible: 9
  };

  const foodQuestionGenres = [
    ["すべて", "all"],
    ["海鮮", "海鮮"],
    ["うどん", "うどん"],
    ["そば", "そば"],
    ["ラーメン", "ラーメン"],
    ["定食", "定食"],
    ["カフェ", "カフェ"],
    ["甘味", "甘味"],
    ["スイーツ", "スイーツ"],
    ["アフタヌーンティー", "アフタヌーンティー"],
    ["郷土料理", "郷土料理"],
    ["洋食", "洋食"],
    ["イタリアン", "イタリアン"],
    ["中華", "中華"],
    ["カレー", "カレー"],
    ["焼き鳥", "焼き鳥"],
    ["焼肉", "焼肉"],
    ["寿司", "寿司"],
    ["市場", "市場"],
    ["道の駅・直売所", "道の駅・直売所"],
    ["ホテルごはん", "旅館・ホテルごはん"],
    ["夜ごはん", "夜ごはん"]
  ];

  const primaryGenreOrder = ["海鮮", "うどん", "そば", "ラーメン", "定食", "カフェ", "甘味", "スイーツ", "アフタヌーンティー", "郷土料理", "洋食", "イタリアン", "中華", "カレー", "焼き鳥", "焼肉", "寿司", "市場", "道の駅・直売所", "旅館・ホテルごはん", "夜ごはん", "和食", "軽食"];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function validHttpUrl(value) {
    try {
      const parsed = new URL(value, window.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch (error) {
      return "";
    }
  }

  function selectMarkup(id, label, values) {
    return `<label class="food-filter"><span>${escapeHtml(label)}</span><select id="${id}">${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}</select></label>`;
  }

  function ensureSection() {
    let section = document.getElementById("food-library");
    if (section) return section;
    section = document.createElement("section");
    section.className = "section food-library";
    section.id = "food-library";
    const anchor = document.getElementById("mood");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(section, anchor);
    return section;
  }

  function injectStyles() {
    if (document.getElementById("foodLibraryStyles")) return;
    const style = document.createElement("style");
    style.id = "foodLibraryStyles";
    style.textContent = `
      .food-library { scroll-margin-top:78px; }
      .food-entrance { position:relative; overflow:hidden; border:1px solid rgba(133,91,50,.16); border-radius:32px; padding:22px; background:linear-gradient(145deg,#fff9ed 0%,#fffdf8 48%,#eaf4ef 100%); box-shadow:0 18px 42px rgba(84,62,36,.10); }
      .food-entrance::after { content:""; position:absolute; width:240px; height:240px; right:-90px; top:-110px; border-radius:50%; background:radial-gradient(circle,rgba(221,160,67,.24),rgba(221,160,67,0) 68%); pointer-events:none; }
      .food-entrance-grid { position:relative; z-index:1; display:grid; gap:18px; }
      .food-kicker { display:inline-flex; align-items:center; width:max-content; min-height:30px; padding:0 12px; border-radius:999px; background:#2f6e66; color:#fff; font-size:12px; font-weight:800; letter-spacing:.06em; }
      .food-entrance h2 { margin-top:12px; font-size:clamp(27px,7vw,44px); line-height:1.08; letter-spacing:-.035em; }
      .food-question { margin-top:9px!important; color:#8f5d22!important; font-size:clamp(18px,4.5vw,25px); font-weight:900; }
      .food-entrance p { margin-top:10px; color:#6d5a4d; max-width:760px; }
      .food-eat-question { position:relative; z-index:1; margin-top:18px; padding:16px; border-radius:24px; border:1px solid rgba(47,110,102,.14); background:rgba(255,255,255,.72); }
      .food-eat-question h3 { margin:0; font-size:clamp(22px,5.8vw,34px); letter-spacing:-.03em; }
      .food-eat-question p { margin-top:7px; color:#66584e; font-size:14px; }
      .food-genre-rail { display:flex; gap:8px; overflow-x:auto; padding:13px 0 2px; scrollbar-width:none; }
      .food-genre-rail::-webkit-scrollbar { display:none; }
      .food-genre-chip { flex:0 0 auto; min-height:42px; border:1px solid rgba(143,93,34,.18); border-radius:999px; padding:0 14px; background:#fffdf8; color:#8f5d22; font-weight:900; cursor:pointer; }
      .food-genre-chip.primary { border-color:#8f5d22; background:#8f5d22; color:#fff; }
      .food-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
      .food-stat { min-width:0; padding:13px; border-radius:18px; border:1px solid rgba(133,91,50,.12); background:rgba(255,255,255,.78); }
      .food-stat strong { display:block; font-size:20px; line-height:1.1; color:#8f5d22; }
      .food-stat span { display:block; margin-top:5px; color:#746355; font-size:11px; }
      .food-presets { display:flex; gap:8px; overflow-x:auto; padding:3px 0 5px; margin-top:16px; scrollbar-width:none; }
      .food-presets::-webkit-scrollbar { display:none; }
      .food-preset { flex:0 0 auto; min-height:42px; border:1px solid rgba(47,110,102,.20); border-radius:999px; padding:0 14px; color:#2f6e66; background:#fff; font-weight:800; font-size:13px; cursor:pointer; }
      .food-preset.primary { color:#fff; border-color:#2f6e66; background:#2f6e66; }
      .food-workbench { margin-top:14px; border:1px solid var(--line); border-radius:26px; background:rgba(255,253,249,.96); box-shadow:var(--shadow); overflow:hidden; }
      .food-filter-top { padding:16px; border-bottom:1px solid var(--line); background:linear-gradient(180deg,#fffdf8,#fffaf2); }
      .food-search-row { display:grid; grid-template-columns:1fr auto; gap:8px; }
      .food-search { min-width:0; min-height:48px; border:1px solid rgba(98,74,65,.18); border-radius:16px; padding:0 15px; color:var(--text); background:#fff; }
      .food-clear { min-width:78px; min-height:48px; border:1px solid rgba(98,74,65,.16); border-radius:16px; background:#fff; color:var(--muted); cursor:pointer; }
      .food-filter-details { margin-top:12px; border:1px solid var(--line); border-radius:18px; background:#fff; }
      .food-filter-details summary { list-style:none; display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:48px; padding:0 14px; cursor:pointer; font-weight:800; }
      .food-filter-details summary::-webkit-details-marker { display:none; }
      .food-filter-details summary small { color:var(--muted); font-weight:500; }
      .food-filter-grid { display:grid; grid-template-columns:1fr; gap:10px; padding:0 14px 14px; }
      .food-filter { display:grid; gap:5px; min-width:0; }
      .food-filter span { color:var(--muted); font-size:12px; font-weight:800; }
      .food-filter select { width:100%; min-width:0; min-height:46px; border:1px solid rgba(98,74,65,.16); border-radius:14px; padding:0 12px; color:var(--text); background:#fff; }
      .food-result-bar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; padding:14px 16px; border-bottom:1px solid var(--line); }
      .food-result-bar strong { font-size:16px; }
      .food-result-bar span { color:var(--muted); font-size:12px; }
      .food-active-filters { display:flex; flex-wrap:wrap; gap:6px; padding:0 16px 14px; }
      .food-active-filter { display:inline-flex; align-items:center; min-height:28px; padding:0 9px; border-radius:999px; background:#edf6f2; color:#2f6e66; font-size:11px; font-weight:800; }
      .food-diversity-panel { display:grid; gap:8px; margin:0 16px 14px; padding:13px; border-radius:18px; border:1px solid rgba(47,110,102,.14); background:linear-gradient(135deg,#f2faf7,#fff8eb); }
      .food-diversity-row { display:flex; flex-wrap:wrap; gap:7px; align-items:center; color:#5b4d45; font-size:12px; }
      .food-diversity-row strong { color:#2f6e66; }
      .food-diversity-chip { display:inline-flex; min-height:28px; align-items:center; padding:0 9px; border-radius:999px; background:#fff; border:1px solid rgba(47,110,102,.12); color:#2f6e66; font-size:11px; font-weight:900; }
      .food-grid { display:flex; gap:12px; padding:16px; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none; }
      .food-grid::-webkit-scrollbar { display:none; }
      .food-card { flex:0 0 min(86vw,360px); min-width:0; overflow:hidden; border:1px solid var(--line); border-radius:24px; background:#fff; box-shadow:0 12px 26px rgba(74,53,35,.07); scroll-snap-align:start; }
      .food-media { position:relative; aspect-ratio:16/8.8; overflow:hidden; background:linear-gradient(135deg,#d9ab65,#7aa49c); }
      .food-media img { width:100%; height:100%; object-fit:cover; }
      .food-placeholder { height:100%; display:grid; place-items:center; padding:18px; text-align:center; color:#fff; background:radial-gradient(circle at 80% 10%,rgba(255,255,255,.24),transparent 34%),linear-gradient(135deg,#b46e3e,#c99a50 46%,#4e8179); }
      .food-placeholder span { display:block; font-size:36px; line-height:1; }
      .food-placeholder strong { display:block; margin-top:10px; font-size:18px; }
      .food-area-badge { position:absolute; left:12px; top:12px; min-height:30px; display:inline-flex; align-items:center; padding:0 10px; border-radius:999px; color:#fff; background:rgba(38,37,31,.72); backdrop-filter:blur(8px); font-size:12px; font-weight:800; }
      .food-practical-badges { position:absolute; left:12px; right:12px; bottom:10px; display:flex; flex-wrap:wrap; gap:5px; }
      .food-practical-badge { display:inline-flex; align-items:center; min-height:28px; padding:0 9px; border-radius:999px; color:#fff; background:rgba(38,37,31,.76); backdrop-filter:blur(8px); font-size:10px; font-weight:900; }
      .food-card-body { padding:16px; }
      .food-card h3 { margin-top:9px; font-size:21px; line-height:1.25; }
      .food-card-lead { margin-top:9px; color:#66584e; font-size:14px; }
      .food-interest-note { display:grid; gap:3px; margin-top:10px; padding:10px 12px; border-radius:16px; background:#fff4ee; border:1px solid rgba(184,89,75,.16); color:#6f493c; }
      .food-interest-note strong { color:#a04e45; font-size:12px; letter-spacing:.04em; }
      .food-interest-note span { font-size:13px; line-height:1.55; }
      .food-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:11px; }
      .food-tag { display:inline-flex; align-items:center; min-height:28px; padding:0 9px; border-radius:999px; border:1px solid rgba(133,91,50,.13); color:#79512d; background:#fff7e9; font-size:11px; font-weight:800; }
      .food-tag.teal { color:#2f6e66; background:#eef7f3; border-color:rgba(47,110,102,.14); }
      .food-quick { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:12px; }
      .food-quick-item { padding:10px; border-radius:14px; background:#faf7f2; border:1px solid var(--line); }
      .food-quick-item span { display:block; color:var(--muted); font-size:10px; font-weight:800; }
      .food-quick-item strong { display:block; margin-top:3px; font-size:12px; line-height:1.35; }
      .food-nearby { margin-top:10px; padding:10px 12px; border-radius:14px; color:#5b4d45; background:#f3f8f5; border:1px solid rgba(47,110,102,.12); font-size:12px; }
      .food-operations { display:grid; gap:6px; margin-top:10px; }
      .food-operation { display:grid; grid-template-columns:74px minmax(0,1fr); gap:7px; padding:8px 10px; border-radius:12px; background:#faf7f2; color:#66584e; font-size:11px; line-height:1.5; }
      .food-operation strong { color:#493b34; }
      .food-invite { margin-top:12px; padding:13px; border-radius:17px; background:linear-gradient(135deg,#fff3e2,#eef7f3); border:1px dashed rgba(143,93,34,.24); }
      .food-invite span { display:block; color:#8f5d22; font-size:11px; font-weight:800; }
      .food-invite p { margin-top:5px; font-size:14px; font-weight:700; }
      .food-details { margin-top:12px; border:1px solid var(--line); border-radius:16px; background:#fffdfa; }
      .food-details summary { list-style:none; min-height:42px; display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 12px; cursor:pointer; font-size:12px; font-weight:800; }
      .food-details summary::-webkit-details-marker { display:none; }
      .food-detail-list { display:grid; gap:8px; padding:0 12px 12px; color:var(--muted); font-size:12px; }
      .food-detail-list strong { color:var(--text); }
      .food-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
      .food-actions a,.food-actions button { flex:1 1 130px; min-height:44px; display:inline-flex; align-items:center; justify-content:center; border-radius:14px; padding:0 12px; font-size:12px; font-weight:800; cursor:pointer; }
      .food-source { border:1px solid #2f6e66; color:#fff; background:#2f6e66; }
      .food-copy { border:1px solid rgba(143,93,34,.20); color:#8f5d22; background:#fff8eb; }
      .food-more-wrap { padding:0 16px 18px; text-align:center; }
      .food-more { min-width:min(100%,320px); min-height:48px; border:1px solid rgba(47,110,102,.22); border-radius:16px; color:#2f6e66; background:#fff; font-weight:800; cursor:pointer; }
      .food-empty { margin:16px; padding:24px; border:1px dashed rgba(98,74,65,.20); border-radius:20px; color:var(--muted); text-align:center; background:#fff; }
      .food-bridge { margin-top:12px; padding:12px; border:1px solid rgba(47,110,102,.18); border-radius:18px; background:linear-gradient(135deg,#f2faf7,#fffaf1); }
      .food-bridge strong { display:block; font-size:13px; }
      .food-bridge p { margin-top:4px; color:var(--muted); font-size:12px; }
      .food-bridge-actions { display:flex; flex-wrap:wrap; gap:7px; margin-top:9px; }
      .food-bridge button { min-height:38px; border:1px solid rgba(47,110,102,.18); border-radius:999px; padding:0 11px; color:#2f6e66; background:#fff; font-size:11px; font-weight:800; cursor:pointer; }
      .menu-group-label { padding:11px 10px 4px; color:var(--muted); font-size:11px; font-weight:900; letter-spacing:.08em; }
      @media (min-width:760px) {
        .food-entrance { padding:28px; }
        .food-entrance-grid { grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr); align-items:end; }
        .food-filter-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .food-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); overflow:visible; }
        .food-card { flex:none; }
      }
      @media (min-width:1080px) {
        .food-filter-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
        .food-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
      }
    `;
    document.head.appendChild(style);
  }

  function renderShell(section) {
    section.innerHTML = `
      <div class="food-entrance">
        <div class="food-entrance-grid">
          <div>
            <span class="food-kicker">デートの前後も一緒に選ぶ</span>
            <h2>今日は何食べたい？</h2>
            <p class="food-question">山口県ご飯処ライブラリー</p>
            <p>デートの前後に使いやすいご飯処を、ジャンル・時間帯・距離感・気分から選べます。</p>
          </div>
          <div class="food-stats">
            <div class="food-stat"><strong>${places.length}</strong><span>確認元URL付き</span></div>
            <div class="food-stat"><strong>${new Set(places.map((place) => place.city)).size}</strong><span>掲載エリア</span></div>
            <div class="food-stat"><strong>${new Set(places.flatMap((place) => place.genre || [])).size}</strong><span>食事ジャンル</span></div>
          </div>
        </div>
        <div class="food-eat-question" aria-label="食べたいものから探す">
          <h3>食べたいものから選ぶ</h3>
          <p>海鮮、うどん、ラーメン、定食、カフェ、甘味、ホテルごはんまで、同じジャンルに偏らないように見比べられます。</p>
          <div class="food-genre-rail">
            ${foodQuestionGenres.map(([label, genre], index) => `<button class="food-genre-chip ${index === 0 ? "primary" : ""}" type="button" data-food-preset="${genre === "all" ? "all" : `genre:${genre}`}">${escapeHtml(label)}</button>`).join("")}
          </div>
        </div>
        <div class="food-presets" aria-label="ご飯処のおすすめ入口">
          <button class="food-preset primary" data-food-preset="all">すべて</button>
          <button class="food-preset" data-food-preset="interest">ふたり優先</button>
          <button class="food-preset" data-food-preset="near">近場ごはん</button>
          <button class="food-preset" data-food-preset="rain">雨の日ごはん</button>
          <button class="food-preset" data-food-preset="cafe">カフェ</button>
          <button class="food-preset" data-food-preset="sweet">甘味</button>
          <button class="food-preset" data-food-preset="udon">うどん</button>
          <button class="food-preset" data-food-preset="seafood">海鮮</button>
          <button class="food-preset" data-food-preset="afternoon">アフタヌーンティー</button>
          <button class="food-preset" data-food-preset="night">夜ごはん</button>
          <button class="food-preset" data-food-preset="special">少し特別</button>
        </div>
      </div>
      <div class="food-workbench">
        <div class="food-filter-top">
          <div class="food-search-row">
            <input class="food-search" id="foodSearch" type="search" inputmode="search" placeholder="店名・エリア・料理・近くの場所を検索" aria-label="ご飯処を検索">
            <button class="food-clear" id="foodClear" type="button">リセット</button>
          </div>
          <details class="food-filter-details">
            <summary><span>条件を選ぶ</span><small>エリア・距離・料理・時間・予算</small></summary>
            <div class="food-filter-grid">
              ${selectMarkup("foodArea", "エリア", options.area)}
              ${selectMarkup("foodDistance", "萩市アトラス付近から", options.distance)}
              ${selectMarkup("foodGenre", "食事ジャンル", options.genre)}
              ${selectMarkup("foodTime", "時間帯", options.time)}
              ${selectMarkup("foodBudget", "予算感（目安）", options.budget)}
              ${selectMarkup("foodCondition", "デート条件", options.condition)}
              ${selectMarkup("foodMood", "今の気分", options.mood)}
              ${selectMarkup("foodSort", "並び替え", options.sort)}
            </div>
          </details>
        </div>
        <div class="food-result-bar"><strong id="foodResultCount"></strong><span>${escapeHtml(library.sourcePolicy || "営業状況は公式で要確認")}</span></div>
        <div class="food-active-filters" id="foodActiveFilters"></div>
        <div class="food-diversity-panel" id="foodDiversityPanel"></div>
        <div class="food-grid" id="foodGrid"></div>
        <div class="food-more-wrap" id="foodMoreWrap"><button class="food-more" id="foodMore" type="button">さらに見る</button></div>
      </div>
    `;
  }

  function budgetValue(label) {
    return { 低: 1, 中: 2, 高: 3, 特別: 4 }[label] || 9;
  }

  function textFor(place) {
    return [place.name, place.area, place.city, ...(place.genre || []), ...(place.timeSlots || []), ...(place.dateFit || []), ...(place.moodFit || []), ...(place.nearbyDateSpots || []), place.whyForDate, place.photoNote].join(" ").toLowerCase();
  }

  function distanceMatches(place) {
    const minutes = Number(place.distanceFromHagiAtlas && place.distanceFromHagiAtlas.minutes || 999);
    if (state.distance === "すべて") return true;
    if (state.distance.startsWith("近場")) return minutes <= 20;
    if (state.distance.startsWith("軽い遠出")) return minutes > 20 && minutes <= 45;
    if (state.distance.startsWith("半日遠出")) return minutes > 45 && minutes <= 90;
    return minutes > 90;
  }

  function budgetMatches(place) {
    if (state.budget === "すべて") return true;
    return state.budget.startsWith(place.budgetLevel);
  }

  function primaryGenre(place) {
    const genres = place.genre || [];
    return primaryGenreOrder.find((genre) => genres.includes(genre)) || genres[0] || "その他";
  }

  function diversifyFoodGenres(list) {
    if (state.sort !== "おすすめ順" || state.genre !== "すべて" || list.length < 4) return list;
    const remaining = list.slice();
    const output = [];
    const used = {};
    while (remaining.length) {
      const lastGenre = output.length ? primaryGenre(output[output.length - 1]) : "";
      let bestIndex = 0;
      let bestScore = Infinity;
      remaining.forEach((place, index) => {
        const genre = primaryGenre(place);
        const score = (used[genre] || 0) * 12 + (genre === lastGenre ? 6 : 0) + index * 0.08;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      });
      const [next] = remaining.splice(bestIndex, 1);
      const genre = primaryGenre(next);
      used[genre] = (used[genre] || 0) + 1;
      output.push(next);
    }
    return output;
  }

  function inventoryCount(genre) {
    return places.filter((place) => (place.genre || []).includes(genre)).length;
  }

  function genreDiversityMarkup(results) {
    const shown = results.slice(0, Math.min(state.visible, 12));
    const counts = {};
    shown.forEach((place) => {
      const genre = primaryGenre(place);
      counts[genre] = (counts[genre] || 0) + 1;
    });
    const common = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([genre]) => genre);
    const change = primaryGenreOrder
      .filter((genre) => genre !== state.genre && inventoryCount(genre) > 0 && !common.includes(genre))
      .slice(0, 5);
    const commonText = state.genre !== "すべて" ? [`${state.genre}に絞り込み中`] : (common.length ? common : ["まだ偏りなし"]);
    const changeText = change.length ? change : ["条件を少し広げる"];
    return `
      <div class="food-diversity-row"><strong>最近多いジャンル:</strong> ${commonText.map((item) => `<span class="food-diversity-chip">${escapeHtml(item)}</span>`).join("")}</div>
      <div class="food-diversity-row"><strong>次は変化をつけるなら:</strong> ${changeText.map((item) => `<button class="food-diversity-chip" type="button" data-food-preset="${item === "条件を少し広げる" ? "all" : `genre:${item}`}">${escapeHtml(item)}</button>`).join("")}</div>
    `;
  }

  function filteredPlaces() {
    const query = state.query.trim().toLowerCase();
    const filtered = places.filter((place) => {
      if (query && !textFor(place).includes(query)) return false;
      if (state.area !== "すべて") {
        if (state.area === "その他山口県内") {
          const named = options.area.slice(1, -1);
          if (named.includes(place.city)) return false;
        } else if (place.city !== state.area && place.area !== state.area) return false;
      }
      if (!distanceMatches(place)) return false;
      if (state.genre !== "すべて" && !(place.genre || []).includes(state.genre)) return false;
      if (state.time !== "すべて" && !(place.timeSlots || []).includes(state.time)) return false;
      if (!budgetMatches(place)) return false;
      if (state.condition !== "すべて" && !(place.dateFit || []).includes(state.condition)) return false;
      if (state.mood !== "すべて" && !(place.moodFit || []).includes(state.mood)) return false;
      return true;
    });
    const score = (place, label) => (place.dateFit || []).includes(label) ? 1 : 0;
    filtered.sort((a, b) => {
      if (state.sort === "近い順") return a.distanceFromHagiAtlas.minutes - b.distanceFromHagiAtlas.minutes;
      if (state.sort === "予算が軽い順") return budgetValue(a.budgetLevel) - budgetValue(b.budgetLevel) || a.distanceFromHagiAtlas.minutes - b.distanceFromHagiAtlas.minutes;
      if (state.sort === "夜に使いやすい順") return Number((b.timeSlots || []).includes("夜ごはん")) - Number((a.timeSlots || []).includes("夜ごはん")) || a.distanceFromHagiAtlas.minutes - b.distanceFromHagiAtlas.minutes;
      if (state.sort === "雨の日に使いやすい順") return score(b, "雨の日でも使いやすい") - score(a, "雨の日でも使いやすい") || score(b, "雨の日の屋内休憩") - score(a, "雨の日の屋内休憩");
      if (state.sort === "特別感がある順") return score(b, "少し特別にできる") - score(a, "少し特別にできる") || budgetValue(b.budgetLevel) - budgetValue(a.budgetLevel);
      if (state.sort === "山口らしさ優先") return score(b, "山口らしさがある") - score(a, "山口らしさがある") || a.distanceFromHagiAtlas.minutes - b.distanceFromHagiAtlas.minutes;
      if (state.sort === "静かに話しやすい順") return score(b, "静かに話しやすい") - score(a, "静かに話しやすい") || a.distanceFromHagiAtlas.minutes - b.distanceFromHagiAtlas.minutes;
      const recommended = (place) => (110 - Math.min(place.distanceFromHagiAtlas.minutes, 100)) + Number(place.interestPriority || 0) * 36 + score(place, "山口らしさがある") * 26 + score(place, "静かに話しやすい") * 18 + score(place, "少し特別にできる") * 10 + score(place, "雨の日でも使いやすい") * 6;
      return recommended(b) - recommended(a) || a.name.localeCompare(b.name, "ja");
    });
    return diversifyFoodGenres(filtered);
  }

  function practicalBadges(place) {
    const badges = [];
    const add = (label) => { if (label && !badges.includes(label)) badges.push(label); };
    add(place.distanceFromHagiAtlas && place.distanceFromHagiAtlas.label);
    if (Number(place.interestPriority || 0) > 0) add("相談優先");
    if ((place.timeSlots || []).includes("ランチ")) add("ランチ");
    if (/確認|推奨|予約/.test(place.reservation || "")) add("予約確認");
    if (/確認|駐車/.test(place.parking || "")) add("駐車場確認");
    if ((place.dateFit || []).includes("混雑注意") || /混雑/.test(place.caution || "")) add("混雑注意");
    if ((place.dateFit || []).includes("雨の日でも使いやすい")) add("雨の日");
    if ((place.timeSlots || []).includes("夜ごはん")) add("夜ごはん");
    if ((place.dateFit || []).includes("甘い休憩") || (place.genre || []).some((item) => ["甘味", "スイーツ"].includes(item))) add("甘い休憩");
    if ((place.dateFit || []).includes("山口らしさがある")) add("山口らしさ");
    if ((place.dateFit || []).includes("少し特別にできる")) add("少し特別");
    return badges.slice(0, 7);
  }

  function cardMarkup(place) {
    const sourceUrl = validHttpUrl(place.sourceUrl);
    const photoUrl = validHttpUrl(place.photoUrl);
    const heroGenre = (place.genre || ["ごはん"])[0];
    const detailFit = (place.dateFit || []).filter((item) => !["写真で雰囲気が伝わる", "駐車場確認が必要"].includes(item)).slice(0, 5);
    const practical = practicalBadges(place);
    const interestText = Number(place.interestPriority || 0) > 0 ? (place.planningRole || place.interestNote || "本人が気になっていた候補。相談しながら決める。") : "";
    return `
      <article class="food-card" data-food-id="${escapeHtml(place.id)}">
        <div class="food-media">
          ${photoUrl ? `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(place.photoNote || place.name)}" loading="lazy">` : `<div class="food-placeholder" aria-label="${escapeHtml(place.name)}の写真は公式ページで確認"><div><span>○</span><strong>${escapeHtml(heroGenre)}</strong><small>写真は公式ページで確認</small></div></div>`}
          <span class="food-area-badge">${escapeHtml(place.area)}</span>
          <div class="food-practical-badges">${practical.map((item) => `<span class="food-practical-badge">${escapeHtml(item)}</span>`).join("")}</div>
        </div>
        <div class="food-card-body">
          <div class="food-tags">${(place.genre || []).slice(0, 4).map((item) => `<span class="food-tag">${escapeHtml(item)}</span>`).join("")}</div>
          <h3>${escapeHtml(place.name)}</h3>
          ${interestText ? `<div class="food-interest-note"><strong>相談優先</strong><span>${escapeHtml(interestText)}</span></div>` : ""}
          <p class="food-card-lead">${escapeHtml(place.whyForDate)}</p>
          <div class="food-quick">
            <div class="food-quick-item"><span>距離感</span><strong>${escapeHtml(place.distanceFromHagiAtlas.note)}</strong></div>
            <div class="food-quick-item"><span>予算感</span><strong>${escapeHtml(place.budgetLevel)}・目安</strong></div>
            <div class="food-quick-item"><span>使いやすい時間</span><strong>${escapeHtml((place.timeSlots || []).slice(0, 3).join("・"))}</strong></div>
            <div class="food-quick-item"><span>天気</span><strong>${escapeHtml((place.weatherFit || []).slice(0, 3).join("・"))}</strong></div>
          </div>
          <div class="food-nearby"><strong>近くのデート：</strong>${escapeHtml((place.nearbyDateSpots || []).join("・") || "周辺候補を確認中")}</div>
          <div class="food-operations">
            <div class="food-operation"><strong>予約</strong><span>${escapeHtml(place.reservation)}</span></div>
            <div class="food-operation"><strong>駐車場</strong><span>${escapeHtml(place.parking)}</span></div>
            <div class="food-operation"><strong>営業時間</strong><span>${escapeHtml(place.businessHoursNote)}</span></div>
            <div class="food-operation"><strong>混雑・注意</strong><span>${escapeHtml(place.caution)}</span></div>
          </div>
          <div class="food-tags">${detailFit.map((item) => `<span class="food-tag teal">${escapeHtml(item)}</span>`).join("")}</div>
          <div class="food-invite"><span>こんな感じで相談</span><p>${escapeHtml(place.inviteText)}</p></div>
          <details class="food-details">
            <summary><span>行く前に見ること</span><span>＋</span></summary>
            <div class="food-detail-list">
              <div><strong>予算：</strong>${escapeHtml(place.budgetNote)}</div>
              <div><strong>写真：</strong>${escapeHtml(place.photoNote)}</div>
              <div>${escapeHtml(place.verificationNote)}</div>
            </div>
          </details>
          <div class="food-actions">
            ${sourceUrl ? `<a class="food-source" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">公式・確認ページ</a>` : ""}
            <button class="food-copy" type="button" data-food-copy="${escapeHtml(place.id)}">相談する一言をコピー</button>
          </div>
        </div>
      </article>
    `;
  }

  function activeFilterMarkup() {
    const labels = [state.area, state.distance, state.genre, state.time, state.budget, state.condition, state.mood].filter((value) => value !== "すべて");
    if (state.query) labels.unshift(`検索: ${state.query}`);
    if (!labels.length) return '<span class="food-active-filter">全候補を表示中</span>';
    return labels.map((label) => `<span class="food-active-filter">${escapeHtml(label)}</span>`).join("");
  }

  function syncControls() {
    const values = {
      foodArea: state.area,
      foodDistance: state.distance,
      foodGenre: state.genre,
      foodTime: state.time,
      foodBudget: state.budget,
      foodCondition: state.condition,
      foodMood: state.mood,
      foodSort: state.sort
    };
    Object.entries(values).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field) field.value = value;
    });
    const search = document.getElementById("foodSearch");
    if (search && search.value !== state.query) search.value = state.query;
  }

  function renderResults() {
    syncControls();
    const results = filteredPlaces();
    const grid = document.getElementById("foodGrid");
    const count = document.getElementById("foodResultCount");
    const active = document.getElementById("foodActiveFilters");
    const diversity = document.getElementById("foodDiversityPanel");
    const moreWrap = document.getElementById("foodMoreWrap");
    if (!grid || !count || !active || !moreWrap) return;
    count.textContent = `${results.length}件見つかりました`;
    active.innerHTML = activeFilterMarkup();
    if (diversity) diversity.innerHTML = genreDiversityMarkup(results);
    if (!results.length) {
      grid.innerHTML = `<div class="food-empty">${state.genre !== "すべて" ? `「${escapeHtml(state.genre)}」は公式確認元付きの候補を補強中です。` : "この条件の候補はまだありません。"}条件を1つ減らすか、リセットしてください。</div>`;
      moreWrap.hidden = true;
      return;
    }
    grid.innerHTML = results.slice(0, state.visible).map(cardMarkup).join("");
    moreWrap.hidden = results.length <= state.visible;
    const more = document.getElementById("foodMore");
    if (more) more.textContent = `さらに見る（残り${Math.max(results.length - state.visible, 0)}件）`;
  }

  function resetFilters(keepSort) {
    state.query = "";
    state.area = "すべて";
    state.distance = "すべて";
    state.genre = "すべて";
    state.time = "すべて";
    state.budget = "すべて";
    state.condition = "すべて";
    state.mood = "すべて";
    if (!keepSort) state.sort = "おすすめ順";
    state.visible = 9;
  }

  function applyPreset(name) {
    resetFilters(true);
    if (name && name.startsWith("genre:")) state.genre = name.replace(/^genre:/, "");
    if (name === "interest") { state.condition = "相談優先"; state.sort = "おすすめ順"; }
    if (name === "near") state.distance = "近場";
    if (name === "rain") state.condition = "雨の日でも使いやすい";
    if (name === "sweet") state.genre = "甘味";
    if (name === "local") state.condition = "山口らしさがある";
    if (name === "seafood") state.genre = "海鮮";
    if (name === "udon") state.genre = "うどん";
    if (name === "cafe") state.genre = "カフェ";
    if (name === "afternoon") state.genre = "アフタヌーンティー";
    if (name === "night") state.time = "夜ごはん";
    if (name === "special") state.condition = "少し特別にできる";
    renderResults();
    document.getElementById("food-library").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindEvents() {
    const bindings = {
      foodArea: "area",
      foodDistance: "distance",
      foodGenre: "genre",
      foodTime: "time",
      foodBudget: "budget",
      foodCondition: "condition",
      foodMood: "mood",
      foodSort: "sort"
    };
    Object.entries(bindings).forEach(([id, key]) => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener("change", (event) => {
        state[key] = event.target.value;
        state.visible = 9;
        renderResults();
      });
    });
    const search = document.getElementById("foodSearch");
    if (search) search.addEventListener("input", (event) => {
      state.query = event.target.value;
      state.visible = 9;
      renderResults();
    });
    const clear = document.getElementById("foodClear");
    if (clear) clear.addEventListener("click", () => { resetFilters(false); renderResults(); });
    const more = document.getElementById("foodMore");
    if (more) more.addEventListener("click", () => { state.visible += 9; renderResults(); });
    document.addEventListener("click", async (event) => {
      const preset = event.target.closest("[data-food-preset]");
      if (preset) {
        event.preventDefault();
        applyPreset(preset.dataset.foodPreset);
        if (preset.dataset.foodFocus) {
          const details = document.querySelector("#food-library .food-filter-details");
          const field = document.getElementById(preset.dataset.foodFocus);
          if (details) details.open = true;
          if (field) setTimeout(() => field.focus(), 450);
        }
        const panel = document.getElementById("menuPanel");
        const button = document.getElementById("menuButton");
        if (panel) panel.classList.remove("open");
        if (button) button.setAttribute("aria-expanded", "false");
        return;
      }
      const bridge = event.target.closest("[data-food-bridge]");
      if (bridge) {
        event.preventDefault();
        resetFilters(true);
        if (bridge.dataset.area) state.area = resolveArea(bridge.dataset.area);
        if (bridge.dataset.genre) state.genre = bridge.dataset.genre;
        renderResults();
        document.getElementById("food-library").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const copy = event.target.closest("[data-food-copy]");
      if (copy) {
        const place = places.find((item) => item.id === copy.dataset.foodCopy);
        if (!place) return;
        try {
          await navigator.clipboard.writeText(place.inviteText);
          copy.textContent = "コピーしました";
          setTimeout(() => { copy.textContent = "相談する一言をコピー"; }, 1500);
        } catch (error) {
          copy.textContent = "長押しで文を選んでください";
        }
      }
    });
  }

  function addMenuLinks() {
    const list = document.querySelector("#menuPanel .menu-list");
    if (list && !list.querySelector("[data-food-menu-group]")) {
      const fragment = document.createDocumentFragment();
      const label = document.createElement("div");
      label.className = "menu-group-label";
      label.dataset.foodMenuGroup = "shortcuts";
      label.textContent = "ご飯系";
      fragment.appendChild(label);
      [
        ["ふたり優先ごはん", "相談", "interest", ""],
        ["エリアで探す", "地域", "all", "foodArea"],
        ["ジャンルで探す", "料理", "all", "foodGenre"],
        ["予算で探す", "目安", "all", "foodBudget"],
        ["デート条件で探す", "場面", "all", "foodCondition"],
        ["近くのご飯を探す", "近場", "near", ""],
        ["雨の日ごはん", "屋内", "rain", ""],
        ["カフェ・甘味", "休憩", "sweet", ""],
        ["うどん", "軽め", "udon", ""],
        ["海鮮", "山口", "seafood", ""],
        ["アフタヌーンティー", "特別", "afternoon", ""],
        ["夜ごはん", "夕方〜", "night", ""],
        ["山口らしいごはん", "郷土", "local", ""]
      ].forEach(([name, note, preset, focus]) => {
        const link = document.createElement("a");
        link.className = "menu-link";
        link.href = "#food-library";
        link.dataset.foodPreset = preset;
        if (focus) link.dataset.foodFocus = focus;
        link.innerHTML = `<span>${name}</span><small>${note}</small>`;
        fragment.appendChild(link);
      });
      list.insertBefore(fragment, list.firstChild);
    }
    const nav = document.querySelector("#top .nav-strip");
    if (nav && !nav.querySelector('[href="#food-library"]')) {
      const link = document.createElement("a");
      link.className = "nav-pill";
      link.href = "#food-library";
      link.textContent = "ご飯処を探す";
      nav.insertBefore(link, nav.firstChild);
    }
    const sticky = document.querySelector(".sticky nav");
    if (sticky && !sticky.querySelector('[href="#food-library"]')) {
      const link = document.createElement("a");
      link.href = "#food-library";
      link.textContent = "ごはん";
      sticky.insertBefore(link, sticky.children[1] || null);
      sticky.style.gridTemplateColumns = "repeat(5,1fr)";
    }
    const quick = document.querySelector(".side-panel .desktop-panel-card:nth-child(2) ul");
    if (quick && !quick.querySelector('[href="#food-library"]')) {
      const item = document.createElement("li");
      item.innerHTML = '<a href="#food-library">ご飯処を探す</a>';
      quick.insertBefore(item, quick.firstChild);
    }
  }

  function resolveArea(value) {
    const source = String(value || "");
    const known = options.area.slice(1, -1).find((area) => source === area || source.includes(area));
    return known || "すべて";
  }

  function inferAreaForSpot(card) {
    const title = card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "";
    const fullText = card.textContent || "";
    const direct = places.find((place) => (place.nearbyDateSpots || []).some((spot) => title.includes(spot) || spot.includes(title)));
    if (direct) return direct.city;
    return resolveArea(fullText) === "すべて" ? "" : resolveArea(fullText);
  }

  function decorateSpotCards() {
    document.querySelectorAll("#spotGrid .spot").forEach((card) => {
      if (card.querySelector(".food-bridge")) return;
      const area = inferAreaForSpot(card);
      const target = card.querySelector(".meal-peek") || card.querySelector(".chips");
      if (!target || !target.parentNode) return;
      const bridge = document.createElement("div");
      bridge.className = "food-bridge";
      bridge.innerHTML = `<strong>この場所の前後に食べるなら</strong><p>${area ? `${escapeHtml(area)}の候補へ絞り込めます。` : "ご飯処ライブラリーから条件で探せます。"}</p><div class="food-bridge-actions"><button type="button" data-food-bridge="area" data-area="${escapeHtml(area)}">近くのご飯処</button><button type="button" data-food-bridge="cafe" data-area="${escapeHtml(area)}" data-genre="カフェ">近くのカフェ</button><button type="button" data-food-bridge="night" data-area="${escapeHtml(area)}" data-genre="夜ごはん">夜ごはん</button><button type="button" data-food-bridge="sweet" data-area="${escapeHtml(area)}" data-genre="甘味">甘い休憩</button></div>`;
      target.insertAdjacentElement("afterend", bridge);
    });
  }

  injectStyles();
  const section = ensureSection();
  renderShell(section);
  const filterDetails = section.querySelector(".food-filter-details");
  if (filterDetails && window.matchMedia("(min-width: 760px)").matches) filterDetails.open = true;
  const opportunityBoard = document.getElementById("opportunity-board");
  if (opportunityBoard && opportunityBoard.nextElementSibling !== section) opportunityBoard.insertAdjacentElement("afterend", section);
  bindEvents();
  addMenuLinks();
  renderResults();
  decorateSpotCards();

  const spotGrid = document.getElementById("spotGrid");
  if (spotGrid) {
    const observer = new MutationObserver(() => requestAnimationFrame(decorateSpotCards));
    observer.observe(spotGrid, { childList: true });
  }

  window.FOOD_LIBRARY_UI = {
    open: applyPreset,
    reset: () => { resetFilters(false); renderResults(); }
  };
})();
