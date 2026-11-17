import '@testing-library/jest-dom/vitest';

// jsdom は Pointer Capture API を実装していないため、ドラッグ処理（setPointerCapture の
// 呼び出し）をテストできるようにスタブを用意する。
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;
