import { expect, test, type Page } from '@playwright/test';
import { STAGE_VIEW_BOX as VIEW_BOX } from '../src/hooks/svgCoordinates';

const MOBILE_PORTRAIT_VIEWPORT = { width: 390, height: 844 };
const MOBILE_LANDSCAPE_VIEWPORT = { width: 844, height: 390 };

/**
 * 俯瞰図上でメンバーをドラッグすると、手前端・奥端付近でもポインター位置に
 * 追従することを確認する（PC・モバイル縦表示・モバイル横表示で共通に使う）。
 */
async function expectDragFollowsPointerNearEdges(page: Page) {
  await page.goto('/');
  await page.getByLabel('2D編集ポップアップを開く').click();
  await page.getByRole('button', { name: 'メンバーを追加' }).click();

  const svgBox = await page.locator('.formation-editor-dialog__svg').boundingBox();
  expect(svgBox).not.toBeNull();
  if (!svgBox) {
    return;
  }

  const toClientPoint = (svgX: number, svgY: number) => ({
    x: svgBox.x + ((svgX - VIEW_BOX.minX) / VIEW_BOX.width) * svgBox.width,
    y: svgBox.y + ((svgY - VIEW_BOX.minY) / VIEW_BOX.height) * svgBox.height,
  });

  const memberBox = await page.locator('[data-testid^="member-"]').boundingBox();
  expect(memberBox).not.toBeNull();
  if (!memberBox) {
    return;
  }

  const yInput = page.getByLabel('前後');

  // 手前端付近（前後 = 1.8。ドメイン値 y から SVG 座標への変換は
  // hooks/svgCoordinates.ts の toSvgPoint と同じ式: svgY = STAGE_DEPTH - toMeters(y)）
  const frontPoint = toClientPoint(0, 5.82);
  await page.mouse.move(memberBox.x + memberBox.width / 2, memberBox.y + memberBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(frontPoint.x, frontPoint.y);
  await page.mouse.up();

  const frontValue = Number(await yInput.inputValue());
  expect(Math.abs(frontValue - 1.8)).toBeLessThanOrEqual(0.05);

  // 奥端付近（前後 = -2.8）
  const backPoint = toClientPoint(0, 1.68);
  await page.mouse.move(memberBox.x + memberBox.width / 2, frontPoint.y);
  await page.mouse.down();
  await page.mouse.move(backPoint.x, backPoint.y);
  await page.mouse.up();

  const backValue = Number(await yInput.inputValue());
  expect(Math.abs(backValue - -2.8)).toBeLessThanOrEqual(0.05);
}

test.describe('2Dエディターのレイアウト（PC表示）', () => {
  test('サムネイルの俯瞰図の上下に空白が生じない（表示縦横比が viewBox と一致する）', async ({
    page,
  }) => {
    await page.goto('/');

    const box = await page.locator('.formation-thumbnail__svg').boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width / box.height).toBeCloseTo(VIEW_BOX.width / VIEW_BOX.height, 1);
    }
  });

  test('編集ポップアップの俯瞰図の上下に空白が生じない（表示縦横比が viewBox と一致する）', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();

    const box = await page.locator('.formation-editor-dialog__svg').boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width / box.height).toBeCloseTo(VIEW_BOX.width / VIEW_BOX.height, 1);
    }
  });

  test('編集ポップアップの俯瞰図がCardで囲まれ、操作欄のCardと同じ間隔で並ぶ', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();

    const cards = page.locator('[aria-label="2D編集ポップアップ"] .MuiCard-root');
    await expect(cards).toHaveCount(3);

    const svgCardBox = await cards.nth(0).boundingBox();
    const controlsCardBox = await cards.nth(1).boundingBox();
    const inputsCardBox = await cards.nth(2).boundingBox();
    expect(svgCardBox).not.toBeNull();
    expect(controlsCardBox).not.toBeNull();
    expect(inputsCardBox).not.toBeNull();
    if (svgCardBox && controlsCardBox && inputsCardBox) {
      const gapAboveControls = controlsCardBox.y - (svgCardBox.y + svgCardBox.height);
      const gapAboveInputs = inputsCardBox.y - (controlsCardBox.y + controlsCardBox.height);
      expect(gapAboveControls).toBeCloseTo(gapAboveInputs, 0);
    }
  });

  test('俯瞰図上でメンバーをドラッグすると、手前端・奥端付近でもポインター位置に追従する', async ({
    page,
  }) => {
    await expectDragFollowsPointerNearEdges(page);
  });
});

test.describe('2Dエディターのレイアウト（モバイル縦表示 390×844）', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_PORTRAIT_VIEWPORT);
  });

  test('編集ポップアップが全画面表示になり、俯瞰図が画面の横幅いっぱいに表示される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();

    const paperBox = await page.locator('[aria-label="2D編集ポップアップ"]').boundingBox();
    expect(paperBox).not.toBeNull();
    if (paperBox) {
      expect(paperBox.width).toBeCloseTo(MOBILE_PORTRAIT_VIEWPORT.width, 0);
    }

    const svgBox = await page.locator('.formation-editor-dialog__svg').boundingBox();
    expect(svgBox).not.toBeNull();
    if (svgBox) {
      expect(svgBox.width).toBeGreaterThanOrEqual(MOBILE_PORTRAIT_VIEWPORT.width * 0.9);
      expect(svgBox.width / svgBox.height).toBeCloseTo(VIEW_BOX.width / VIEW_BOX.height, 1);
    }
  });

  test('俯瞰図上でメンバーをドラッグすると、手前端・奥端付近でもポインター位置に追従する', async ({
    page,
  }) => {
    await expectDragFollowsPointerNearEdges(page);
  });

  test('内容を最下部までスクロールしても、キャンセル・確定ボタンが画面内に表示される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();

    await page
      .locator('[aria-label="2D編集ポップアップ"] .MuiDialogContent-root')
      .evaluate((element) => element.scrollTo(0, element.scrollHeight));

    await expect(page.getByRole('button', { name: '確定' })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeInViewport();
  });
});

test.describe('2Dエディターのレイアウト（モバイル横表示 844×390）', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_LANDSCAPE_VIEWPORT);
  });

  test('左に俯瞰図、右に操作欄・入力欄が並び、俯瞰図全体が画面内に収まる', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();

    const svgBox = await page.locator('.formation-editor-dialog__svg').boundingBox();
    const cards = page.locator('[aria-label="2D編集ポップアップ"] .MuiCard-root');
    const controlsCardBox = await cards.nth(1).boundingBox();
    expect(svgBox).not.toBeNull();
    expect(controlsCardBox).not.toBeNull();
    if (svgBox && controlsCardBox) {
      expect(svgBox.x + svgBox.width).toBeLessThanOrEqual(controlsCardBox.x);
      expect(svgBox.y).toBeGreaterThanOrEqual(0);
      expect(svgBox.y + svgBox.height).toBeLessThanOrEqual(MOBILE_LANDSCAPE_VIEWPORT.height);
    }

    await expect(page.getByRole('button', { name: '確定' })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeInViewport();
  });

  test('入力欄の「左右」と「前後」が縦に並ぶ（同じ行に並ばない）', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();

    const xBox = await page.getByLabel('左右').boundingBox();
    const yBox = await page.getByLabel('前後').boundingBox();
    expect(xBox).not.toBeNull();
    expect(yBox).not.toBeNull();
    if (xBox && yBox) {
      expect(yBox.y).toBeGreaterThanOrEqual(xBox.y + xBox.height);
    }
  });

  test('俯瞰図上でメンバーをドラッグすると、手前端・奥端付近でもポインター位置に追従する', async ({
    page,
  }) => {
    await expectDragFollowsPointerNearEdges(page);
  });

  test('右カラムの内容が高さを超える場合、右カラムだけが縦スクロールしすべての項目を表示できる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();

    const rightColumn = page
      .locator('[aria-label="2D編集ポップアップ"] .MuiDialogContent-root > div')
      .nth(1);

    const { scrollHeight, clientHeight } = await rightColumn.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    expect(clientHeight).toBeLessThanOrEqual(MOBILE_LANDSCAPE_VIEWPORT.height);
    expect(scrollHeight).toBeGreaterThan(clientHeight);

    await rightColumn.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await expect(page.getByLabel('前後')).toBeInViewport();
  });
});

test.describe('端末の向き変更', () => {
  test('縦表示でメンバーを追加・選択した後に横表示へ変えても、選択状態と下書きが維持される', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_PORTRAIT_VIEWPORT);
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();

    await expect(page.getByLabel('メンバー名')).toHaveValue('メンバー1');

    await page.setViewportSize(MOBILE_LANDSCAPE_VIEWPORT);

    await expect(page.getByLabel('メンバー名')).toHaveValue('メンバー1');
    await expect(page.locator('[data-testid^="member-"]')).toBeVisible();
  });
});
