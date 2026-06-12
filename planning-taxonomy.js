(function () {
  "use strict";

  const values = {
    season: ["春", "梅雨", "夏", "秋", "冬", "通年"],
    weather: ["晴れ", "曇り", "雨", "暑い日", "寒い日"],
    time: ["午前だけ", "昼", "夕方から", "夜だけ", "1日"],
    duration: ["ショート", "半日", "ロング"],
    indoorOutdoor: ["屋内", "屋外", "車移動中心"],
    budget: ["低", "中", "高", "特別"]
  };

  const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : String(value || "").split(/\s*[／/,・]\s*/).filter(Boolean);
  const uniq = (rows) => [...new Set(rows.filter(Boolean))];
  const textOf = (item) => [item.name, item.title, item.genre, item.category, item.period, item.reason, item.photo, item.caution, item.access, item.meta, ...(item.tags || [])].join(" ");
  const includesAny = (text, pattern) => pattern.test(text);

  function travelMinutes(item) {
    const match = String(item.travel || item.meta || "").match(/(?:片道)?約?(\d+)分/);
    return match ? Number(match[1]) : Number(item.distanceKm || 0) * 1.2 || 45;
  }

  function stayHours(item) {
    const text = String(item.stay || item.meta || "");
    const range = text.match(/(\d+)\s*[〜～-]\s*(\d+)時間/);
    if (range) return (Number(range[1]) + Number(range[2])) / 2;
    const single = text.match(/(\d+)時間/);
    return single ? Number(single[1]) : 3;
  }

  function inferSeason(item, text) {
    const explicit = asArray(item.seasonFit).filter((value) => values.season.includes(value));
    if (explicit.length) return explicit;
    const rows = [];
    if (/桜|梅(?!雨)|椿|藤|春|ひな|新緑/.test(text)) rows.push("春");
    if (/梅雨|あじさい|紫陽花|菖蒲|蛍|雨の季節/.test(text)) rows.push("梅雨");
    if (/夏|海水浴|花火|夕涼み|風穴|暑さ|七夕/.test(text)) rows.push("夏");
    if (/秋|紅葉|月見|実り|秋祭り/.test(text)) rows.push("秋");
    if (/冬|雪|イルミ|初詣|クリスマス|温泉/.test(text)) rows.push("冬");
    if (/通年|年間|いつでも/.test(text) || !rows.length) rows.push("通年");
    return uniq(rows);
  }

  function inferWeather(item, text) {
    const explicit = asArray(item.weatherFit).filter((value) => values.weather.includes(value));
    if (explicit.length) return explicit;
    const indoor = /屋内|美術|博物|展示|映画|水族館|洞窟|温泉|カフェ|レストラン/.test(text);
    const rows = [];
    if (!/雨では魅力が落ちる|晴天向き|晴れの日優先/.test(text)) rows.push("曇り");
    if (!/雨|荒天|強風で中止|雨では魅力が落ちる/.test(text) || /晴れ|海|絶景|公園|庭園|散策/.test(text)) rows.push("晴れ");
    if (indoor || /雨天|雨の日|梅雨|洞窟/.test(text)) rows.push("雨");
    if (indoor || /涼|海|水辺|夏/.test(text)) rows.push("暑い日");
    if (indoor || /温泉|冬|イルミ/.test(text)) rows.push("寒い日");
    return uniq(rows.length ? rows : ["晴れ", "曇り"]);
  }

  function inferTime(item, text) {
    const explicit = asArray(item.timeSlots).filter((value) => values.time.includes(value));
    if (explicit.length) return explicit;
    const rows = [];
    const hours = stayHours(item);
    if (/朝|午前|市場/.test(text) || hours <= 2.5) rows.push("午前だけ");
    if (!/夜のみ|夜だけ/.test(text)) rows.push("昼");
    if (/夕方|夕焼け|夕涼み|灯り|ライトアップ/.test(text)) rows.push("夕方から");
    if (/夜|星空|夜景|ライトアップ|イルミ|蛍/.test(text)) rows.push("夜だけ");
    if (hours >= 6 || travelMinutes(item) >= 90) rows.push("1日");
    return uniq(rows);
  }

  function inferDuration(item) {
    if (values.duration.includes(item.durationType)) return item.durationType;
    const total = stayHours(item) + travelMinutes(item) / 30;
    if (total <= 3.5) return "ショート";
    if (total <= 7) return "半日";
    return "ロング";
  }

  function inferIndoorOutdoor(item, text) {
    if (values.indoorOutdoor.includes(item.indoorOutdoor)) return item.indoorOutdoor;
    if (/ドライブ|車中心|車移動/.test(text)) return "車移動中心";
    if (/屋内|美術|博物|展示|映画|水族館|洞窟|温泉|カフェ|レストラン|市場/.test(text)) return "屋内";
    return "屋外";
  }

  function inferBudget(item, text) {
    if (values.budget.includes(item.budgetLevel)) return item.budgetLevel;
    if (/無料|散策は無料|参拝無料|見学は無料/.test(text) && travelMinutes(item) <= 45) return "低";
    if (/特別|記念日|コース|宿泊/.test(text) || travelMinutes(item) >= 120) return "特別";
    if (/遊覧船|ロープウェー|遠出|入館料|温泉/.test(text) || travelMinutes(item) >= 70) return "高";
    return "中";
  }

  function infer(item) {
    const text = textOf(item);
    const seasonFit = inferSeason(item, text);
    const weatherFit = inferWeather(item, text);
    const timeSlots = inferTime(item, text);
    const durationType = inferDuration(item);
    const indoorOutdoor = inferIndoorOutdoor(item, text);
    const budgetLevel = inferBudget(item, text);
    const limited = item.sourceType === "official-event" || /期間限定|開催|会期|見頃|今週|今月|季節限定|企画展|特別展/.test(text);
    const newExperience = /新体験|体験|遊覧船|工房|ワークショップ|企画展|特別展|市場|夜景|星空/.test(text);
    const outfit = item.outfit || (indoorOutdoor === "屋内"
      ? "館内の温度差に備えた羽織り。歩きやすい靴"
      : weatherFit.includes("雨")
        ? "歩きやすい靴、薄手の雨具、濡れた足元への備え"
        : "歩きやすい靴。季節に合わせた羽織りや日差し対策");
    const budgetNote = item.budgetNote || ({
      低: "交通費と飲食代を中心に調整しやすい",
      中: "交通費＋入館・体験料＋カフェ代くらい",
      高: "交通費＋有料体験＋食事代を見込む",
      特別: "遠出・特別体験として事前に総額を相談"
    })[budgetLevel];
    const missRisk = item.missRisk || (limited ? "高" : seasonFit.includes("通年") ? "低" : "中");
    const missReason = item.missReason || (limited
      ? item.period || "期間限定・見頃・開催日を公式情報で確認"
      : seasonFit.includes("通年") ? "通年候補なので、天気と気分を優先できる" : `${seasonFit.join("・")}らしい景色を見やすい時期`);
    const mannerismAvoidance = item.mannerismAvoidance || (newExperience ? "高" : /展示|美術|博物|市場|夜|船|体験/.test(text) ? "中" : "低");
    const mannerismReason = item.mannerismReason || (newExperience
      ? "見るだけで終わらない体験や、普段と違う時間帯を組み込みやすい"
      : /展示|美術|博物/.test(text) ? "屋内鑑賞と食事を組み合わせ、散歩中心の日と変化を付けられる" : "食事や時間帯を変えると、同じ地域でも違う過ごし方にできる");
    const inviteText = item.inviteText || item.invites?.[0] || `「${item.name || item.title}」、写真の雰囲気が良さそう。次の休みの候補にしてみない？`;
    return {
      seasonFit,
      weatherFit,
      timeSlots,
      durationType,
      indoorOutdoor,
      outfit,
      budgetLevel,
      budgetNote,
      missRisk,
      missReason,
      mannerismAvoidance,
      mannerismReason,
      inviteText,
      quickTags: uniq([
        item.nearby || travelMinutes(item) <= 45 ? "近場" : "遠出",
        weatherFit.includes("雨") ? "雨の日" : "",
        item.food || item.meals?.length ? "食事" : "",
        /会話|静か|ゆっくり|落ち着/.test(text) ? "会話重視" : "",
        newExperience ? "新体験" : "",
        durationType === "ショート" || travelMinutes(item) <= 45 ? "負担軽め" : ""
      ])
    };
  }

  function augment(item) {
    if (!item || typeof item !== "object") return item;
    const inferred = infer(item);
    Object.entries(inferred).forEach(([key, value]) => {
      if (item[key] == null || item[key] === "" || (Array.isArray(item[key]) && !item[key].length)) item[key] = value;
    });
    return item;
  }

  function augmentPlannerData(data) {
    data?.days?.forEach((day) => day.spots?.forEach(augment));
    return data;
  }

  window.DATE_PLANNING_TAXONOMY = { values, infer, augment, augmentPlannerData, travelMinutes, stayHours };
  augmentPlannerData(window.DATE_PLANNER_DATA);
})();
