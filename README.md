# stage-formation-simulator

ステージフォーメーションを 2D エディターで作成・編集し、3D 空間へリアルタイムに反映して
客席視点から確認できる Web アプリケーション。

- 仕様・設計: [docs/spec/concept.md](docs/spec/concept.md) / [docs/spec/design.md](docs/spec/design.md)

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

## テスト・Lint

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript（型チェック）
npm run format:check  # Prettier
npm test              # Vitest（ユニットテスト）
npm run test:e2e      # Playwright（E2E テスト）
```

## ビルド

```bash
npm run build
```

## Dependabot PR の自動レビュー

[Claude Dependency Review](.github/workflows/claude-dependency-review.yml) が
Dependabot PR をレビューし、結果を PR に投稿する。実行条件と権限分離は
[設計書の CI 方針](docs/spec/design.md#25-テスト方針)を参照。

実行にはリポジトリから参照可能な Actions Secret `CLAUDE_CODE_OAUTH_TOKEN` が必要。
