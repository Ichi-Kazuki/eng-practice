# 演習設定・固定模試・共通タイマー実装計画

## 1. 現在の構造

### 演習

- /app/practice は公開中問題をセクション別に集計し、Grammar / Reading のカードから /app/practice/[section] へ遷移する。
- /app/practice/[section]/page.tsx は対象セクションの全 published 問題を取得し、パッセージ単位でシャッフルして QuestionRunner に渡す。
- QuestionRunner は index と selections をReact stateで保持し、選択直後に正誤・正解・解説を表示して選択肢をロックする。
- 各回答は /api/attempts に送信され、ゲストを含む users の attempts に保存される。
- 問題セット、現在位置、回答、経過時間は永続化されず、再読み込みすると新しいランダムセットで最初から始まる。
- 復習ノートの再演習も同じQuestionRunnerを利用しているため、演習固有変更はmode分岐で隔離する必要がある。

### 問題データ

- Grammarの正式なquestionTypeは structure_completion（文法補充）と structure_error_id（誤り指摘）。
- シード上は文法補充64問、誤り指摘56問、Reading150問。
- Readingは25パッセージ、各6問。questions.passageIdからpassagesへ関連する。
- 学習者向け抽出は questions.status = published のみ。
- shuffle() は単純なFisher–Yatesシャッフル。

### 模試

- /app/mock の MockConfigForm は現在、セクション、セクション別問題数、時間モードを選択する。
- startMockTest がFormDataを読み、buildMockSections()で問題ID・セクション順・時間制限を生成し、mock_sessionsへ保存する。
- Grammarの本番相当40問は文法補充15問・誤り指摘25問。短縮時はほぼ半数ずつ。
- Readingは問題ID全体をシャッフルして指定数を切り出す。
- mock_sessions.sections は問題ID、timeMode、startedAt、submittedAt、flagsを持ち、answersはセッション全体で保存する。
- MockSectionRunnerは回答と見直しフラグをServer Actionへ保存し、リロード後も復元する。
- 模試結果は専用routeで採点し、セクション別正答数、非公式推定スコア、問題別解説を表示する。

### タイマー

- fixed は startedAt と timeLimitSec から残り時間を計算する。
- stopwatch は startedAt から経過時間を計算する。
- pause機能はない。
- 表示・計測・timeout処理はMockSectionRunnerに密結合している。
- timeoutはクライアントで表示して1.5秒後に自動提出する。
- answerMockQuestion と submitMockSection に期限超過のサーバー判定はなく、設計資料の「サーバー側時間切れ判定」と実装が一致していない。

## 2. 現在の問題点

- 演習にtype、問題数、timerの設定がない。
- 演習に遅延feedback、手動提出、timeout結果の概念がない。
- 模試の自由設定が本番固定方針と矛盾する。
- Timerをコピーすると演習と模試の二重管理になる。
- QuestionRunnerは即時feedback前提で、回答変更・前後移動・一括採点に対応していない。
- 単問APIだけでは「すべて」の120～150回答を終了時に保存すると60件/分のレート制限に抵触する。
- 模試完了時の多行INSERTはD1の100 bound parameter制限を超える可能性がある。
- 旧PRDの模試カスタマイズ記述を更新しないと仕様書と実装がずれる。

## 3. 推奨する完成形

### 演習

画面遷移は、/app/practice → GrammarまたはReading → /app/practice/[section]の設定 → 同じrouteへ検証済みqueryを付けて問題開始 → 結果、の順とする。

Grammar設定:

- 問題タイプは文法補充、誤り指摘、両方。
- 問題数は文法補充が 5 / 10 / 15 / 20、誤り指摘が 5 / 10 / 20 / 25。
- 両方では文法補充数と誤り指摘数を独立設定し、合計を表示する。
- Timerはタイマーなし、経過時間、制限時間。
- 初期値は両方、5問＋5問、タイマーなし。

Reading設定:

- 問題タイプ選択は設けない。
- 問題数は 5 / 10 / 20 / 50。
- 問題数は厳密に守るため、最後のパッセージは一部設問になる場合がある。
- 初期値は10問・タイマーなし。

演習中:

- タイマーなしだけは現在どおり即時feedbackを維持する。
- 経過時間は時間制限を設けず、制限時間モードと同じ遅延feedback型にする。解答中は正誤・解説を隠し、最後の提出後に回答・正誤・解説を表示する。
- 経過時間と制限時間では回答変更と前へ／次へを許可する。経過時間はtimeoutなしで、ユーザーの手動提出によって終了する。
- 経過時間と制限時間は完了結果に実際の所要時間を表示する。
- 問題番号グリッドと見直しフラグは演習には追加しない。
- 手動提出では未解答数を確認する。
- 時間切れは即時提出し、回答済み分を採点して結果・解説へ進む。
- pauseは追加しない。

### 模試

画面遷移は、/app/mock → 固定構成の説明 → 経過時間または制限時間の選択 → 開始、とする。

- Grammar 40問（文法補充15問・誤り指摘25問・25分）。
- Reading 50問（55分）。
- Grammar → Readingの順序を維持する。
- 選択可能なのは経過時間と制限時間だけ。タイマーなし、セクション、type、問題数はUIから除去する。
- Listening未対応、2セクション構成であることを説明する。
- 在庫不足時は問題数を黙って減らさず、開始を無効化する。
- 既存の回答・フラグ・採点・結果・リロード復元は維持する。
- 進行中の旧カスタムセッションはその構成で再開可能にし、完了済み旧セッションの再受験は新固定構成にする。

## 4. 変更対象ファイル

### 演習・API

- web/src/app/app/practice/[section]/page.tsx: query検証、設定表示と問題表示の切り替え、Grammar/Reading抽出。
- web/src/components/question-runner.tsx: immediate/deferred feedback、timer、前後移動、提出、timeout、結果phase。
- 新規 web/src/components/practice-config-form.tsx: 条件付きtype別count、合計数、timer、GET送信。
- 新規 web/src/lib/practice-config.ts: 設定型、query parsing、プリセット、時間計算、抽出規則。
- web/src/app/api/attempts/route.ts: 単問payloadとの互換性を保った一括回答payload、サーバー検証、D1分割保存。

### Timer

- 新規 web/src/components/use-session-timer.ts: wall-clock基準の経過・残り時間、毎秒更新、visibility復帰補正、timeout一重化、時刻整形。
- web/src/components/mock-section-runner.tsx: インラインtimer処理を共通hookへ移し、模試固有の表示・自動提出・グリッド・フラグは維持。

### 模試

- web/src/components/mock-config-form.tsx: セクション・問題数UIを削除し時間モードだけにする。既存の未コミット変更を尊重し、localStorageはtimeModeだけ継続する。
- web/src/app/app/mock/page.tsx: 固定構成の説明と在庫不足表示。
- web/src/app/app/mock/actions.ts: 固定requests、在庫再検証、期限後の回答・フラグ拒否、attempt INSERT分割、再受験正規化。
- web/src/lib/mock-session.ts: buildMockSectionsとGrammar15/25抽出は維持し、開始可否判定を追加。UI不要のcountPresetsは削除候補。
- web/src/lib/section-meta.ts: 演習・模試共通の時間・固定構成値の参照元として整理する。
- web/src/db/schema.ts:互換性確認のみ。今回のschema変更・migrationは不要。

### 仕様書

- docs/toefl-itp-prd.md: 模試を固定構成＋時間方式だけに更新し、演習3種timerとtype別countを追加。
- docs/toefl-itp-engineering-tasks.md: 設定、共通timer、遅延feedback、固定模試のタスクを更新。
- docs/design-plan-app.md: 設定画面、timer、responsive、accessibilityを更新。

## 5. 状態管理設計

- sectionはroute segmentを正とし、structure/reading以外は404。
- Grammarのqueryは type=structure_completion / structure_error_id / both、completionCount、errorCount、timer。
- Readingのqueryは count、timer。値は5、10、20、50だけを許可する。GrammarのcompletionCountは5、10、15、20、errorCountは5、10、20、25だけを許可する。
- 共通timer型は none / stopwatch / fixed。模試はfixed / stopwatchだけ。
- 演習answersはQuestionRunner内の Record<questionId, selectedIndex>。
- noneは回答ごとに保存、stopwatchとfixedは提出時に一括保存する。
- fixedのnavigationはindexと前へ／次へだけ。グリッド・フラグは持たない。
- phaseは running → submitting → result。timeoutと手動提出をrefで一重化する。
- URLには設定だけを残し、問題ID、回答、index、開始時刻、結果はリロード復元しない。

## 6. 問題抽出設計

### Grammar

1. typeごとにpublished問題を取得する。
2. 各type配列をシャッフルする。
3. 指定数まで切り出す。
4. 両方は結合後に再シャッフルする。
5. 一方の不足を他方で補完せず、利用可能数を表示して開始を止める。
6. queryの任意件数・過大件数・未知typeは拒否する。

### Reading

1. published問題をpassage付きで取得する。
2. passageごとにグループ化する。
3. passage順と各passage内の設問順をシャッフルする。
4. 平坦化後、先頭から指定問数を厳密に切り出す。
5. 同一passageの設問は連続表示し、最後のpassageの部分選択を許容する。
模試の既存Reading抽出は、設定UI削除とは分けて維持する。問題単位抽出でpassageが断片化する点は別リスクとする。

## 7. タイマー設計

### 共通化

- startedAtMsからの経過秒、fixedの残り秒、stopwatchの経過秒。
- MM:SS表示、1秒更新、visibility復帰時のwall-clock再計算。
- hydration差異回避、timeout callbackの一重化、interval cleanup。

### 演習固有

- noneはtimerを起動・表示しない。
- 開始時刻は問題画面mount時にクライアント生成する。
- stopwatchは時間制限なしの遅延feedback型とし、回答中は正誤・解説を表示しない。手動提出後に回答・正誤・解説と経過時間を結果に表示する。
- fixedの制限秒は総数×既存ペース（Grammar 37.5秒/問、Reading 66秒/問）。
- fixedは解答中の正解を隠し、提出時に一括保存・採点する。
- 演習timerはDB非永続・クライアント基準で、厳密な不正防止用途にはしない。

### 模試固有

- startedAtMsはDB値を使用し、リロード後も継続する。
- timeoutはセクション提出、次セクションまたは結果へ進める。
- fixedではServer Actionでも期限を検証し、期限後の回答・フラグ更新を拒否する。
- stopwatchは自動提出しない。
- セクション開始・startedAt永続化は維持する。

## 8. コンポーネント設計

### そのまま再利用

- Button、Card、JaHeading、QuestionStem。
- Zinc/cobalt CSS token、Phosphor icons、Literata、Geist Mono。

### 拡張

- QuestionRunner: timerMode、timeLimitSec、section labelを受け、noneはimmediate、stopwatch/fixedはdeferredに分岐。復習ノートは既存挙動を維持する。
- MockConfigForm: 名前は維持しつつ時間方式だけに縮小。
- MockSectionRunner: 共通timerを使用し、模試固有のグリッド・フラグ・永続化を保持。

### 新規

- PracticeConfigForm: native radio、fieldset/legend、type別count、合計のaria-live。
- useSessionTimer: UIやDBを知らない小さなhook。
- fixed演習結果は当初QuestionRunner内に実装し、模試結果との大規模共通化は避ける。

### Responsive / accessibility

- mobileは設定タイル1列、desktopは2～3列。
- タップ領域は44px相当、CTAはmobile全幅。
- timerはstickyだが本文を隠さない。
- 毎秒値は過剰に読み上げず、時間切れのみlive regionで通知する。
- 選択状態は色だけに依存せず、native radio、border、文字でも表現する。
- keyboard、focus-visible、dark mode、reduced motionを維持する。

## 9. 実装手順

1. 仕様型・query・プリセット・時間計算をpractice-config.tsへ定義する。完了条件は有効・無効設定を純粋関数で検証できること。
2. practice pageとPracticeConfigFormを実装する。queryなしは設定、検証済みqueryは抽出済み問題とする。
3. useSessionTimerを抽出し、MockSectionRunnerでfixed/stopwatchとリロード補正が維持されることを確認する。
4. QuestionRunnerをnoneの即時型とstopwatch/fixedの遅延型へ拡張する。
5. attempts APIに一括payloadを追加し、120/150問でもrate limitとD1 bound制限を超えないよう分割する。
6. 模試開始画面からセクション・type・問題数設定を削除し、server actionで固定requestsだけを生成する。
7. 模試actionsに期限判定とINSERT分割を追加する。
8. PRD、engineering tasks、design planを実装と同期する。
9. lint、build、desktop/mobile、guest/login、既存復習・模試結果を回帰確認する。

## 10. テスト計画

### Grammar

- 文法補充のみ、誤り指摘のみ、両方を開始できる。
- 両方のtype別設定数と総数が一致する。
- 文法補充で5/10/15/20、誤り指摘で5/10/20/25を検証する。
- 過大count、未知type、非公開問題混入を拒否する。
- 両方の出題順がtype別ブロックにならない。

### タイマーなし

- 選択直後に正誤・正解・解説が出る。
- 二重回答を防ぎ、timerを起動しない。
- 復習ノートのQuestionRunnerが回帰しない。

### 経過時間

- 時間切れが発生せず、ユーザーが手動提出するまで解答を続けられる。
- 解答中は正誤・正解・解説を表示しない。
- 前へ／次へで移動でき、回答を変更できる。
- 手動提出後に正答、不正解、未解答、解説、実際の経過時間を表示する。
- 提出時に回答が一括保存され、二重提出で重複保存されない。

### 制限時間演習

- 解答中は正解・解説を隠す。
- 前後移動、回答変更、未解答確認が動く。
- 手動提出とtimeoutで同じ結果phaseになる。
- timeoutと手動提出が競合しても一度だけ保存する。
- 正答、不正解、未解答、解説を結果で確認できる。
- 保存失敗時もローカル結果を失わず通知する。

### Reading

- 5/10/20/50を厳密に抽出する。
- 同一passageの設問が連続する。
- 部分passageでも本文・設問対応が崩れない。
- タイマーなしはimmediate、経過時間と制限時間はdeferred feedbackになることを検証する。
- desktopの2カラム、mobileの縦積み、横スクロールなしを確認する。

### 模試

- 開始画面にセクション、type、問題数選択がない。
- fixedでGrammar40、Reading50、Grammar15/25を確認する。
- stopwatchで同じ90問を経過時間だけで実施する。
- 在庫不足、FormData改変、任意件数指定を拒否する。
- 回答、フラグ、current section、timerのリロード復元を確認する。
- timeoutで次セクションまたは結果へ進む。
- 期限後の回答・フラグ更新を拒否する。
- 採点、attempt、推定スコア、Listening非包含注記、詳細結果を維持する。
- 旧進行中セッション再開と旧完了セッション再受験を確認する。

### 共通

- 360px前後のmobile、tablet、desktopで設定・問題・結果を確認する。
- keyboardのみでradio、選択肢、前後移動、提出を操作する。
- focus、contrast、dark mode、reduced motionを確認する。
- guestとGoogleログイン双方でownershipを確認する。
- 単問attempt APIとの後方互換性を確認する。
- 120/150問と模試90問の保存がD1の100 parameter制限を超えないことを確認する。
- npm run lint、npm run buildを実行する。
- practice、notebook、dashboard、mock result、auth導線を回帰確認する。

## 11. リスク・未決事項

### 確定した判断

- 演習timeoutは即時提出して結果へ進む。
- Grammarの「両方」は自動比率ではなくtypeごとに問題数を設定する。
- Readingは5/10/20/50を厳密に守り、部分passageを許容する。
- 演習に問題番号グリッドと見直しフラグは含めない。
- 演習session永続化は行わず、URLには設定だけ残す。
- 設定routeは既存 /app/practice/[section] とqueryを使う。
- pauseは追加しない。

### リスク

- Readingの部分passageが不自然になる可能性がある。同一passageを連続表示し、別案としてpassage単位選択を将来検討する。
- 模試Readingは現状問題単位抽出でpassageが断片化する。今回は内部生成ロジック維持を優先し、別タスクとする。
- 演習fixed timerはクライアント基準であり、端末時計操作には耐えない。模試だけサーバー期限で補強する。
- 現在のmock-config-form.tsxの未コミット変更と競合しないよう、時間モードのlocalStorage復元を保持して統合する。
- 旧PRDとの衝突は同じ変更セットで文書更新し、「UIから削除」と「内部生成ロジック維持」を明記する。

## 実装範囲外

- 演習用DBセッション、migration、reload復元。
- 演習用見直しフラグの永続化。
- Listeningの追加。
- 模試の内部問題生成アルゴリズム自体の再設計。
- deploy、remote migration、seed変更。
