# TOEFL ITP演習サイト エンジニアリングタスク分解

PRD([toefl-itp-prd.md](./toefl-itp-prd.md))のP0要件を、実装着手できる粒度のエピック・タスクに分解したもの。ソロ開発を前提に、依存関係を踏まえた推奨実装順序も付す。

## 技術スタック(決定事項)

| 項目 | 選定 |
|---|---|
| ホスティング | Cloudflare Pages |
| データベース | Cloudflare D1 |
| フレームワーク | Next.js(`@cloudflare/next-on-pages` でCloudflare Pagesにデプロイ) |
| 認証 | Googleログインのみ(Cloudflare Pages Functions上で自前実装、またはCloudflare対応のOAuthライブラリを利用) |
| v1対象セクション | Structure and Written Expression / Reading(Listeningは将来のP2フェーズ) |
| コンテンツ制作 | AI生成 → AIダブルチェック → 人間の最終確認 |

## Epic 0: プロジェクト基盤構築
- Next.jsプロジェクトの作成、`@cloudflare/next-on-pages` でのCloudflare Pagesデプロイ設定
- Cloudflare D1データベースの作成・マイグレーション管理の仕組み選定(例: Drizzle ORM + D1アダプタ)
- 環境変数・シークレット管理(Google OAuthクライアントID/シークレット等)の方式決定
- CI/CD(GitHub Actions等)でのビルド・デプロイ自動化

## Epic 1: 認証(Googleログイン)
- Google Cloud ConsoleでのOAuthクライアント登録
- Next.js + Cloudflare Pages Functions上でのOAuthフロー実装
- セッション管理(Cookie/JWT等)の実装
- ログイン/ログアウトUI

## Epic 2: データモデル設計
- 問題(Question): セクション種別・問題文・選択肢・正解・解説・難易度タグ等
  - セクション種別は将来のListening追加を見据え、enumやマスタテーブルで疎結合に設計する
- ユーザー(User)
- 演習履歴(Attempt): ユーザー×問題×正誤×日時
- 誤答ノート: Attemptから不正解のみを抽出、または専用テーブルで管理
- 模試セッション(MockTestSession): 進行状態・セクション別タイマー残時間・スコアを永続化(通信切断・リロード時の復元に必要)

## Epic 3: セクション別演習(PRD P0-1)
- セクション選択画面(Structure / Reading)
- 設定画面(Grammarのタイプ別問題数、Readingの問題数、タイマーなし/経過時間/制限時間)
- published問題のタイプ別・パッセージ単位抽出と設定値のサーバー検証
- 出題画面(タイマーなしは即時フィードバック、時間計測ありは前後移動・回答変更・提出後一括採点)
- 共通wall-clockタイマー(毎秒更新、visibility復帰補正、制限時間超過時の一重自動提出)
- 演習結果のAttemptテーブルへの単問/一括記録。120〜150問でもD1のbound parameter制限を超えない分割保存
- 依存: Epic 1(認証)、Epic 2(データモデル)、最低限の問題データ(Epic 7・8)

## Epic 4: 誤答管理・復習ノート(PRD P0-3)
- 不正解時の自動記録ロジック
- 復習ノート一覧画面(セクション・日付での絞り込み)
- 誤答のみの再演習フロー
- 再演習で正解した問題の除外/達成マーク処理
- 依存: Epic 3

## Epic 5: 模試モード(PRD P0-2)
- 固定構成(Grammar40問: 文法補充15/誤り指摘25、25分 → Reading50問、55分)の開始制御
- 開始画面の在庫検証と、制限時間/経過時間だけの選択UI
- 共通タイマーの利用(クライアント表示 + サーバー側での回答・フラグ期限判定)
- 通信切断・リロード時の状態復元(MockTestSessionのD1永続化)
- 回答保存と完了時Attempt INSERTの分割、完了済み旧カスタムセッションの固定構成再受験
- 終了後のスコアサマリー画面
- 依存: Epic 2、Epic 3

## Epic 6: スコア換算・弱点分析ダッシュボード(PRD P0-4)
- 非公式換算表の複数ソース調査・突き合わせによる換算ロジックの実装
- 「公式スコアではない」「Listeningを含まない暫定スコア」であることを明示する注記UI
- セクション別・分野別正答率の可視化(グラフ)
- 弱点分野のハイライト表示
- 依存: Epic 3、Epic 5(演習・模試の結果データが必要)

## Epic 7: 管理画面(問題管理)
- 問題の追加・編集・削除UI
- AI生成 → AIダブルチェック → 人間確認のステータス管理(下書き/AI検証済み/公開済み等)
- 依存: Epic 1、Epic 2。**Epic 3より前、または並行して着手する必要がある**(演習機能の動作確認に問題データが必要なため)

## Epic 8: コンテンツ制作パイプライン(PRD P0-5)
- Structure and Written Expression / Reading 各設問タイプ向けのAI生成プロンプト設計
- 別AIによるダブルチェック(正解の妥当性・設問と選択肢の自然さ)の実装・運用フロー
- Structure 120問 / Reading 150問、計270問の生成・レビュー・Epic 7経由での投入
- Epic 3の開発と並行して継続的に実施する

## 推奨実装順序

1. **基盤フェーズ**: Epic 0(プロジェクト基盤)→ Epic 2(データモデル)→ Epic 1(認証)→ Epic 7(管理画面、最低限のCRUD)
   - Epic 8(コンテンツ制作)はこのフェーズから並行開始し、Epic 3の動作確認に使える問題を先行投入する
2. **フェーズ1**: Epic 3(セクション別演習)— 後輩がまず使える最小状態
3. **フェーズ2**: Epic 4(誤答管理・復習ノート)
4. **フェーズ3**: Epic 5(模試モード)
5. **フェーズ4**: Epic 6(スコア換算・弱点分析ダッシュボード)
6. v1公開後: Listeningセクションの追加(PRD Future Considerations参照)

## Verification(各フェーズ共通)
- 各Epic完了時に、PRD該当セクションのAcceptance criteriaを1つずつ手動で確認する
- Epic 3以降は、実際にGoogleログイン→演習→結果保存の一連の流れをブラウザで通しテストする
- 模試モード(Epic 5)は、タブを閉じて再度開く/オフラインにする等でセッション復元を明示的に確認する
