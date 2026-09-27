import { expect, test } from '@playwright/test';

/** ステージ SVG の viewBox（hooks/svgCoordinates.ts の STAGE_VIEW_BOX と一致させる）。 */
const VIEW_BOX = { minX: -6.6, minY: 0, width: 13.2, height: 7 };

test.describe('2Dエディターのレイアウト', () => {
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
  });
});
