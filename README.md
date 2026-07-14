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
npm run format:check  # Prettier
npm test              # Vitest（ユニットテスト）
npm run test:e2e      # Playwright（E2E テスト）
```

## ビルド

```bash
npm run build
```
