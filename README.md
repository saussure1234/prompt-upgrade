# 動画コピー生成ツール

動画広告のPDCAを最大20本まとめて回すための、上位マーケター向けコピー生成ツール。
仮説検証に必要な量を一瞬で出すことが価値。**プロンプト品質が最重要課題**。

- **公開URL**: https://saussure1234.github.io/prompt-upgrade/
- **本体**: 単一HTML（[index.html](index.html)）。ブラウザから Gemini API を直接呼ぶ
- **プロンプト品質ルール**: [CLAUDE.md](CLAUDE.md) に集約。**編集前に必読**

---

## ローカル開発

```bash
git clone https://github.com/saussure1234/prompt-upgrade.git
cd prompt-upgrade
open index.html   # ブラウザで開くだけ。ビルド不要
```

API キーは画面の入力欄に貼る（localStorage に保存される。リポジトリには含めない）。

---

## 開発フロー

```
main (= 公開URLに自動デプロイ)
  ↑ merge
  PR (レビュー必須)
  ↑ push
  feature branch
```

`main` への直接 push は禁止。**必ずブランチ → PR → レビュー → マージ**。
マージ後、1〜2分で公開URLに反映される。

### ブランチ命名

役割 / 対象 がひと目で分かる名前にする：

- `prompt/halo-authority-fix` — プロンプト本文の修正
- `validator/anchor-limit` — `enforce*` 系バリデーション関数の修正
- `ui/api-key-input` — UI / 表示まわり
- `fix/<短い説明>` — バグ修正
- `docs/<短い説明>` — ドキュメントのみ

---

## PR を出すときのチェックリスト

PR description に貼って、自分でチェックしてから出す。

### 共通

- [ ] CLAUDE.md の該当ルールに違反していない
- [ ] 文字数制限（hook/body 16〜24字、cta 13〜20字）を逸脱する出力を生まない変更か
- [ ] 「。」「．」「漢数字」を生成させる方向の変更になっていない

### プロンプト本文を変えた場合

- [ ] 5パターン（empathy / paradigm / zeigarnik / loss / halo）の本質を曖昧にしていない
- [ ] halo を触った場合、「〇〇ほど〇〇している」構文と、述語のコミット系縛りを保持
- [ ] Body 訴求明瞭性の8パターン（CLAUDE.md 参照）を弱めていない
- [ ] 日本語自然性の8パターン（勧誘形 vs テイル形 等）を弱めていない

### バリデーション関数（`enforce*` / `rebalance*` / `forceReassignUnusedAngles` / `autoFixDiversity`）を触った場合

- [ ] **呼び出しチェーンに繋がっているか確認した**（過去にここが切れて検証が無効化された事故あり）
  - 2〜4: `btn-fetch-lp.onclick` 内
  - 6〜9: `btn-generate.onclick` 内
- [ ] 既存バリデーションを削除していない（追加はOK、削除は要相談）

### 動作確認

- [ ] ローカルで `index.html` を開き、実際にLP分析→生成まで通した
- [ ] 5パターン × v1/v2 = 10本の出力を目視チェックし、訴求被り・字数違反・halo構文崩れがない

---

## レビュアーが見るべきポイント

1. **バリデーションの呼び出しが切れていないか**（最重要。grep で `enforceHookSimilarity` 等が `onclick` ハンドラから到達可能か確認）
2. **CLAUDE.md の NG 例集**（過去指摘の再生産禁止リスト）に該当する出力を許す変更になっていないか
3. **5パターンの本質を弱めていないか**（特に halo の権威構文）
4. **副作用のない最小差分か**（プロンプト1ヶ所の修正のために UI や他パターンまで触っていないか）

迷ったら **CLAUDE.md を引用してコメント**。ルールの根拠はそこに集約されている。

---

## ファイル構成

```
.
├── index.html      # ツール本体（単一HTML）
├── CLAUDE.md       # プロンプト品質ルール集（編集前に必読）
└── README.md       # このファイル
```
