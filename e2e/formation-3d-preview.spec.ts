import { expect, test } from '@playwright/test';

test.describe('3D プレビュー', () => {
  test('メンバーが0人のとき、3Dビューにはステージのみが表示される', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('.app-layout canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('.person-model__label')).toHaveCount(0);
  });

  test('客席中央からの固定視点で表示され、メンバーの人物モデルと名前ラベルが表示される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '閉じる' }).click();

    const label = page.locator('.person-model__label');
    await expect(label).toHaveCount(1);
    await expect(label).toHaveText('メンバー1');

    const canvasBox = await page.locator('.app-layout canvas').boundingBox();
    const labelBox = await label.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    // ステージ中央に配置したメンバーのラベルは、固定視点のビュー内(横方向は中央付近)に表示される
    if (canvasBox && labelBox) {
      const labelCenterX = labelBox.x + labelBox.width / 2;
      expect(labelCenterX).toBeGreaterThan(canvasBox.x);
      expect(labelCenterX).toBeLessThan(canvasBox.x + canvasBox.width);
    }
  });
});
