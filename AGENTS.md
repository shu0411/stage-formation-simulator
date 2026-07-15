# AGENTS.md（stage-formation-simulator）

このプロジェクト固有のガイド。開発ルール全般はグローバルの AGENTS.md に従う。

## プロジェクト概要

ステージフォーメーションを 2D エディターで作成・編集し、3D 空間へリアルタイムに
反映して客席視点から確認できる Web アプリケーション。バックエンドを持たない SPA。

## ドキュメント構成（SSOT）

詳細はこの AGENTS.md に書かず、以下を正とする。

- [docs/spec/concept.md](docs/spec/concept.md) — 企画。目的・想定ユーザー・MVP の範囲・将来拡張
- [docs/spec/design.md](docs/spec/design.md) — 設計。1 章が仕様設計（機能仕様・座標系・共通ルール）、
  2 章が技術設計（システム構成・データ設計・テスト方針）
- [README.md](README.md) — セットアップと開発コマンド（dev / lint / format / test / test:e2e / build）

挙動や構成を変更したら、design.md・README を同じ変更内で更新する。

## 技術スタック

React + TypeScript + Vite。3D 描画は Three.js（React Three Fiber + Drei）、
フォーム系 UI は MUI。状態管理は React 標準機能（useReducer + Context）のみ。
永続化は LocalStorage と JSON ファイル入出力。選定理由と適用範囲は design.md 2.1 を参照。

## アーキテクチャ

クリーンアーキテクチャに準じたレイヤード構成。React 層（components / hooks /
state / App）→ application → domain の一方向依存とし、infrastructure は
application の ports を実装する（依存性逆転、結線は main.tsx）。
各ディレクトリの責務・新しいロジックの置き場所の判断基準・テストファイルの
配置ルールは design.md 2.1 を参照。

## テスト

- ユニットテスト: Vitest。React に依存しない domain / application が主対象
- E2E テスト: Playwright（`e2e/`）
- 方針の詳細は design.md 2.5 を参照
