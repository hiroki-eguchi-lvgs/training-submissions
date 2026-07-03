import { useState } from "react";

// ============================================================
// DATA — 重要概念リスト & 問題
// ============================================================

const COURSES = [
  {
    id: "html",
    label: "課題1：HTML/CSS",
    concepts: [
      // 基礎
      { id: "c1-1", level: "基礎", category: "HTML構造", name: "ドキュメント構造・セマンティック要素", desc: "DOCTYPE、head/body、見出し/article/section/nav 等の意味的タグの役割" },
      { id: "c1-2", level: "基礎", category: "HTML構造", name: "インライン要素 vs ブロック要素", desc: "表示モデルの違いと代表的な要素の分類" },
      { id: "c1-3", level: "基礎", category: "HTML構造", name: "フォーム・アクセシビリティ属性", desc: "input/label の紐付け、alt・aria 属性の目的" },
      { id: "c1-4", level: "基礎", category: "CSSモデル", name: "ボックスモデル", desc: "content/padding/border/margin の構造と box-sizing の違い" },
      { id: "c1-5", level: "基礎", category: "CSSモデル", name: "カスケード・詳細度・継承", desc: "どのスタイルが優先されるかの計算ルール" },
      // 応用
      { id: "c1-6", level: "応用", category: "レイアウト", name: "Flexbox", desc: "主軸/交差軸、justify-content/align-items/flex-wrap等" },
      { id: "c1-7", level: "応用", category: "レイアウト", name: "CSS Grid", desc: "grid-template-columns/rows、fr単位、auto-fit/minmax" },
      { id: "c1-8", level: "応用", category: "レイアウト", name: "positionとz-index", desc: "static/relative/absolute/fixed/sticky の違い、スタッキングコンテキスト" },
      { id: "c1-9", level: "応用", category: "設計・品質", name: "レスポンシブデザイン", desc: "メディアクエリ、モバイルファーストの設計思想" },
      { id: "c1-10", level: "応用", category: "設計・品質", name: "CSS設計手法とパフォーマンス", desc: "BEM命名規則、クリティカルレンダリングパス、アニメーション vs トランジション" },
    ],
    questions: [
      // ── 選択式 ──
      {
        no: 1, type: "選択", level: "基礎", conceptId: "c1-2",
        q: "HTML要素の表示モデルに関して、正しい記述はどれか。",
        choices: [
          "A. <span> はデフォルトでブロック要素として扱われる",
          "B. ブロック要素はデフォルトで親要素の幅いっぱいに広がり、前後に改行が入る",
          "C. インライン要素には width・height を自由に指定できる",
          "D. <div> はインライン要素の一種である",
        ],
        answer: "B",
        point: "<div>/<p>/<h1>などのブロック要素は幅いっぱいに広がり縦に積まれる。<span>/<a>/<strong>などのインライン要素はwidthが原則無効で横に並ぶ。",
      },
      {
        no: 2, type: "選択", level: "基礎", conceptId: "c1-4",
        q: "CSSの box-sizing: border-box を指定したとき、width: 200px; padding: 10px; border: 2px solid; の要素のコンテンツ幅は何pxか。",
        choices: [
          "A. 200px",
          "B. 224px",
          "C. 176px",
          "D. 178px",
        ],
        answer: "C",
        point: "border-box では width がパディング・ボーダーを含む合計幅。コンテンツ幅 = 200 - (10×2) - (2×2) = 176px。",
      },
      {
        no: 3, type: "選択", level: "基礎", conceptId: "c1-5",
        q: "CSSの詳細度（specificity）が高い順に正しく並んでいるものはどれか。",
        choices: [
          "A. タグセレクタ > クラスセレクタ > IDセレクタ > インラインスタイル",
          "B. インラインスタイル > IDセレクタ > クラスセレクタ > タグセレクタ",
          "C. IDセレクタ > インラインスタイル > クラスセレクタ > タグセレクタ",
          "D. クラスセレクタ > IDセレクタ > タグセレクタ > インラインスタイル",
        ],
        answer: "B",
        point: "詳細度の強さ：インラインスタイル(1,0,0,0) > ID(0,1,0,0) > クラス/属性/疑似クラス(0,0,1,0) > タグ(0,0,0,1)。",
      },
      {
        no: 4, type: "選択", level: "基礎", conceptId: "c1-3",
        q: "<img> 要素に alt 属性を設定することの主な目的として誤っているものはどれか。",
        choices: [
          "A. スクリーンリーダーが画像の内容を読み上げられるようにする",
          "B. 画像が読み込めない場合に代替テキストを表示する",
          "C. 検索エンジンが画像の内容を把握できるようにする",
          "D. 画像の表示サイズを指定する",
        ],
        answer: "D",
        point: "サイズ指定には width/height 属性またはCSSを使う。alt はアクセシビリティ・SEO・フォールバック表示が目的。",
      },
      {
        no: 5, type: "選択", level: "基礎", conceptId: "c1-1",
        q: "セマンティックHTMLに関して正しい説明はどれか。",
        choices: [
          "A. <div> と <section> は描画上完全に同一なので使い分け不要",
          "B. 要素の意味を明示することで可読性・アクセシビリティ・SEOが向上する",
          "C. CSSを一切使わないHTMLのことをセマンティックHTMLという",
          "D. セマンティック要素は検索エンジンのみが参照し人間には影響しない",
        ],
        answer: "B",
        point: "<header>/<nav>/<main>/<article>/<footer>等は意味情報を持ち、支援技術や検索エンジンに構造を伝える。",
      },
      {
        no: 6, type: "選択", level: "応用", conceptId: "c1-6",
        q: "Flexbox で子要素を水平方向に均等配置（両端揃え）したい場合に使うプロパティ値の組み合わせはどれか。",
        choices: [
          "A. display: flex; align-items: space-between;",
          "B. display: flex; justify-content: space-between;",
          "C. display: flex; flex-direction: between;",
          "D. display: flex; flex-wrap: space-between;",
        ],
        answer: "B",
        point: "主軸方向の配置は justify-content で制御。space-between は両端に要素を配置し、残りを均等に分配する。",
      },
      {
        no: 7, type: "選択", level: "応用", conceptId: "c1-7",
        q: "CSS Grid で grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); が意味することはどれか。",
        choices: [
          "A. 常に1列のみ表示し、幅を200px固定にする",
          "B. 最低200px幅のカラムをコンテナ幅に収まる最大数だけ自動生成し、余白は均等に伸ばす",
          "C. 200個のカラムを生成する",
          "D. 最大1列、最小200列のグリッドを作る",
        ],
        answer: "B",
        point: "auto-fit はカラム数を自動決定。minmax(200px, 1fr) で最小200px・余白は1fr分伸長。レスポンシブレイアウトの定番イディオム。",
      },
      {
        no: 8, type: "選択", level: "応用", conceptId: "c1-8",
        q: "position: absolute の基準点として正しいものはどれか。",
        choices: [
          "A. 常に <body> タグ",
          "B. 直近の親要素",
          "C. position が static 以外（relative/absolute/fixed/sticky）の直近の祖先要素",
          "D. position: fixed の直近の祖先要素のみ",
        ],
        answer: "C",
        point: "absolute はスタッキングコンテキストを形成する直近の祖先を基準に配置。static の祖先はスキップされる。",
      },
      {
        no: 9, type: "選択", level: "応用", conceptId: "c1-9",
        q: "@media (max-width: 768px) が適用されるビューポート幅の条件はどれか。",
        choices: [
          "A. 768px より大きい場合のみ",
          "B. 768px 以下の場合",
          "C. 768px ちょうどの場合のみ",
          "D. 768px 以上の場合",
        ],
        answer: "B",
        point: "max-width は「指定値以下」。768px ちょうども含む。モバイルファーストなら min-width を使う。",
      },
      {
        no: 10, type: "選択", level: "応用", conceptId: "c1-10",
        q: "Webフォントを <head> 内で読み込む際、テキストが一瞬デフォルトフォントで表示される現象の名称はどれか。",
        choices: [
          "A. CORS",
          "B. FOUC（Flash of Unstyled Content）",
          "C. FOIT / FOUT（Flash of Invisible/Unstyled Text）",
          "D. CRP（Critical Rendering Path）",
        ],
        answer: "C",
        point: "FOIT はフォント読み込み中にテキストが非表示になる現象、FOUT は代替フォントで表示される現象。font-display プロパティで制御できる。",
      },
      // ── 記述式 ──
      {
        no: 11, type: "記述", level: "基礎", conceptId: "c1-1",
        q: "<head> タグ内に記述する要素を3つ挙げ、それぞれの役割を説明してください。",
        answer: "例）<title>：ブラウザタブやSEOに使われるページ名。<meta charset>：文字エンコーディングの宣言。<link rel=\"stylesheet\">：外部CSSの読み込み。他に<meta name=\"viewport\">（レスポンシブ対応）、<meta description>（SEO）なども可。",
      },
      {
        no: 12, type: "記述", level: "基礎", conceptId: "c1-4",
        q: "box-sizing: content-box と border-box の違いを、幅の計算方法を含めて説明してください。",
        answer: "content-box（デフォルト）は width がコンテンツ幅のみを指し、実際の描画幅は width + padding + border になる。border-box は width がpaddingとborderを含む合計幅を指し、コンテンツ幅が自動的に縮む。レイアウト計算が直感的になるため border-box が実務では好まれる。",
      },
      {
        no: 13, type: "記述", level: "基礎", conceptId: "c1-6",
        q: "Flexboxを使って子要素を水平・垂直ともに中央揃えにするCSSを記述してください。",
        answer: ".parent { display: flex; justify-content: center; align-items: center; } が最小構成。高さが必要な場合は height または min-height も指定する。",
      },
      {
        no: 14, type: "記述", level: "基礎", conceptId: "c1-5",
        q: "CSSの詳細度が同一のとき、どのルールが適用されるか説明してください。また !important が使われた場合どうなるか述べてください。",
        answer: "詳細度が同じ場合はソース上で後に記述されたルールが上書きする（カスケード順）。!important が付くと詳細度に関わらず最優先で適用される。!important の乱用は詳細度競争を招くため避けるべき。",
      },
      {
        no: 15, type: "記述", level: "基礎", conceptId: "c1-3",
        q: "<label> と <input> を正しく紐付けることのメリットを2つ説明してください。",
        answer: "①アクセシビリティ：スクリーンリーダーがinputの目的を読み上げられる。②ユーザビリティ：ラベルをクリックするとinputがフォーカスされ、クリック領域が広がる。for属性とid属性を一致させるか、inputをlabelで囲む方法がある。",
      },
      {
        no: 16, type: "記述", level: "応用", conceptId: "c1-9",
        q: "モバイルファーストのレスポンシブ設計とデスクトップファーストの違いを、メディアクエリの書き方とともに説明してください。",
        answer: "モバイルファーストはまずモバイル向けのCSSを書き、@media (min-width: 768px) で大画面向けを上書き。デスクトップファーストは逆で @media (max-width: 768px) でモバイル向けを上書き。モバイルファーストはCSS量が小さく済む傾向があり、パフォーマンス上有利とされる。",
      },
      {
        no: 17, type: "記述", level: "応用", conceptId: "c1-10",
        q: "CSS transition と @keyframes アニメーションの違いを説明し、それぞれ適切なユースケースを1つずつ挙げてください。",
        answer: "transitionは状態変化（:hover等）のトリガーに伴い2状態間を補間する。@keyframesは複数ステップ・繰り返し・ページロード時など任意のタイミングで制御できる。ユースケース例：transitionはボタンのホバー色変化、@keyframesはローディングスピナーの回転。",
      },
      {
        no: 18, type: "記述", level: "応用", conceptId: "c1-10",
        q: "BEM命名規則とは何か説明し、「カードコンポーネントの中にあるタイトル要素」と「モディファイア（強調状態）のカード」のクラス名を記述してください。",
        answer: "BEM（Block Element Modifier）はBlockを独立コンポーネント、ElementをBlockの構成部品（Block__element）、ModifierをバリエーションやState（Block--modifier / Block__element--modifier）として分類する命名規則。例：.card__title（タイトル）、.card--featured（強調状態のカード）。",
      },
      {
        no: 19, type: "記述", level: "応用", conceptId: "c1-8",
        q: "z-index を指定したのに要素が期待通りに重なり順にならない場合、原因として考えられることを2つ挙げてください。",
        answer: "①要素の position が static のとき z-index は無効。②異なるスタッキングコンテキスト（position + z-index・opacity<1・transform等で生成）に属する要素同士は、z-indexの値ではなくコンテキスト単位で比較されるため、子要素のz-indexが親のコンテキストを越えられない。",
      },
      {
        no: 20, type: "記述", level: "応用", conceptId: "c1-10",
        q: "CSSファイルを <head> に、JavaScriptファイルを <body> 末尾に配置することが推奨される理由を、クリティカルレンダリングパスの観点から説明してください。",
        answer: "CSSはレンダーブロッキングリソースのため、早期に読み込むことでスタイル適用前の素のHTMLが表示される FOUC を防ぐ。JSはパーサーブロッキングになるため、body末尾に配置するとHTMLのパース・描画が先に完了しページ表示が速くなる。defer/async属性でheadに置く方法も可。",
      },
    ],
  },

  {
    id: "blog",
    label: "課題2：ブログ (CRUD/認証)",
    concepts: [
      { id: "c2-1", level: "基礎", category: "HTTP/REST", name: "HTTPメソッドとステータスコード", desc: "GET/POST/PUT/PATCH/DELETE の使い分けと主要ステータスコードの意味" },
      { id: "c2-2", level: "基礎", category: "HTTP/REST", name: "RESTful API設計", desc: "リソース指向のURL設計、CRUD操作とメソッドの対応" },
      { id: "c2-3", level: "基礎", category: "DB", name: "RDBMSの基礎", desc: "テーブル/カラム/主キー/外部キー/参照整合性、基本SQL（SELECT/INSERT/UPDATE/DELETE）" },
      { id: "c2-4", level: "基礎", category: "認証", name: "セッションベース認証", desc: "Cookie + サーバーサイドセッションの仕組みとログインフロー" },
      { id: "c2-5", level: "基礎", category: "Node.js", name: "サーバーサイドの基礎概念", desc: "ルーティング・ミドルウェアの役割、リクエスト/レスポンスのライフサイクル、入力バリデーションの目的" },
      { id: "c2-6", level: "応用", category: "セキュリティ", name: "SQLインジェクション対策", desc: "プリペアドステートメント・ORMの役割" },
      { id: "c2-7", level: "応用", category: "セキュリティ", name: "パスワードの安全な保存", desc: "ハッシュ化（bcrypt等）、ソルト、平文保存の危険性" },
      { id: "c2-8", level: "応用", category: "セキュリティ", name: "Cookie属性とXSS/CSRF", desc: "HttpOnly・Secure・SameSite属性の目的と攻撃緩和の仕組み" },
      { id: "c2-9", level: "応用", category: "DB", name: "JWTとトークン認証", desc: "ヘッダー/ペイロード/署名の構造、セッション方式との比較" },
      { id: "c2-10", level: "応用", category: "DB", name: "DBインデックスと正規化", desc: "インデックスの仕組みと効果、第1〜3正規形の概念" },
    ],
    questions: [
      {
        no: 1, type: "選択", level: "基礎", conceptId: "c2-1",
        q: "RESTful APIにおいてリソースの一部を更新する場合に最も適切なHTTPメソッドはどれか。",
        choices: [
          "A. POST",
          "B. PUT",
          "C. PATCH",
          "D. DELETE",
        ],
        answer: "C",
        point: "PUT はリソース全体の置き換え、PATCH は部分更新。例えばブログ記事のタイトルだけ変えるなら PATCH が適切。",
      },
      {
        no: 2, type: "選択", level: "基礎", conceptId: "c2-1",
        q: "以下のHTTPステータスコードとその意味の組み合わせで誤っているものはどれか。",
        choices: [
          "A. 200 OK — リクエスト成功",
          "B. 201 Created — リソース作成成功",
          "C. 401 Unauthorized — 認証が必要（未認証）",
          "D. 403 Forbidden — リソースが見つからない",
        ],
        answer: "D",
        point: "403 Forbidden は認証済みだがアクセス権がない状態。リソースが見つからない場合は 404 Not Found。",
      },
      {
        no: 3, type: "選択", level: "基礎", conceptId: "c2-3",
        q: "外部キー制約について正しい説明はどれか。",
        choices: [
          "A. 親テーブルに存在しない値を子テーブルに挿入できる",
          "B. 子テーブルから参照されている親レコードを自由に削除できる",
          "C. 参照整合性を保ち、親テーブルに存在しない値の挿入や参照中レコードの削除を防ぐ",
          "D. 外部キーを設定すると自動的にインデックスが無効になる",
        ],
        answer: "C",
        point: "外部キーは親テーブルの主キー（または一意キー）を参照し、データの整合性を DB レベルで強制する。",
      },
      {
        no: 4, type: "選択", level: "基礎", conceptId: "c2-4",
        q: "Cookie を使ったセッション認証において、セッションIDはどこに保存されるか。正しい組み合わせはどれか。",
        choices: [
          "A. クライアント：LocalStorage、サーバー：なし",
          "B. クライアント：Cookie、サーバー：セッションストア（メモリ・DB等）",
          "C. クライアント：Cookie、サーバー：Cookie",
          "D. クライアント：なし、サーバー：Cookie",
        ],
        answer: "B",
        point: "セッションIDはCookieに保存され、サーバー側のセッションストアと照合することでユーザーを識別する。",
      },
      {
        no: 5, type: "選択", level: "基礎", conceptId: "c2-5",
        q: "WebサーバーにおけるミドルウェアのBest-practiceとして正しい説明はどれか。",
        choices: [
          "A. ミドルウェアはレスポンスを返した後にのみ実行される処理である",
          "B. 認証チェックやロギングなど複数のルートで共通する処理を、リクエスト/レスポンスのサイクルに差し込む仕組みである",
          "C. ミドルウェアはDBアクセスを行う処理に限定されている",
          "D. ミドルウェアを使うとルートハンドラーが不要になる",
        ],
        answer: "B",
        point: "ミドルウェアはリクエストとレスポンスの間に挟まる処理層。認証・ロギング・バリデーション・エラーハンドリングなど、ルートをまたいで共通化したい処理を担う。",
      },
      {
        no: 6, type: "選択", level: "応用", conceptId: "c2-6",
        q: "SQLインジェクションを防ぐ最も根本的な対策はどれか。",
        choices: [
          "A. ユーザー入力を大文字に変換してからクエリに渡す",
          "B. プリペアドステートメント（パラメータ化クエリ）を使い、SQL文と入力データを分離する",
          "C. クエリの長さを100文字以内に制限する",
          "D. SELECT文のみに限定し UPDATE・DELETE を使わない",
        ],
        answer: "B",
        point: "プリペアドステートメントはSQLの構造を確定させてから値を別途バインドするため、入力値にSQL構文が含まれても無効化される。",
      },
      {
        no: 7, type: "選択", level: "応用", conceptId: "c2-7",
        q: "パスワードをデータベースに保存する際の正しいアプローチはどれか。",
        choices: [
          "A. AES等の可逆暗号で暗号化して保存する",
          "B. BASE64エンコードして保存する",
          "C. bcrypt・argon2等のソルト付き強ハッシュ関数でハッシュ化して保存する",
          "D. SHA-1でハッシュ化して保存する",
        ],
        answer: "C",
        point: "可逆暗号は鍵漏洩で復元できる。SHA-1はレインボーテーブル攻撃に弱い。bcrypt/argon2はソルトと計算コストを持ちブルートフォースに強い。",
      },
      {
        no: 8, type: "選択", level: "応用", conceptId: "c2-8",
        q: "Cookie の SameSite=Strict 属性を設定することで緩和できる攻撃はどれか。",
        choices: [
          "A. SQLインジェクション",
          "B. XSS（クロスサイトスクリプティング）",
          "C. CSRF（クロスサイトリクエストフォージェリ）",
          "D. ブルートフォース攻撃",
        ],
        answer: "C",
        point: "SameSite=Strict は別ドメインからのリクエストにCookieを付与しないため、第三者サイトからの偽造リクエストを防ぐ。XSS対策は HttpOnly・CSP が有効。",
      },
      {
        no: 9, type: "選択", level: "応用", conceptId: "c2-9",
        q: "JWTを用いた認証に関して正しい説明はどれか。",
        choices: [
          "A. JWTのペイロードは暗号化されているため機密情報を安全に格納できる",
          "B. JWTはサーバー側にセッション情報を保持するステートフルな認証方式である",
          "C. 署名の検証により改ざん検知はできるが、ペイロードはBase64でデコード可能なため機密情報を含めてはいけない",
          "D. JWTはHTTP Cookieでしか送信できない",
        ],
        answer: "C",
        point: "JWTのペイロードはBase64URLでエンコードされているだけで暗号化されていない。AuthorizationヘッダーやCookieで送信でき、サーバー側ストレージ不要でステートレス。",
      },
      {
        no: 10, type: "選択", level: "応用", conceptId: "c2-10",
        q: "RDBMSにおけるインデックスの説明として正しいものはどれか。",
        choices: [
          "A. インデックスを張ると常にSELECT・INSERT・UPDATE全てが高速化される",
          "B. インデックスはB-Tree等の構造でデータを管理し、検索は高速になるがINSERT/UPDATEのオーバーヘッドが増える",
          "C. 全てのカラムにインデックスを張ることが推奨される",
          "D. インデックスを張ると外部キー制約が不要になる",
        ],
        answer: "B",
        point: "インデックスは検索を高速化する一方、書き込み時にインデックスの更新が必要になるためINSERT/UPDATEのコストが増加する。WHERE句・JOIN・ORDER BYで頻繁に使うカラムに絞って設定するのが基本。",
      },
      // 記述
      {
        no: 11, type: "記述", level: "基礎", conceptId: "c2-2",
        q: "ブログ記事リソース（/posts）に対して、CRUD操作を実現するRESTful APIのエンドポイント設計を、HTTPメソッド・パス・操作の対応を含めて説明してください。",
        answer: "GET /posts（一覧取得）、POST /posts（作成）、GET /posts/:id（詳細取得）、PUT or PATCH /posts/:id（更新）、DELETE /posts/:id（削除）。URLはリソース名の名詞形とし、動詞を含めないのがRESTの原則。",
      },
      {
        no: 12, type: "記述", level: "基礎", conceptId: "c2-5",
        q: "サーバーサイドでリクエストの入力バリデーションを行う理由を説明し、クライアントサイドのバリデーションだけでは不十分な理由も述べてください。",
        answer: "サーバーサイドバリデーションはデータの整合性・安全性をサーバー側で保証するために必須。クライアントサイドバリデーションはUX向上（即時フィードバック）には有効だが、開発者ツールや直接のHTTPリクエスト（curl等）によって容易に迂回できる。悪意あるリクエストや誤ったデータがDBに到達するのを防ぐには、サーバー側での型チェック・必須チェック・範囲チェックが不可欠。両方実装するのが原則。",
      },
      {
        no: 13, type: "記述", level: "基礎", conceptId: "c2-3",
        q: "ブログアプリのDBで「ユーザー」「記事」「コメント」のテーブルを設計するとき、テーブル間の関係と外部キーの設定方法を説明してください。",
        answer: "ユーザー(users)：id（PK）など。記事(posts)：id（PK）、user_id（FK→users.id）など。コメント(comments)：id（PK）、post_id（FK→posts.id）、user_id（FK→users.id）など。外部キーにより、存在しないユーザーIDの記事挿入や、記事削除時のコメント孤立をDBレベルで防げる（CASCADE設定も可）。",
      },
      {
        no: 14, type: "記述", level: "基礎", conceptId: "c2-4",
        q: "Cookieを用いたセッション認証のログインフローを、リクエストとレスポンスの流れを含めて順を追って説明してください。",
        answer: "①クライアントがID/PWをPOST送信。②サーバーがDB照合しPW検証。③成功すればサーバーがセッションID生成・セッションストアに保存。④レスポンスのSet-CookieヘッダーでセッションIDをクライアントに送付。⑤以降のリクエストにCookieが自動付与され、サーバーがセッションストアで照合してユーザーを識別。",
      },
      {
        no: 15, type: "記述", level: "基礎", conceptId: "c2-5",
        q: "Node.js の非同期処理において async/await を使う利点を、コールバック方式と比較して説明してください。",
        answer: "コールバックは非同期処理が深くなると「コールバック地獄」が生じ、可読性・エラーハンドリングが困難になる。async/await は非同期処理を同期的な見た目で記述でき、try/catch で例外処理を統一でき、デバッグやスタックトレースも追いやすい。内部的にはPromiseのシンタックスシュガーであり、Promise チェーンよりも直感的に書ける。",
      },
      {
        no: 16, type: "記述", level: "応用", conceptId: "c2-9",
        q: "JWTの構造（ヘッダー・ペイロード・署名）を説明し、サーバーが署名を検証することの意味と、ペイロードに機密情報を含めてはいけない理由を述べてください。",
        answer: "ヘッダー（アルゴリズム情報）・ペイロード（クレーム：ユーザーIDや有効期限等）・署名（ヘッダー+ペイロードをシークレットでHMAC等署名）の3部をBase64URLエンコードしてドットで連結。署名検証によりトークンが改ざんされていないことを確認できる。ペイロードはBase64でデコード可能なため、パスワード等の機密情報は含めてはならない。",
      },
      {
        no: 17, type: "記述", level: "応用", conceptId: "c2-8",
        q: "CSRF攻撃とは何か説明し、Fastify/Node.jsアプリで実施できる対策を2つ挙げてください。",
        answer: "CSRFは、被害者が意図せず攻撃者の用意したサイトから被害者の認証済みセッションを利用してリクエストを送らせる攻撃。対策①：CSRFトークン（サーバー発行のランダムトークンをフォームやカスタムヘッダーに含め、サーバー側で検証する）。対策②：Cookie の SameSite=Strict/Lax 属性設定（別ドメインからのリクエストにCookieが付与されない）。両方を組み合わせることで多層防御になる。",
      },
      {
        no: 18, type: "記述", level: "応用", conceptId: "c2-10",
        q: "データベースの正規化における第1〜第3正規形をそれぞれ定義し、正規化が必要な理由（更新異常の例）を説明してください。",
        answer: "1NF：繰り返しグループをなくし各セルを原子値にする。2NF：1NFかつ全列が主キーに完全関数従属（複合PKの一部にだけ依存する列をなくす）。3NF：2NFかつ推移的関数従属をなくす（主キー以外の列に従属する列を分離）。正規化しないと更新異常（1か所変更で複数行を修正し漏れが生じる）・挿入異常・削除異常が発生する。",
      },
      {
        no: 19, type: "記述", level: "応用", conceptId: "c2-8",
        q: "HttpOnly・Secure・SameSite という Cookie の3属性について、それぞれの目的と対策できる攻撃を説明してください。",
        answer: "HttpOnly：JavaScriptからCookieにアクセスできなくし、XSSによるCookie窃取を防ぐ。Secure：HTTPS接続のみCookieを送信し、平文通信での漏洩を防ぐ。SameSite（Strict/Lax）：クロスサイトリクエストにCookieを付与しないようにし、CSRF攻撃を緩和する。3属性を組み合わせることで多層防御になる。",
      },
      {
        no: 20, type: "記述", level: "応用", conceptId: "c2-1",
        q: "認証（Authentication）と認可（Authorization）の違いを説明し、ブログアプリでの具体的な実装例をそれぞれ挙げてください。",
        answer: "認証：ユーザーが誰であるかを確認するプロセス（例：ID/PWでのログイン、JWTの検証）。認可：認証済みユーザーが何をできるかを制御するプロセス（例：自分の記事のみ編集可能にするミドルウェア、管理者のみ削除APIを許可するロールチェック）。一般的にリクエストのライフサイクル上で、認証→認可の順に検証を行う。",
      },
    ],
  },

  {
    id: "adv",
    label: "課題3：自由課題/発展",
    concepts: [
      { id: "c3-1", level: "基礎", category: "開発プロセス", name: "要件定義・設計プロセス", desc: "機能要件/非機能要件の区別、ユースケース・ERD・API仕様書等の成果物" },
      { id: "c3-2", level: "基礎", category: "開発プロセス", name: "バージョン管理とチーム開発", desc: "Git の merge/rebase/PR フロー、ブランチ戦略" },
      { id: "c3-3", level: "基礎", category: "セキュリティ", name: "XSSと基本的な対策", desc: "XSSの仕組み、エスケープ・CSP・HttpOnlyによる多層防御" },
      { id: "c3-4", level: "基礎", category: "セキュリティ", name: "HTTPS/TLSの役割", desc: "通信の暗号化・証明書による認証・本番環境での必要性" },
      { id: "c3-5", level: "基礎", category: "テスト", name: "テストの種類と目的", desc: "ユニット・結合・E2Eテストの違いと適切な使い分け" },
      { id: "c3-6", level: "応用", category: "認証認可", name: "OAuth2とOpenID Connect", desc: "アクセストークン・リフレッシュトークンの役割、OAuthとOIDCの違い" },
      { id: "c3-7", level: "応用", category: "認証認可", name: "RBAC/ABACと実践的な認可設計", desc: "ロール・属性ベースのアクセス制御とその実装パターン" },
      { id: "c3-8", level: "応用", category: "パフォーマンス", name: "N+1問題とクエリ最適化", desc: "N+1の発生原因、Eager LoadingやDataLoaderによる解決策" },
      { id: "c3-9", level: "応用", category: "パフォーマンス", name: "キャッシュ戦略とレートリミット", desc: "キャッシュの陳腐化問題、TTL設計、レートリミットによるDoS緩和" },
      { id: "c3-10", level: "応用", category: "セキュリティ", name: "シークレット管理とセキュリティ設計", desc: "環境変数による機密情報分離、OWASP Top 10の概念" },
    ],
    questions: [
      {
        no: 1, type: "選択", level: "基礎", conceptId: "c3-1",
        q: "「機能要件」と「非機能要件」の説明として正しいものはどれか。",
        choices: [
          "A. 機能要件はシステムの応答速度や可用性などの品質特性を定義する",
          "B. 非機能要件は「ユーザーが記事を投稿できる」などシステムの振る舞いを定義する",
          "C. 機能要件はシステムが何をするかを、非機能要件はどのくらいの品質で動くかを定義する",
          "D. 両者は同義であり、区別する必要はない",
        ],
        answer: "C",
        point: "機能要件：ログイン・投稿・検索などの機能。非機能要件：性能・可用性・セキュリティ・スケーラビリティ等の品質属性。",
      },
      {
        no: 2, type: "選択", level: "基礎", conceptId: "c3-3",
        q: "XSS（クロスサイトスクリプティング）の説明として正しいものはどれか。",
        choices: [
          "A. 攻撃者が被害者のセッションを利用して偽造リクエストを送る攻撃",
          "B. 攻撃者がWebページに悪意あるスクリプトを埋め込み、他のユーザーのブラウザで実行させる攻撃",
          "C. 不正なSQLを注入してDBを操作する攻撃",
          "D. ネットワーク通信を傍受する攻撃",
        ],
        answer: "B",
        point: "XSSはAとは異なりCSRF。CはSQLインジェクション。DはMitM攻撃。XSSは入力値をエスケープせずHTMLに出力することで発生する。",
      },
      {
        no: 3, type: "選択", level: "基礎", conceptId: "c3-4",
        q: "HTTPSで通信を保護する際に使われるプロトコルとその主な役割の組み合わせとして正しいものはどれか。",
        choices: [
          "A. SSH — 通信の圧縮",
          "B. TLS — 通信の暗号化と証明書によるサーバー認証",
          "C. FTP — ファイルの暗号化転送",
          "D. SMTP — メール通信の暗号化",
        ],
        answer: "B",
        point: "TLS（Transport Layer Security）がHTTPSの暗号化基盤。サーバー証明書により通信相手の正当性も検証できる。",
      },
      {
        no: 4, type: "選択", level: "基礎", conceptId: "c3-2",
        q: "Git の rebase に関して正しい説明はどれか。",
        choices: [
          "A. 別ブランチの変更を取り込み、マージコミットを作成する",
          "B. コミット履歴を別のベースに付け替え、線形な履歴を作る",
          "C. コミットを完全に削除する",
          "D. リモートの変更をローカルに取り込むだけで履歴に影響しない",
        ],
        answer: "B",
        point: "rebase はコミット群を別のベースに付け替えて線形履歴にする。マージコミットを作らないが、push 済みブランチへの rebase は履歴書き換えとなり危険。",
      },
      {
        no: 5, type: "選択", level: "基礎", conceptId: "c3-5",
        q: "E2E（End-to-End）テストの説明として最も正しいものはどれか。",
        choices: [
          "A. 関数やクラス単体の動作を独立して確認するテスト",
          "B. 複数モジュールの連携を確認するテスト",
          "C. ユーザーの操作シナリオを実際のブラウザ等で再現し、システム全体を通して確認するテスト",
          "D. DBのみを対象に実行するテスト",
        ],
        answer: "C",
        point: "E2Eはフロントエンドからバックエンド・DBまで通貫して動作確認する。Playwright・Cypress等のツールを使う。ユニットテストより実行コストが高い。",
      },
      {
        no: 6, type: "選択", level: "応用", conceptId: "c3-8",
        q: "N+1問題の説明として正しいものはどれか。",
        choices: [
          "A. N台のサーバーで1つのDBに接続する構成上の問題",
          "B. ユーザー一覧（1回）を取得した後、各ユーザーの投稿をN回個別クエリで取得する、計N+1回のDB問い合わせが発生する問題",
          "C. 1つのAPIにN+1件のリクエストが同時に来る過負荷問題",
          "D. ページネーションなしにN+1件のデータを取得する設計上の問題",
        ],
        answer: "B",
        point: "N+1はORMのレイジーロードで発生しやすい。解決策はEager Loading（JOIN）やDataLoader（バッチ化）によるクエリ統合。",
      },
      {
        no: 7, type: "選択", level: "応用", conceptId: "c3-9",
        q: "キャッシュを導入する際に最も注意すべき問題はどれか。",
        choices: [
          "A. キャッシュの保存先がディスクになること",
          "B. TTL切れ前に元データが更新され古い値が返り続ける「キャッシュの陳腐化」",
          "C. HTTPSが使用できなくなること",
          "D. データベースの接続数が増加すること",
        ],
        answer: "B",
        point: "キャッシュの陳腐化（stale data）は、TTL設計・更新時の明示的なキャッシュ無効化（cache invalidation）で対処する。",
      },
      {
        no: 8, type: "選択", level: "応用", conceptId: "c3-6",
        q: "OAuthとOpenID Connect（OIDC）の関係として正しい説明はどれか。",
        choices: [
          "A. OAuthは認証プロトコルで、OIDCはその後継である",
          "B. OAuthはリソースへのアクセス権限委譲のプロトコルで、OIDCはOAuthを拡張してIDトークンによる認証機能を追加したもの",
          "C. OAuthとOIDCは全く無関係な独立したプロトコルである",
          "D. OIDCはOAuthのサブセットであり、機能が限定されている",
        ],
        answer: "B",
        point: "OAuthはアクセストークンによる認可専用。「Googleでログイン」等の認証にはOIDCのIDトークン（JWT）を使う。OIDCはOAuthの上に構築されている。",
      },
      {
        no: 9, type: "選択", level: "応用", conceptId: "c3-9",
        q: "APIにレートリミットを設ける主な目的として最も適切なものはどれか。",
        choices: [
          "A. レスポンスを圧縮してデータ転送量を削減する",
          "B. DoS攻撃や総当たり攻撃を緩和し、サーバーリソースと他ユーザーへの影響を保護する",
          "C. データベースの接続数を制限する",
          "D. ユーザーの閲覧履歴を記録・制限する",
        ],
        answer: "B",
        point: "レートリミットは単位時間あたりのリクエスト数に上限を設けることで、意図的・非意図的な過負荷やブルートフォース攻撃を緩和する。@fastify/rate-limit 等を利用できる。",
      },
      {
        no: 10, type: "選択", level: "応用", conceptId: "c3-6",
        q: "リフレッシュトークンを使うアーキテクチャの目的として最も正しいものはどれか。",
        choices: [
          "A. アクセストークンを無期限に有効にする",
          "B. 短命なアクセストークンのセキュリティを保ちつつ、再ログインを求める頻度を下げる",
          "C. パスワード送信を完全に不要にする代替手段",
          "D. サーバー側のセッションストアを必須にするために使う",
        ],
        answer: "B",
        point: "アクセストークンを短命（15分等）にして漏洩リスクを限定しつつ、リフレッシュトークン（有効期限長・安全に保管）で新しいアクセストークンを取得する。",
      },
      // 記述
      {
        no: 11, type: "記述", level: "基礎", conceptId: "c3-1",
        q: "ブログアプリの自由課題を想定して、要件定義フェーズで作成すべき成果物を3つ挙げ、それぞれの目的を説明してください。",
        answer: "例）①ユースケース図/一覧：誰が何をするかを整理し、機能スコープを確定する。②ER図（Entity Relationship Diagram）：テーブル・カラム・リレーションを設計しDB構造の認識を合わせる。③API仕様書（OpenAPI等）：エンドポイント・リクエスト/レスポンス形式を文書化し、フロントとバックエンドの接合点を明確にする。他にワイヤーフレーム・非機能要件一覧も可。",
      },
      {
        no: 12, type: "記述", level: "基礎", conceptId: "c3-2",
        q: "Git の merge と rebase の違いを説明し、フィーチャーブランチでの開発中にメインブランチの変更を取り込む場合、それぞれどのように使うか述べてください。",
        answer: "merge：2つのブランチの共通祖先からマージコミットを作成して統合。履歴が分岐として残る。rebase：フィーチャーブランチのコミットをメインブランチの先端に付け替え、線形履歴になる。フィーチャーブランチへの取り込みにはrebaseが使われることが多いが、push済みブランチへのrebaseは履歴書き換えになるため注意が必要。",
      },
      {
        no: 13, type: "記述", level: "基礎", conceptId: "c3-10",
        q: "アプリケーションのシークレット情報（DBパスワード・APIキー等）を .env ファイルで管理する理由と、.env ファイルを Git リポジトリにコミットしてはいけない理由を説明してください。",
        answer: "理由：コードとシークレットを分離することで、環境ごとに値を変えやすくなる（開発・ステージング・本番）。Gitにコミットしてはいけない理由：リポジトリが公開されたり、過去の履歴が漏洩した場合にシークレットが流出する。.gitignore に .env を追加し、代わりに .env.example（ダミー値のテンプレート）をコミットするのが定石。",
      },
      {
        no: 14, type: "記述", level: "基礎", conceptId: "c3-5",
        q: "ユニットテスト・結合テスト・E2Eテストの違いを表形式ではなく文章で説明し、Fastifyアプリで各テストの対象となる具体例を挙げてください。",
        answer: "ユニットテストは関数やモジュール単体（例：パスワードハッシュ関数、バリデーションロジック）を他の依存からモックして検証する。結合テストはモジュール間の連携（例：Fastifyのルートハンドラーと実際のDBを接続してAPIの動作）を確認する。E2Eテストはブラウザ操作から始まり、フロント・API・DBを通貫して（例：ログイン→記事投稿→一覧確認のシナリオ）確認する。上に行くほどテスト範囲が広くコストも高い。",
      },
      {
        no: 15, type: "記述", level: "基礎", conceptId: "c3-4",
        q: "本番環境のWebアプリでHTTPSが必須とされる理由を、通信の盗聴・改ざん・なりすましの3つの観点から説明してください。",
        answer: "盗聴：平文HTTP通信はネットワーク上で傍受可能。TLSによる暗号化で第三者が内容を読めなくなる。改ざん：中間者が通信内容を書き換えるMitM攻撃を、TLSの整合性検証で検知・防止できる。なりすまし：サーバー証明書（CA署名）により通信相手が本物のサーバーであることを検証でき、フィッシングサイトへの誘導を防ぐ。",
      },
      {
        no: 16, type: "記述", level: "応用", conceptId: "c3-3",
        q: "XSSを防ぐための多層防御として、サーバーサイド・クライアントサイド・HTTPヘッダーの3層でそれぞれ行うべき対策を説明してください。",
        answer: "サーバーサイド：ユーザー入力をHTMLに出力する際に特殊文字（<>&\"'）をエスケープする。テンプレートエンジンの自動エスケープ機能を活用する。クライアントサイド：innerHTML ではなく textContent を使い、ユーザー入力を直接DOM操作しない。DOMPurify等でサニタイズする。HTTPヘッダー：Content-Security-Policy（CSP）を設定して許可するスクリプト発生元を限定し、インラインスクリプトを禁止する。",
      },
      {
        no: 17, type: "記述", level: "応用", conceptId: "c3-6",
        q: "「Googleアカウントでログイン」を実装する場合、OAuthとOpenID Connectのどちらを使うべきか、その理由とともに認証フローの概要を説明してください。",
        answer: "OIDCを使う。OAuthはリソースアクセスの認可プロトコルであり、アクセストークンだけではユーザーのIDを安全に取得できない。OIDCはOAuth上にIDトークン（JWT）を追加し「誰であるか」を証明する。フロー概要：①アプリがGoogleの認証エンドポイントにリダイレクト。②ユーザーがGoogleで認証・同意。③認可コードをアプリに返却。④アプリがトークンエンドポイントでIDトークン・アクセストークンを取得。⑤IDトークンを検証してユーザー情報を得る。",
      },
      {
        no: 18, type: "記述", level: "応用", conceptId: "c3-8",
        q: "N+1問題が発生するコードの例（概念的な説明で可）と、それを解消するための具体的な手法を2つ説明してください。",
        answer: "例：posts.findAll() でN件取得後、ループ内で posts[i].getComments() をN回呼ぶ。合計N+1クエリ。解決策①：Eager Loading（JOIN）—ORM（Sequelizeの include、Prismaの include等）でリレーション先を最初のクエリでまとめて取得する。解決策②：DataLoaderパターン—同一tick内のリクエストをバッチにまとめてIN句1回で取得し、個別クエリを統合する。GraphQLバックエンドで特に使われる手法。",
      },
      {
        no: 19, type: "記述", level: "応用", conceptId: "c3-7",
        q: "RBAC（ロールベースアクセス制御）とABAC（属性ベースアクセス制御）の違いを説明し、ブログアプリにおける適用例をそれぞれ具体的に挙げてください。",
        answer: "RBAC：ユーザーにロール（admin/editor/viewer等）を割り当て、ロール単位で権限を定義する。シンプルで管理しやすい。例：adminロールのみ記事削除APIを呼べる。ABAC：ユーザー・リソース・環境の属性を組み合わせてアクセス可否を判定する。柔軟だが複雑になりやすい。例：記事の author_id がリクエストユーザーのIDと一致する場合のみ編集可能（所有者チェック）。RBACとABACを組み合わせて使うことも多い。",
      },
      {
        no: 20, type: "記述", level: "応用", conceptId: "c3-10",
        q: "OWASP Top 10 とは何かを説明し、ブログアプリに特に関連すると考えられる脅威を2つ挙げ、それぞれ実装上どのように対処するかを述べてください。",
        answer: "OWASPがWebアプリで最も重大なセキュリティリスクを10項目にまとめた啓発文書。ブログアプリでの関連例：①Injection（SQLインジェクション）—プリペアドステートメントやORMを使い入力値をそのままクエリに展開しない。②Security Misconfiguration（セキュリティ設定の不備）—デフォルトのシークレット使用禁止・エラーメッセージで内部情報を漏洩させない・不要なAPIエンドポイントを無効化する等。他にBroken Access Control（認可不備）、XSS、Cryptographic Failures（パスワード平文保存等）も挙げられる。",
      },
    ],
  },
];

// ============================================================
// COMPONENT
// ============================================================

const LEVEL_STYLE = {
  基礎: { bg: "#E6F1FB", color: "#0C447C" },
  応用: { bg: "#EEEDFE", color: "#3C3489" },
};
const TYPE_STYLE = {
  選択: { bg: "#EAF3DE", color: "#27500A" },
  記述: { bg: "#FAEEDA", color: "#633806" },
};

function Badge({ label, style }) {
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px",
      borderRadius: 6, fontWeight: 500,
      background: style.bg, color: style.color,
      border: `0.5px solid ${style.color}22`,
    }}>{label}</span>
  );
}

function ConceptRow({ c }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "80px 1fr 2fr",
      gap: 12, padding: "8px 0",
      borderBottom: "0.5px solid var(--color-border-tertiary,#e5e5e5)",
      alignItems: "start",
    }}>
      <Badge label={c.level} style={LEVEL_STYLE[c.level]} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary,#111)" }}>{c.name}</div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary,#666)", marginTop: 2 }}>{c.category}</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary,#555)", lineHeight: 1.6 }}>{c.desc}</div>
    </div>
  );
}
const CONCEPT_BY_ID = Object.fromEntries(
  COURSES.flatMap(course => course.concepts).map(concept => [concept.id, concept])
);

function QuestionCard({ q, idx, showAnswer, onToggle }) {
  const concept = CONCEPT_BY_ID[q.conceptId];
  return (
    <div style={{
      background: "var(--color-background-primary,#fff)",
      border: "0.5px solid var(--color-border-tertiary,#e5e5e5)",
      borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary,#888)", minWidth: 28, paddingTop: 2, fontWeight: 500 }}>Q{q.no}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: "var(--color-text-primary,#111)", lineHeight: 1.65 }}>{q.q}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <Badge label={q.type} style={TYPE_STYLE[q.type] || TYPE_STYLE["記述"]} />
            <Badge label={q.level} style={LEVEL_STYLE[q.level]} />
            {concept && (
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary,#999)", paddingTop: 2 }}>
                概念：{concept.name}
              </span>
            )}
          </div>
          {q.choices && (
            <div style={{ marginTop: 10 }}>
              {q.choices.map((ch, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "var(--color-text-secondary,#444)",
                  padding: "4px 0", lineHeight: 1.5,
                }}>{ch}</div>
              ))}
            </div>
          )}
          <button
            onClick={() => onToggle(idx)}
            style={{
              marginTop: 10, fontSize: 12, padding: "4px 12px",
              borderRadius: 6, border: "0.5px solid var(--color-border-secondary,#ccc)",
              background: "transparent", cursor: "pointer",
              color: "var(--color-text-secondary,#666)",
            }}
          >
            {showAnswer ? "解答を隠す" : "解答・解説を見る"}
          </button>
          {showAnswer && (
            <div style={{
              marginTop: 8, padding: "10px 14px",
              background: "var(--color-background-secondary,#f8f8f8)",
              borderRadius: 8, fontSize: 13,
              color: "var(--color-text-primary,#333)", lineHeight: 1.7,
              borderLeft: "3px solid #1D9E75",
            }}>
              {q.type === "選択" && (
                <div style={{ fontWeight: 500, marginBottom: 4, color: "#0F6E56" }}>正解：{q.answer}</div>
              )}
              <div>{q.answer || q.point}</div>
              {q.type === "選択" && q.point && (
                <div style={{ marginTop: 6, color: "var(--color-text-secondary,#666)" }}>{q.point}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("html");
  const [view, setView] = useState("concepts"); // "concepts" | "questions"
  const [openAnswers, setOpenAnswers] = useState({});
  const [filter, setFilter] = useState("全て"); // 全て / 基礎 / 応用 / 選択 / 記述

  const course = COURSES.find(c => c.id === tab);

  const toggleAnswer = (idx) => {
    setOpenAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredQ = course.questions.filter(q => {
    if (filter === "全て") return true;
    return q.level === filter || q.type === filter;
  });

  const tabStyle = (id) => ({
    padding: "8px 16px", borderRadius: 8,
    border: "0.5px solid",
    borderColor: tab === id ? "var(--color-border-primary,#aaa)" : "var(--color-border-tertiary,#e5e5e5)",
    background: tab === id ? "var(--color-background-primary,#fff)" : "var(--color-background-secondary,#f8f8f8)",
    color: tab === id ? "var(--color-text-primary,#111)" : "var(--color-text-secondary,#666)",
    cursor: "pointer", fontSize: 13, fontWeight: 500,
  });

  const subTabStyle = (v) => ({
    padding: "6px 14px", borderRadius: 6,
    border: "0.5px solid",
    borderColor: view === v ? "#1D9E75" : "var(--color-border-tertiary,#e5e5e5)",
    background: view === v ? "#E1F5EE" : "transparent",
    color: view === v ? "#0F6E56" : "var(--color-text-secondary,#666)",
    cursor: "pointer", fontSize: 12, fontWeight: 500,
  });

  const filterStyle = (f) => ({
    padding: "4px 10px", borderRadius: 6,
    border: "0.5px solid var(--color-border-tertiary,#e5e5e5)",
    background: filter === f ? "var(--color-background-secondary,#f0f0f0)" : "transparent",
    color: filter === f ? "var(--color-text-primary,#111)" : "var(--color-text-secondary,#888)",
    cursor: "pointer", fontSize: 12,
  });

  return (
    <div style={{ padding: "1.5rem 0", fontFamily: "var(--font-sans, sans-serif)" }}>
      <h2 className="sr-only">ジュニアエンジニア研修 確認テスト 概念リストと問題集</h2>

      {/* Course tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {COURSES.map(c => (
          <button key={c.id} onClick={() => { setTab(c.id); setOpenAnswers({}); }} style={tabStyle(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
        <button onClick={() => setView("concepts")} style={subTabStyle("concepts")}>重要概念リスト</button>
        <button onClick={() => setView("questions")} style={subTabStyle("questions")}>テスト問題（20問）</button>
      </div>

      {/* Concept list */}
      {view === "concepts" && (
        <div style={{
          background: "var(--color-background-primary,#fff)",
          border: "0.5px solid var(--color-border-tertiary,#e5e5e5)",
          borderRadius: 12, padding: "1rem 1.25rem",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr 2fr",
            gap: 12, paddingBottom: 8, marginBottom: 4,
            borderBottom: "0.5px solid var(--color-border-primary,#ccc)",
          }}>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary,#888)", fontWeight: 500 }}>レベル</span>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary,#888)", fontWeight: 500 }}>概念名</span>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary,#888)", fontWeight: 500 }}>カバー内容</span>
          </div>
          {course.concepts.map(c => <ConceptRow key={c.id} c={c} />)}
          <div style={{ marginTop: "1rem", fontSize: 12, color: "var(--color-text-tertiary,#aaa)" }}>
            各概念は問題に紐付けられています。「テスト問題」タブで各問のバッジを確認できます。
          </div>
        </div>
      )}

      {/* Questions */}
      {view === "questions" && (
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary,#888)", marginRight: 4 }}>絞り込み：</span>
            {["全て", "基礎", "応用", "選択", "記述"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={filterStyle(f)}>{f}</button>
            ))}
            <span style={{ fontSize: 12, color: "var(--color-text-tertiary,#aaa)", marginLeft: 8 }}>
              {filteredQ.length}問 表示中
            </span>
          </div>
          {filteredQ.map((q, i) => (
            <QuestionCard
              key={q.no}
              q={q}
              idx={`${tab}-${q.no}`}
              showAnswer={!!openAnswers[`${tab}-${q.no}`]}
              onToggle={toggleAnswer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
