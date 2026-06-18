(function () {
  "use strict";

  const UPDATED_AT = "2026-06-18";
  const planner = window.DATE_PLANNER_DATA || {};
  const referenceMeals = planner.referenceMeals || {};

  const areaProfiles = {
    nagato_yumoto: { area: "長門市", city: "長門市", minutes: 35, nearby: ["長門湯本温泉"], setting: "温泉街" },
    hagi_castle: { area: "萩市", city: "萩市", minutes: 10, nearby: ["萩城跡・指月公園", "萩博物館"], setting: "城下町" },
    hagi_castle_town: { area: "萩市", city: "萩市", minutes: 10, nearby: ["萩城下町", "萩・明倫学舎"], setting: "城下町" },
    akiyoshido: { area: "美祢市", city: "美祢市", minutes: 50, nearby: ["秋芳洞"], setting: "カルスト" },
    akiyoshidai: { area: "美祢市", city: "美祢市", minutes: 50, nearby: ["秋吉台"], setting: "カルスト" },
    beppu_bentenike: { area: "美祢市", city: "美祢市", minutes: 45, nearby: ["別府弁天池"], setting: "湧水地" },
    karato_market: { area: "下関市", city: "下関市", minutes: 110, nearby: ["唐戸市場", "海響館", "カモンワーフ"], setting: "港町" },
    kintaikyo: { area: "岩国市", city: "岩国市", minutes: 150, nearby: ["錦帯橋", "吉香公園"], setting: "歴史景観" },
    motonosumi: { area: "長門市", city: "長門市", minutes: 60, nearby: ["元乃隅神社", "青海島", "仙崎"], setting: "海辺" }
  };

  const excludedNames = new Set([
    "カモンワーフ ふく料理系店舗",
    "カモンワーフ内 カフェ・スイーツ系店舗",
    "カモンワーフ内 洋食・焼肉・寿司店舗",
    "カモンワーフ内 気軽に入れる店舗",
    "岩国寿司を出す錦帯橋周辺店舗",
    "岩国観光公式 特産・グルメ案内",
    "橋の駅 錦帯橋 展望市場の軽食",
    "仙崎イカ",
    "Benten Blue + 美祢市養鱒場"
  ]);

  const specialNames = new Set([
    "割烹 千代",
    "割烹 いちはな",
    "お食事処 兆",
    "国際ホテル宇部 創作ダイニング カメリア",
    "山口グランドホテル レストラン アゼィリア",
    "湯田温泉 ユウベルホテル松政",
    "創作地中海レストラン ソル・ポニエンテ",
    "le cocon 料理工房",
    "紫水園",
    "花水木（芳山園内）",
    "お肉バルうに 宇部新川駅前店",
    "よしくに"
  ]);
  const quietNames = new Set([
    "ギャラリーカフェ 藍場川の家",
    "cafe&pottery 音",
    "cafe and shop Tre",
    "Arbòreo",
    "フタマタセコーヒー",
    "山口グランドホテル ティーラウンジ",
    "ウィーン菓子 ティーゲベック",
    "海と夕陽のカフェ ソル・ポニエンテ",
    "le cocon 料理工房",
    "足湯カフェ（湯や 晴ル音）",
    "cafe Katsuura"
  ]);
  const localNames = new Set([
    "瓦そば柳屋",
    "城跡ながお",
    "萩心海、",
    "安富屋",
    "唐戸市場・活きいき馬関街",
    "カモンワーフ",
    "カフェいつつばし",
    "割烹 いちはな",
    "お食事処 兆",
    "回転寿司 たかくら",
    "湯田温泉 ユウベルホテル松政",
    "自然薯専門店 はなたかめん",
    "宇部名物 宇部ホルモン",
    "やまぐち酒場 一代目 豊"
  ]);

  function normalizeName(value) {
    return String(value || "").toLowerCase().replace(/[\s、・／/（）()]+/g, "");
  }

  function makeId(name, index) {
    const ascii = String(name || "food")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return ascii ? `food-${ascii}` : `food-place-${index + 1}`;
  }

  function distanceLabel(minutes) {
    if (minutes <= 20) return "近場";
    if (minutes <= 45) return "軽い遠出";
    if (minutes <= 90) return "半日遠出";
    return "ロング遠出";
  }

  function deriveGenres(meal, profile) {
    const text = `${meal.category || ""} ${meal.kind || ""} ${meal.name || ""}`;
    const genres = [];
    const add = (label) => { if (!genres.includes(label)) genres.push(label); };
    if (/海鮮|魚介|魚|ふく|イカ/.test(text)) add("海鮮");
    if (/ご当地|瓦そば|岩国寿司|天神鱧/.test(text) || localNames.has(meal.name)) add("郷土料理");
    if (/和食|割烹|料亭|定食|魚介/.test(text)) add("和食");
    if (/洋食|ダイニング/.test(text)) add("洋食");
    if (/イタリアン|ピザ|パスタ/.test(text)) add("イタリアン");
    if (/カフェ|cafe|coffee|喫茶/i.test(text)) add("カフェ");
    if (/アフタヌーンティー|Afternoon Tea|ハイティー|ティーセット/i.test(text)) add("アフタヌーンティー");
    if (/ティーラウンジ|ロビーラウンジ|ホテルラウンジ/.test(text)) add("ホテルラウンジ");
    if (/紅茶|喫茶/.test(text)) add("喫茶店");
    if (/甘味|和菓子|どら焼き|ケーキ|スイーツ|芋/.test(text)) add("甘味");
    if (/ケーキ|スイーツ|どら焼き|和菓子|芋/.test(text)) add("スイーツ");
    if (/軽食|サンド|テイクアウト/.test(text)) add("軽食");
    if (/テイクアウト/.test(text)) add("テイクアウト");
    if (/市場/.test(text)) add("市場");
    if (/温泉/.test(profile.setting) || profile.area === "長門市" && /湯本|温泉/.test((profile.nearby || []).join(" "))) add("温泉街ごはん");
    if (/道の駅|センザキッチン/.test(text)) add("道の駅・直売所");
    if (/居酒屋|バー|焼鳥|軽食/.test(text)) add("ファミレス・気軽な食事");
    if (specialNames.has(meal.name) || /割烹|料亭|ホテル/.test(text)) add("記念日・少し特別");
    if (/夜|夕食|居酒屋|バー|焼鳥/.test(text)) add("夜ごはん");
    if (/ホテル|旅館/.test(text)) add("旅館・ホテルごはん");
    if (/パン|BAKERY/i.test(text)) add("パン");
    if (/ラーメン/.test(text)) add("ラーメン");
    if (/うどん/.test(text)) add("うどん");
    if (/そば/.test(text) && !/瓦そば/.test(text)) add("そば");
    if (/焼鳥|焼き鳥/.test(text)) add("焼き鳥");
    if (/焼肉/.test(text)) add("焼肉");
    if (/定食/.test(text)) add("定食");
    if (/寿司|すし/.test(text)) add("寿司");
    if (/カレー|Curry/i.test(text)) add("カレー");
    if (/中華/.test(text)) add("中華");
    if (!genres.length) add("和食");
    return genres;
  }

  function deriveTimeSlots(meal, genres) {
    const text = `${meal.kind || ""} ${meal.name || ""}`;
    const slots = [];
    const add = (label) => { if (!slots.includes(label)) slots.push(label); };
    if (/朝|パン|BAKERY/i.test(text)) { add("朝"); add("午前だけ"); }
    if (/昼食|ランチ|定食|うどん|そば|市場/.test(text) || !/夜|夕食|バー/.test(text)) add("ランチ");
    if (genres.some((genre) => ["カフェ", "甘味", "スイーツ", "喫茶店", "ホテルラウンジ"].includes(genre))) { add("カフェ"); add("短時間休憩"); add("午後だけ"); }
    if (/夕食|夜|居酒屋|バー|焼鳥/.test(text) || genres.includes("夜ごはん")) { add("夕方"); add("夜ごはん"); add("夕方から"); add("夜だけ"); }
    if (/バー/.test(text)) add("デート後の締め");
    if (!slots.length) add("ランチ");
    return slots;
  }

  function deriveBudget(meal, genres) {
    const text = `${meal.kind || ""} ${meal.name || ""}`;
    if (specialNames.has(meal.name) || /料亭|割烹 千代/.test(text)) return "高";
    if (/バー|イタリアン|ダイニング|ホテル|旅館/.test(text)) return "中";
    if (genres.some((genre) => ["軽食", "テイクアウト", "パン", "うどん", "甘味"].includes(genre))) return "低";
    return "中";
  }

  function budgetNote(level) {
    const guide = {
      低: "1人2,000円以内を考えやすい価格帯の目安。注文内容と最新料金は公式で要確認。",
      中: "1人2,000〜6,000円を考えやすい価格帯の目安。注文内容と最新料金は公式で要確認。",
      高: "1人6,000〜15,000円を含む可能性がある目安。コース・注文内容と最新料金は公式で要確認。",
      特別: "1人15,000円以上になる場合もある特別利用の目安。予約時に公式で要確認。"
    };
    return guide[level] || guide.中;
  }

  function deriveDateFit(meal, profile, genres, slots) {
    const fit = ["写真で雰囲気が伝わる"];
    const text = `${meal.kind || ""} ${meal.reason || ""} ${meal.name || ""}`;
    const add = (label) => { if (!fit.includes(label)) fit.push(label); };
    if (genres.some((genre) => ["カフェ", "甘味", "喫茶店", "ホテルラウンジ"].includes(genre))) {
      add("歩き疲れた後に使いやすい"); add("雨の日の屋内休憩"); add("短時間でも使える"); add("甘い休憩");
    }
    if (quietNames.has(meal.name) || /落ち着|静か|川沿い|洋館/.test(text)) add("静かに話しやすい");
    if (specialNames.has(meal.name) || genres.includes("記念日・少し特別")) { add("少し特別にできる"); add("予約した方がよい"); }
    if (slots.includes("夜ごはん")) add("夕方からでも使える");
    if (slots.includes("午前だけ")) add("午前だけでも使える");
    if (profile.minutes <= 20) add("近場で安心"); else { add("ロングデートの途中に使える"); add("遠出のごほうび"); }
    if (localNames.has(meal.name) || genres.includes("郷土料理")) add("山口らしさがある");
    add("駐車場確認が必要");
    if (/市場|人気|混/.test(text)) add("混雑注意");
    add("雨の日でも使いやすい"); add("暑い日でも使いやすい"); add("寒い日でも使いやすい");
    return fit;
  }

  function deriveMood(meal, genres, profile) {
    const moods = [];
    const add = (label) => { if (!moods.includes(label)) moods.push(label); };
    if (quietNames.has(meal.name) || genres.includes("カフェ")) add("ゆっくり話したい");
    if (genres.some((genre) => ["甘味", "スイーツ"].includes(genre))) add("甘いものを食べたい");
    if (genres.includes("郷土料理")) add("山口らしいものを食べたい");
    if (genres.includes("海鮮")) add("海鮮を食べたい");
    if (genres.includes("うどん")) add("うどんを食べたい");
    if (genres.includes("カフェ")) add("カフェに行きたい");
    if (genres.includes("アフタヌーンティー")) add("アフタヌーンティーに行きたい");
    if (genres.some((genre) => ["軽食", "テイクアウト", "パン", "うどん", "そば", "ラーメン", "定食"].includes(genre))) add("軽く済ませたい");
    if (genres.some((genre) => ["記念日・少し特別", "焼肉", "旅館・ホテルごはん", "ホテルラウンジ"].includes(genre))) add("少し特別にしたい");
    if (profile.minutes <= 20) add("近場で安心したい"); else add("遠出のごほうびにしたい");
    if (genres.includes("夜ごはん")) add("夜ごはんを楽しみたい");
    add("雨の日に落ち着きたい"); add("休憩を優先したい"); add("写真で雰囲気を見て決めたい");
    return moods;
  }

  function inviteFor(meal, genres) {
    if (genres.includes("アフタヌーンティー")) return "ここ、アフタヌーンティーの候補に入れてみたい。どうかな？";
    if (genres.includes("甘味") || genres.includes("スイーツ")) return "甘い休憩でここに寄る候補、どうかな？";
    if (genres.includes("ラーメン")) return "今日はラーメンで軽く夜ごはんにする案も良さそう。どうかな？";
    if (genres.includes("中華")) return "中華でランチか夜ごはんにする候補、どうかな？";
    if (genres.includes("焼肉")) return "肉系で少し雰囲気を変える候補にしてみたい。どうかな？";
    if (genres.includes("うどん")) return "ここでうどんを軽く食べる案も良さそう。どうかな？";
    if (genres.includes("海鮮")) return "この辺まで行くなら、海鮮を食べる候補にここを入れてみたい。どうかな？";
    if (genres.includes("記念日・少し特別")) return "少し特別にしたい日に、ここを候補にしてみたい。どうかな？";
    if (genres.includes("カフェ")) return "ここ、カフェ休憩で寄るのも良さそう。どうかな？";
    if (genres.includes("夜ごはん")) return "この日の夜ごはん候補に、ここも入れてみたい。どうかな？";
    return "ここ、ランチか休憩の候補に入れてみたい。どうかな？";
  }

  function makePlace(meal, profile, index, override) {
    const merged = Object.assign({}, meal, override || {});
    const genres = merged.genre || deriveGenres(merged, profile);
    const timeSlots = merged.timeSlots || deriveTimeSlots(merged, genres);
    const budgetLevel = merged.budgetLevel || deriveBudget(merged, genres);
    const minutes = Number(merged.minutes || profile.minutes || 60);
    const dateFit = merged.dateFit || deriveDateFit(merged, Object.assign({}, profile, { minutes }), genres, timeSlots);
    const moodFit = merged.moodFit || deriveMood(merged, genres, Object.assign({}, profile, { minutes }));
    return {
      id: merged.id || makeId(merged.name, index),
      name: merged.name,
      area: merged.area || profile.area,
      city: merged.city || profile.city,
      genre: genres,
      timeSlots,
      budgetLevel,
      budgetNote: merged.budgetNote || budgetNote(budgetLevel),
      distanceFromHagiAtlas: {
        label: merged.distanceLabel || distanceLabel(minutes),
        minutes,
        note: `萩市アトラス付近から車で約${minutes}分目安。道路状況で変動。`
      },
      dateFit,
      moodFit,
      weatherFit: merged.weatherFit || ["雨", "曇り", "暑い日", "寒い日"],
      parking: merged.parking || "台数・利用条件は公式で要確認",
      reservation: merged.reservation || (dateFit.includes("予約した方がよい") ? "週末や特別利用は事前確認推奨" : "混雑日や夜利用は事前確認推奨"),
      businessHoursNote: "営業時間・定休日・臨時休業は公式情報で要確認",
      caution: merged.cautionPublic || "週末の混雑、駐車場、売り切れ、臨時休業を事前確認",
      sourceUrl: merged.sourceUrl || merged.url,
      photoUrl: merged.photoUrl || "",
      photoNote: merged.photoNote || "公式・観光案内ページで料理、店内、周辺の雰囲気を確認できる",
      nearbyDateSpots: merged.nearbyDateSpots || profile.nearby || [],
      whyForDate: merged.whyForDate || merged.reason || `${profile.setting}のデート前後に食事や休憩を足しやすい。`,
      inviteText: merged.inviteText || inviteFor(merged, genres),
      verificationNote: `最終整理日は${UPDATED_AT}。営業状況・料金・予約条件は公式で要確認。`
    };
  }

  const collected = [];
  Object.entries(referenceMeals).forEach(([sourceKey, meals]) => {
    const profile = areaProfiles[sourceKey];
    if (!profile || !Array.isArray(meals)) return;
    meals.forEach((meal) => {
      if (!meal || !meal.name || !meal.url || excludedNames.has(meal.name)) return;
      collected.push({ meal, profile });
    });
  });

  const additions = [
    {
      meal: { name: "フタマタセコーヒー", kind: "カフェ/スイーツ/コーヒー", url: "https://ube-kankou.or.jp/eat/lunch/post-5.html", reason: "自然を眺めながらコーヒーや甘い休憩を入れやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 100, nearby: ["ときわ公園", "宇部市街"], setting: "自然と市街" },
      override: { genre: ["カフェ", "甘味", "スイーツ", "喫茶店"], timeSlots: ["ランチ", "カフェ", "短時間休憩", "午後だけ"], budgetLevel: "低", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認" }
    },
    {
      meal: { name: "国際ホテル宇部 創作ダイニング カメリア", kind: "ホテルダイニング/ランチ/夜ごはん", url: "https://ube-kankou.or.jp/eat/grumet/camellia.html", reason: "屋内でゆっくり食事を組みやすく、少し特別な日にも合わせやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["ときわ公園", "宇部市街"], setting: "ホテル" },
      override: { genre: ["洋食", "旅館・ホテルごはん", "記念日・少し特別", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "中", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認" }
    },
    {
      meal: { name: "そば処 武蔵野", kind: "そば/ランチ/夜ごはん", url: "https://ube-kankou.or.jp/eat/grumet/musashino.html", reason: "遠出の途中に落ち着いた和食を入れたい日に使いやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["そば", "和食", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "低" }
    },
    {
      meal: { name: "拉麺・飲茶・酒家 るいるい軒", kind: "ラーメン/飲茶/中華/夜ごはん", url: "https://ube-kankou.or.jp/eat/grumet/ruiruiken.html", reason: "ラーメンだけでなく点心や一品料理もあり、夜の軽めごはん候補にしやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["宇部新川駅", "ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["ラーメン", "中華", "軽食", "夜ごはん", "ファミレス・気軽な食事"], timeSlots: ["夕方", "夜ごはん", "夕方から", "夜だけ", "デート後の締め"], budgetLevel: "低", parking: "駐車場、近隣コインパーキング、深夜利用条件は公式で要確認", reservation: "営業時間、休日、混雑は公式で要確認", photoNote: "観光協会ページでラーメンと店舗写真を確認できる" }
    },
    {
      meal: { name: "中国料理 敦煌 山口宇部店", kind: "中華/ランチ/夜ごはん/テイクアウト", url: "https://ube-kankou.or.jp/eat/grumet/ma-3.html", reason: "中華を食べたい日や、雨の日の屋内ランチ・夜ごはんに切り替えやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["宇部新川駅", "ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["中華", "テイクアウト", "夜ごはん", "ファミレス・気軽な食事"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "中", parking: "駐車場、ビル内利用条件は公式で要確認", reservation: "ランチ・コース・夜利用は事前確認推奨", photoNote: "観光協会ページで中国料理と店内写真を確認できる" }
    },
    {
      meal: { name: "宇部名物 宇部ホルモン", kind: "ホルモン/焼肉/郷土料理/夜ごはん", url: "https://ube-kankou.or.jp/eat/grumet/ma-1.html", reason: "山口らしさと夜ごはんの変化を出したい日に、ホルモン・焼肉系として候補にしやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["宇部新川駅", "ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["焼肉", "郷土料理", "夜ごはん", "ファミレス・気軽な食事"], timeSlots: ["夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "中", parking: "駐車場、近隣コインパーキング、混雑は公式で要確認", reservation: "夜利用は事前確認推奨", photoNote: "観光協会ページで宇部ホルモンと店舗写真を確認できる" }
    },
    {
      meal: { name: "食堂わかば", kind: "朝ごはん/定食/和食/ランチ", url: "https://ube-kankou.or.jp/eat/grumet/ma-6.html", reason: "朝から昼までの軽い食事や定食を、遠出前後に無理なく入れやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 100, nearby: ["宇部市役所", "ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["定食", "和食", "朝ごはん", "ファミレス・気軽な食事"], timeSlots: ["朝", "午前だけ", "ランチ"], budgetLevel: "低", parking: "市役所周辺の駐車場・利用条件は公式で要確認", reservation: "営業日、土日祝の扱い、利用条件は公式で要確認", photoNote: "観光協会ページで定食と眺望のある食堂の雰囲気を確認できる" }
    },
    {
      meal: { name: "カジュアルレストラン ダグアウト", kind: "洋食/定食/ランチ/夜ごはん", url: "https://ube-kankou.or.jp/eat/grumet/dugout.html", reason: "洋食や定食寄りの気軽なごはんで、海鮮・カフェ続きの日に変化を出せる。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["山口大学医学部附属病院周辺", "ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["洋食", "定食", "夜ごはん", "ファミレス・気軽な食事"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "中", parking: "駐車場、混雑、週末営業は公式で要確認", reservation: "ランチ・夜利用は事前確認推奨", photoNote: "観光協会ページでカジュアルな洋食レストランの写真を確認できる" }
    },
    {
      meal: { name: "お肉バルうに 宇部新川駅前店", kind: "肉バル/洋食/夜ごはん/ランチ", url: "https://ube-kankou.or.jp/eat/grumet/uni.html", reason: "海鮮や和食ではなく、肉料理で少し賑やかにしたい日に候補にしやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 105, nearby: ["宇部新川駅", "ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["洋食", "夜ごはん", "記念日・少し特別", "焼肉"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "中", parking: "駐車場、近隣コインパーキング、混雑は公式で要確認", reservation: "週末や夜利用は事前確認推奨", photoNote: "観光協会ページで肉料理と店内の雰囲気を確認できる" }
    },
    {
      meal: { name: "モッチモ・パスタ宇部店", kind: "イタリアン/パスタ/ランチ/夜ごはん", url: "https://ube-kankou.or.jp/eat/grumet/mocchimo.html", reason: "パスタやバケットで、和食・海鮮と違う洋食デートにしやすい。" },
      profile: { area: "宇部市", city: "宇部市", minutes: 100, nearby: ["ときわ公園", "宇部市街"], setting: "市街" },
      override: { genre: ["イタリアン", "洋食", "軽食", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "中", parking: "駐車場、混雑、夜営業は公式で要確認", reservation: "週末や夜利用は事前確認推奨", photoNote: "観光協会ページで生パスタと店舗写真を確認できる" }
    },
    {
      meal: { name: "割烹 いちはな", kind: "割烹/和食/天神鱧", url: "https://tenjin-hamo.visit-hofu.jp/ichihana2/", reason: "防府らしい旬の料理を、少し特別な食事として相談しやすい。" },
      profile: { area: "防府市", city: "防府市", minutes: 85, nearby: ["防府天満宮", "毛利氏庭園"], setting: "歴史の町" },
      override: { genre: ["郷土料理", "和食", "海鮮", "記念日・少し特別", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "高", reservation: "旬の料理や週末利用は事前確認推奨" }
    },
    {
      meal: { name: "お食事処 兆", kind: "和食/天神鱧/ホテルごはん", url: "https://tenjin-hamo.visit-hofu.jp/kizashi2/", reason: "防府の旬を入れたランチや夜ごはんを、屋内中心で組みやすい。" },
      profile: { area: "防府市", city: "防府市", minutes: 85, nearby: ["防府天満宮", "毛利氏庭園"], setting: "ホテル" },
      override: { genre: ["郷土料理", "和食", "海鮮", "旅館・ホテルごはん", "記念日・少し特別", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "中", reservation: "旬の料理や週末利用は事前確認推奨" }
    },
    {
      meal: { name: "山口グランドホテル ティーラウンジ", kind: "ホテルラウンジ/ティーラウンジ/カフェ/喫茶", url: "https://ygh.co.jp/restaurants/rounge/", reason: "新山口駅近くで待ち合わせや短い休憩に使いやすいホテルラウンジ。" },
      profile: { area: "山口市", city: "山口市", minutes: 80, nearby: ["新山口駅", "湯田温泉", "山口市中心部"], setting: "ホテルラウンジ" },
      override: { genre: ["ホテルラウンジ", "カフェ", "喫茶店", "甘味"], timeSlots: ["カフェ", "短時間休憩", "午後だけ"], budgetLevel: "中", parking: "ホテル駐車場の利用条件は公式で要確認", reservation: "営業時間、休業日、席の利用条件は公式で要確認", photoNote: "公式ページで新山口駅を見渡せるラウンジ空間を確認できる" }
    },
    {
      meal: { name: "山口グランドホテル レストラン アゼィリア", kind: "ホテルダイニング/イタリアン/フレンチ/ランチ/ディナー", url: "https://ygh.co.jp/restaurants/azalea/", reason: "駅近ホテルの屋内レストランで、ランチから少し特別な食事まで組みやすい。" },
      profile: { area: "山口市", city: "山口市", minutes: 80, nearby: ["新山口駅", "湯田温泉", "山口市中心部"], setting: "ホテル" },
      override: { genre: ["洋食", "イタリアン", "旅館・ホテルごはん", "記念日・少し特別", "夜ごはん"], timeSlots: ["朝", "ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "中", parking: "ホテル駐車場の利用条件は公式で要確認", reservation: "週末やディナー利用は事前確認推奨", photoNote: "公式ページでホテルレストランの料理と店内写真を確認できる" }
    },
    {
      meal: { name: "回転寿司 たかくら", kind: "寿司/海鮮/長州海鮮まぶし/ランチ/夜ごはん", url: "https://yamaguchi-city.jp/sin-gourmet/", reason: "山口市の新ご当地グルメ掲載店。海鮮を気軽に相談しやすい。" },
      profile: { area: "山口市", city: "山口市", minutes: 80, nearby: ["新山口駅", "湯田温泉", "山口市中心部"], setting: "市街" },
      override: { genre: ["寿司", "海鮮", "郷土料理", "和食", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "中", reservation: "混雑日や夜利用は事前確認推奨", photoNote: "山口市観光情報サイトで新ご当地グルメの写真と掲載店を確認できる" }
    },
    {
      meal: { name: "湯田温泉 ユウベルホテル松政", kind: "ホテル/旅館ごはん/長州海鮮うにしゃぶ/ランチ/夜ごはん", url: "https://yamaguchi-city.jp/sin-gourmet/", reason: "湯田温泉方面で、山口らしい海鮮系の特別感を足したい日に候補にできる。" },
      profile: { area: "山口市", city: "山口市", minutes: 75, nearby: ["湯田温泉", "山口県立美術館", "瑠璃光寺五重塔"], setting: "温泉街" },
      override: { genre: ["旅館・ホテルごはん", "海鮮", "郷土料理", "和食", "記念日・少し特別", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "高", reservation: "料理内容、提供日、予約可否は公式で要確認", photoNote: "山口市観光情報サイトで新ご当地グルメの写真と掲載店を確認できる" }
    },
    {
      meal: { name: "ウィーン菓子 ティーゲベック", kind: "喫茶店/スイーツ/ケーキ/紅茶/テイクアウト", url: "https://sanyoonoda-kanko.com/spot/teegeback-2", reason: "本格的なウィーン菓子を、甘い休憩や写真で選ぶ候補にしやすい。" },
      profile: { area: "山陽小野田市", city: "山陽小野田市", minutes: 100, nearby: ["きららビーチ焼野", "竜王山公園", "花の海"], setting: "市街" },
      override: { genre: ["カフェ", "喫茶店", "甘味", "スイーツ", "テイクアウト"], timeSlots: ["カフェ", "短時間休憩", "午後だけ"], budgetLevel: "低", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認", reservation: "席数や休業日は公式で要確認", photoNote: "観光協会ページでケーキ、ドリンク、店内写真を確認できる" }
    },
    {
      meal: { name: "海と夕陽のカフェ ソル・ポニエンテ", kind: "カフェ/スイーツ/ランチ/海辺", url: "https://sanyoonoda-kanko.com/spot/cafe_sol-poniente", reason: "きららビーチ焼野の海と夕陽を見ながら、ランチや甘い休憩を足せる。" },
      profile: { area: "山陽小野田市", city: "山陽小野田市", minutes: 105, nearby: ["きららビーチ焼野", "竜王山公園", "花の海"], setting: "海辺" },
      override: { genre: ["カフェ", "甘味", "スイーツ", "洋食", "軽食"], timeSlots: ["ランチ", "カフェ", "短時間休憩", "午後だけ"], budgetLevel: "中", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認", reservation: "週末や夕景時間帯は混雑確認推奨", photoNote: "観光協会ページで海を望むガラス張りのカフェとスイーツ写真を確認できる" }
    },
    {
      meal: { name: "創作地中海レストラン ソル・ポニエンテ", kind: "創作地中海/イタリアン/海辺/ランチ/ディナー", url: "https://sanyoonoda-kanko.com/spot/sol-poniente", reason: "海辺の景色と料理を合わせ、遠出のごほうび感を出しやすい。" },
      profile: { area: "山陽小野田市", city: "山陽小野田市", minutes: 105, nearby: ["きららビーチ焼野", "竜王山公園", "花の海"], setting: "海辺" },
      override: { genre: ["洋食", "イタリアン", "海鮮", "記念日・少し特別", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から", "夜だけ"], budgetLevel: "中", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認", reservation: "週末、ディナー、夕景時間帯は事前確認推奨", photoNote: "観光協会ページで海辺のレストラン外観、料理、夕景の雰囲気を確認できる" }
    },
    {
      meal: { name: "le cocon 料理工房", kind: "洋食/フレンチ/完全予約制/ランチ/ディナー", url: "https://sanyoonoda-kanko.com/spot/lecocon", reason: "予約して静かに味わうタイプの食事で、特別な日の候補にしやすい。" },
      profile: { area: "山陽小野田市", city: "山陽小野田市", minutes: 105, nearby: ["きららビーチ焼野", "竜王山公園", "花の海"], setting: "静かなレストラン" },
      override: { genre: ["洋食", "記念日・少し特別", "夜ごはん"], timeSlots: ["ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "高", reservation: "完全予約制。営業日、時間、予約方法は公式で要確認", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認", photoNote: "観光協会ページで料理と落ち着いた店内の雰囲気を確認できる" }
    },
    {
      meal: { name: "らいおん亭", kind: "定食/朝ごはん/うどん/そば/夜ごはん", url: "https://sanyoonoda-kanko.com/spot/raiontei", reason: "朝から使える定食・うどん系で、遠出中に気軽な食事を入れやすい。" },
      profile: { area: "山陽小野田市", city: "山陽小野田市", minutes: 100, nearby: ["きららビーチ焼野", "竜王山公園", "花の海"], setting: "市場近く" },
      override: { genre: ["定食", "和食", "うどん", "そば", "朝ごはん", "夜ごはん", "ファミレス・気軽な食事"], timeSlots: ["朝", "午前だけ", "ランチ", "夕方", "夜ごはん", "夕方から"], budgetLevel: "低", parking: "観光協会掲載では駐車場案内あり。最新条件は公式で要確認", reservation: "営業時間、夜営業、不定休は公式SNS等で要確認", photoNote: "観光協会ページで定食、うどん、店内の気軽な雰囲気を確認できる" }
    },
    {
      meal: { name: "紫水園", kind: "旅館・ホテルごはん/温泉/和食/ランチ", url: "https://visit-shunan.com/yuno-meal-cafe/", reason: "湯野温泉の高台にある温泉宿で、食事と温泉を合わせる遠出候補にできる。" },
      profile: { area: "周南市", city: "周南市", minutes: 135, nearby: ["湯野温泉", "永源山公園", "周南市街"], setting: "温泉街" },
      override: { genre: ["旅館・ホテルごはん", "温泉街ごはん", "和食", "記念日・少し特別"], timeSlots: ["ランチ", "午後だけ"], budgetLevel: "中", parking: "周南市観光ページでは駐車場あり。最新条件は公式で要確認", reservation: "料理、温泉セット、利用条件は公式で要確認", photoNote: "周南市観光ページで温泉宿と料理利用の雰囲気を確認できる" }
    },
    {
      meal: { name: "花水木（芳山園内）", kind: "旅館・ホテルごはん/温泉/レストラン/ランチ", url: "https://visit-shunan.com/yuno-meal-cafe/", reason: "湯野温泉の旅館内レストランで、屋内中心の落ち着いた食事にしやすい。" },
      profile: { area: "周南市", city: "周南市", minutes: 135, nearby: ["湯野温泉", "永源山公園", "周南市街"], setting: "温泉街" },
      override: { genre: ["旅館・ホテルごはん", "温泉街ごはん", "和食", "記念日・少し特別"], timeSlots: ["ランチ", "午後だけ"], budgetLevel: "中", parking: "周南市観光ページでは駐車場あり。最新条件は公式で要確認", reservation: "週末や食事利用は事前確認推奨", photoNote: "周南市観光ページで旅館内レストランの雰囲気を確認できる" }
    },
    {
      meal: { name: "自然薯専門店 はなたかめん", kind: "自然薯/郷土料理/和食/スイーツ/ランチ", url: "https://visit-shunan.com/yuno-meal-cafe/", reason: "自然薯料理やスイーツで、山口らしさのある食事候補にしやすい。" },
      profile: { area: "周南市", city: "周南市", minutes: 135, nearby: ["湯野温泉", "永源山公園", "周南市街"], setting: "温泉街" },
      override: { genre: ["郷土料理", "和食", "甘味", "スイーツ"], timeSlots: ["ランチ", "カフェ", "短時間休憩", "午後だけ"], budgetLevel: "中", parking: "周南市観光ページでは駐車場あり。最新条件は公式で要確認", reservation: "営業日、提供内容、混雑は公式で要確認", photoNote: "周南市観光ページで自然薯料理と店舗の雰囲気を確認できる" }
    },
    {
      meal: { name: "足湯カフェ（湯や 晴ル音）", kind: "足湯カフェ/カフェ/温泉街ごはん/ランチ", url: "https://visit-shunan.com/yuno-meal-cafe/", reason: "足湯とカフェ休憩を一緒にでき、遠出中の休憩地点として相談しやすい。" },
      profile: { area: "周南市", city: "周南市", minutes: 135, nearby: ["湯野温泉", "永源山公園", "周南市街"], setting: "温泉街" },
      override: { genre: ["カフェ", "温泉街ごはん", "甘味", "軽食"], timeSlots: ["ランチ", "カフェ", "短時間休憩", "午後だけ"], budgetLevel: "低", parking: "周南市観光ページでは駐車場あり。最新条件は公式で要確認", reservation: "営業日、足湯利用、混雑は公式で要確認", photoNote: "周南市観光ページで足湯カフェの外観と休憩の雰囲気を確認できる" }
    },
    {
      meal: { name: "cafe Katsuura", kind: "カフェ/カフェレストラン/森/ランチ", url: "https://visit-shunan.com/meal-cafe/", reason: "森の雰囲気を見ながら、鹿野方面の静かなランチやカフェ休憩にしやすい。" },
      profile: { area: "周南市", city: "周南市", minutes: 125, nearby: ["鹿野", "漢陽寺", "永源山公園"], setting: "里山" },
      override: { genre: ["カフェ", "洋食", "軽食"], timeSlots: ["ランチ", "カフェ", "短時間休憩", "午後だけ"], budgetLevel: "中", parking: "周南市観光ページでは駐車場あり。最新条件は公式で要確認", reservation: "営業日、混雑、臨時休業は公式または観光情報で要確認", photoNote: "周南市観光ページで森の特等席として紹介されるカフェの雰囲気を確認できる" }
    }
  ];

  additions.forEach((item) => collected.push(item));

  const seen = new Map();
  collected.forEach((item, index) => {
    const key = normalizeName(item.meal.name);
    if (!key || seen.has(key)) return;
    seen.set(key, makePlace(item.meal, item.profile, index, item.override));
  });

  window.FOOD_LIBRARY_DATA = {
    updatedAt: UPDATED_AT,
    sourcePolicy: "営業時間・定休日・価格・提供期間・予約条件は変わる可能性があるため、公式または信頼できる情報源で要確認。",
    places: Array.from(seen.values())
  };
})();
