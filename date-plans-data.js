// Add one object to `days` for each new automation run.
// The homepage reads this array and automatically grows by date.
window.DATE_PLANNER_DATA = {
  updatedAt: "2026-06-10",
  days: [
    {
      date: "2026-06-14",
      tags: ["近場", "会話重視", "雨の日", "新体験"],
      label: "6/14(日)",
      theme: "落ち着いて話せる週末",
      statusLabel: "今週の本命プラン",
      title: "長門湯本温泉を軸にした、やわらかい週末デート案",
      summary: "夕方からでも成立しやすく、会話の余白を作りやすい日。歩きすぎず、景色とごはんで自然に気分が上がる流れにしています。",
      oneLine: "無理なく行けて、写真も空気感もやさしい日にする。",
      hero: {
        image: "https://yumotoonsen.com/wp-content/uploads/2022/04/lightup-1.jpg",
        alt: "長門湯本温泉の夜のライトアップ",
        caption: "川沿いの灯りと歩く速度の相性が良い日",
        credit: "画像: 長門湯本温泉 公式サイト"
      },
      meta: {
        start: "萩市アトラス付近から昼過ぎ〜夕方発で組みやすい",
        returnEase: "片道約35分で遅くなりすぎにくい",
        mood: "静か / ゆっくり / 会話メイン / きれいな景色",
        driveLoad: "低〜中",
        rainBackup: "屋根のある店や短め散歩へ切替しやすい",
        decisionHint: "まず『近場がいいか』『夕方からがいいか』を決めると早い"
      },
      prompts: [
        {
          question: "今週末は、しっかり遠出よりも『近めで雰囲気いい感じ』が良い？",
          choices: ["近めがいい", "少し遠出したい", "まだ半々"]
        },
        {
          question: "歩く時間はどのくらいが気楽？",
          choices: ["30分くらい", "1時間くらい", "景色が良ければもう少し"]
        },
        {
          question: "その日の気分はどっち寄り？",
          choices: ["景色と散歩", "ごはんメイン", "半分ずつ"]
        }
      ],
      timeline: [
        {
          time: "14:30",
          title: "萩市アトラス付近から出発",
          detail: "早すぎず遅すぎない時間から動く。無理に朝型にせず、疲れを残しにくいスタートにする。",
          tags: ["遅すぎない", "準備しやすい", "気楽"]
        },
        {
          time: "15:10",
          title: "長門湯本温泉エリアに到着",
          detail: "まずは川沿いを短く歩いて、今日の気分を合わせる。混んでいたら先にお茶でも良い。",
          tags: ["様子見", "歩きすぎない", "調整しやすい"]
        },
        {
          time: "16:00",
          title: "景色のいい場所でひと休み",
          detail: "川床テラスや川沿いベンチ寄りで、会話を主役にする時間を取る。",
          tags: ["会話時間", "写真", "落ち着く"]
        },
        {
          time: "17:30",
          title: "ごはんか軽食を選ぶ",
          detail: "食べ歩き寄りでも、落ち着いて座る店寄りでも成立。事前に決め切らず、当日の気分で寄せられる。",
          tags: ["柔軟", "食事", "その場で決める"]
        },
        {
          time: "18:30",
          title: "灯りがきれいな時間帯を少し歩く",
          detail: "この時間帯がいちばん見せやすい。写真を撮るより、景色を共有しやすいタイミング。",
          tags: ["夕景", "雰囲気", "本命時間"]
        },
        {
          time: "19:20",
          title: "帰路へ",
          detail: "遅くなりすぎる前に戻る。余裕があれば次回どこ行くかを車内で話す流れにもつなげやすい。",
          tags: ["帰りやすい", "疲れにくい", "次回の話題"]
        }
      ],
      spots: [
        {
          id: "nagato-yumoto",
          rank: 1,
          tags: ["近場", "会話重視", "景色"],
          distanceKm: 28,
          category: "本命",
          name: "長門湯本温泉",
          meta: "片道約35分 / 約28km / 夕方から強い",
          reason: "静かに話せて、歩く量も調整しやすい。いちばん失敗しにくい本命。",
          invites: ["夕方から少し歩いて、ごはんかお茶しよう"],
          image: "https://yumotoonsen.com/wp-content/uploads/2022/04/kawadoko-1.jpg",
          alt: "長門湯本温泉の川床テラス",
          link: "https://yumotoonsen.com/",
          photoLink: "https://yumotoonsen.com/"
        },
        {
          id: "hagi-castle-town",
          rank: 2,
          tags: ["近場", "会話重視", "景色"],
          distanceKm: 5,
          category: "近場代替",
          name: "萩城下町 + 萩城跡",
          meta: "片道約10分 / 約4-5km / 近場で安心",
          reason: "疲れている日や、短時間だけ会いたい日でも成立しやすい。",
          invites: ["近場で雰囲気いい所、少しだけ歩かない？"],
          image: "https://www.hagishi.com/en/img/190010.jpg",
          alt: "萩城跡の景色",
          link: "https://www.hagishi.com/en/search/detail.php?d=190010",
          photoLink: "https://www.hagishi.com/en/search/list.php?c0=1&c1=2"
        },
        {
          id: "akiyoshido-main",
          rank: 3,
          tags: ["遠出", "雨の日", "新体験"],
          distanceKm: 55,
          category: "雨の日代替",
          name: "秋芳洞",
          meta: "片道約65分 / 約55km / 雨でも崩れにくい",
          reason: "暑い日や天気が怪しい日でも、満足度が落ちにくい定番の保険。",
          invites: ["暑かったら涼しい所に行くのも良さそう"],
          image: "https://zh-tw.karusuto.com/wp-content/uploads/2017/03/akiyoshido_slider_01.jpg",
          alt: "秋芳洞の内部",
          link: "https://zh-tw.karusuto.com/spot/akiyoshido/",
          photoLink: "https://zh-tw.karusuto.com/spot/akiyoshido/"
        }
      ]
    },
    {
      date: "2026-06-21",
      tags: ["近場", "遠出", "雨の日", "会話重視", "新体験"],
      label: "6/21(日)",
      theme: "近場と少し遠出を比較する週末",
      statusLabel: "次の候補日",
      title: "萩近場を軸にするか、秋吉台方面へ少し広げるかを決める日",
      summary: "この日はまだ固定プランではなく、ふたりの気分を確かめながら方向性を決めるための案です。",
      oneLine: "まず『近場で安心』か『少し遠出で景色』かを決める日。",
      hero: {
        image: "https://zh-tw.karusuto.com/wp-content/uploads/2017/03/akiyoshido_slider_01.jpg",
        alt: "秋芳洞の大きな空間",
        caption: "遠出に寄せるなら、涼しさと変化がある案",
        credit: "画像: 美禰市観光協会"
      },
      meta: {
        start: "昼前後スタートが組みやすい",
        returnEase: "近場なら高い / 美祢方面なら普通",
        mood: "比較しながら決める / 気分重視",
        driveLoad: "低〜中",
        rainBackup: "萩の屋内や秋芳洞に寄せられる",
        decisionHint: "この日は『会話重視か景色重視か』だけ先に決める"
      },
      prompts: [
        {
          question: "次の週末は『近場でゆっくり』と『少し遠出して景色』どっち寄り？",
          choices: ["近場", "少し遠出", "その日の気分"]
        },
        {
          question: "その日は食事メインにしたい？",
          choices: ["食事メイン", "景色メイン", "両方少しずつ"]
        },
        {
          question: "帰りの時間はどれくらいにしたい？",
          choices: ["早め", "普通", "少し遅くてもOK"]
        }
      ],
      timeline: [
        {
          time: "11:30",
          title: "近場案と遠出案をその場で二択にする",
          detail: "朝の体力や天気で、萩近場か美祢方面かをここで決める前提。",
          tags: ["分岐型", "決めやすい", "柔軟"]
        },
        {
          time: "13:00",
          title: "近場なら萩城下町、遠出なら秋芳洞へ",
          detail: "移動負担に応じて、その日のメインを切り替える。",
          tags: ["比較", "その日判断", "無理しない"]
        },
        {
          time: "16:30",
          title: "カフェか休憩場所で次の行き先も話す",
          detail: "当日だけで終わらず、次回候補を一緒に決める時間も残す。",
          tags: ["次回につなぐ", "会話", "余白"]
        }
      ],
      spots: [
        {
          id: "hagi-castle-town-compare",
          rank: 1,
          tags: ["近場", "会話重視", "景色"],
          distanceKm: 5,
          category: "比較候補",
          name: "萩城下町",
          meta: "近場 / 安定 / 歩きやすい",
          reason: "近場なのに雰囲気が出やすく、疲れていても成立しやすい。",
          invites: ["近場でゆっくり話せる感じにする？"],
          image: "https://www.hagishi.com/en/img/190010.jpg",
          alt: "萩城跡の景色",
          link: "https://www.hagishi.com/en/search/list.php?c0=1&c1=2",
          photoLink: "https://www.hagishi.com/en/search/list.php?c0=1&c1=2"
        },
        {
          id: "akiyoshido-compare",
          rank: 2,
          tags: ["遠出", "雨の日", "新体験"],
          distanceKm: 55,
          category: "比較候補",
          name: "秋芳洞",
          meta: "少し遠出 / 体験型 / 雨に強い",
          reason: "近場より非日常感が強く、天候ブレに耐えやすい。",
          invites: ["少し遠出して、景色変わる所もありかも"],
          image: "https://zh-tw.karusuto.com/wp-content/uploads/2017/03/akiyoshido_slider_01.jpg",
          alt: "秋芳洞の内部",
          link: "https://zh-tw.karusuto.com/spot/akiyoshido/",
          photoLink: "https://zh-tw.karusuto.com/spot/akiyoshido/"
        }
      ]
    },
    {
      date: "2026-06-28",
      tags: ["食事", "遠出", "新体験"],
      label: "6/28(日)",
      theme: "食事メイン候補を育てる週末",
      statusLabel: "先の候補日",
      title: "食事や朝型デートを含めて、気分の違う案を足していく日",
      summary: "今後の自動追加に向けた枠です。朝から動く案、夜寄りの案、近場案を混ぜて増やせるようにしています。",
      oneLine: "今後もっと増やすための広げる日。",
      hero: {
        image: "https://www.karatoichiba.com/wp-content/uploads/2026/05/bnr_bakangai_20260513.png",
        alt: "唐戸市場の案内画像",
        caption: "食事メイン案を入れるならこの方向",
        credit: "画像: 唐戸市場 公式サイト"
      },
      meta: {
        start: "朝から動く案も、昼から動く案も追加しやすい",
        returnEase: "候補により差が大きい",
        mood: "食 / にぎやかさ / 変化球",
        driveLoad: "中〜高まで幅あり",
        rainBackup: "下関系は屋内寄りへ調整が必要",
        decisionHint: "朝型の気分かどうかを最初に聞くと整理しやすい"
      },
      prompts: [
        {
          question: "食べるのを主役にした日も今後入れたい？",
          choices: ["入れたい", "たまになら", "今は静かな方がいい"]
        },
        {
          question: "朝から動くデートは気分に合う？",
          choices: ["合う", "昼からがいい", "その日次第"]
        },
        {
          question: "今後の候補を増やすならどれ系がいい？",
          choices: ["温泉", "町歩き", "海鮮", "自然"]
        }
      ],
      timeline: [
        {
          time: "09:00",
          title: "朝型なら下関方面を検討",
          detail: "食事メイン案として唐戸市場系を入れる枠。",
          tags: ["朝型", "海鮮", "にぎやか"]
        },
        {
          time: "13:00",
          title: "昼から型なら近場へ寄せる",
          detail: "萩や長門湯本のような、遅めスタートでも成立する案へ切り替え可能。",
          tags: ["昼から", "近場", "柔軟"]
        }
      ],
      spots: [
        {
          id: "karato-market",
          rank: 1,
          tags: ["食事", "遠出", "新体験"],
          distanceKm: 125,
          category: "食事メイン候補",
          name: "唐戸市場",
          meta: "朝型向け / 海鮮 / 混雑注意",
          reason: "雰囲気は賑やかだが、食の満足感は作りやすい。",
          invites: ["朝から海鮮を食べに行く感じ、ちょっと楽しそう"],
          image: "https://www.karatoichiba.com/wp-content/uploads/2026/05/bnr_bakangai_20260513.png",
          alt: "唐戸市場の案内画像",
          link: "https://www.karatoichiba.com/",
          photoLink: "https://www.karatoichiba.com/"
        }
      ]
    }
  ]
};
