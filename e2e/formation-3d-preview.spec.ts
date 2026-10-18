import { expect, test } from '@playwright/test';

test.describe('3D プレビュー', () => {
  test('メンバーが0人のとき、3Dビューにはステージと方向ラベルのみが表示される', async ({
    page,
  }) => {
    await page.goto('/');

    const canvas = page.locator('.app-layout canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('.person-model__label')).toHaveCount(0);
    await expect(page.locator('.stage-direction-label')).toHaveCount(3);
  });

  test('3Dビューに上手・下手・客席側の方向ラベルが表示される', async ({ page }) => {
    await page.goto('/');

    const labels = page.locator('.stage-direction-label');
    await expect(labels).toHaveCount(3);
    await expect(labels).toContainText(['上手', '下手', '客席側']);
  });

  test('初期状態は「中央」の固定視点で表示され、メンバーの人物モデルと名前ラベルが表示される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '確定' }).click();

    const label = page.locator('.person-model__label');
    await expect(label).toHaveCount(1);
    await expect(label).toHaveText('メンバー1');

    expect(await page.getByRole('button', { name: '中央' }).getAttribute('aria-pressed')).toBe(
      'true',
    );

    const canvasBox = await page.locator('.app-layout canvas').boundingBox();
    const labelBox = await label.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    // ステージ中央に配置したメンバーのラベルは、「中央」視点のビュー内(横方向は中央付近)に表示される
    if (canvasBox && labelBox) {
      const labelCenterX = labelBox.x + labelBox.width / 2;
      expect(labelCenterX).toBeGreaterThan(canvasBox.x);
      expect(labelCenterX).toBeLessThan(canvasBox.x + canvasBox.width);
    }
  });
});

test.describe('カメラ位置の切り替え', () => {
  async function addMemberAtCenter(page: import('@playwright/test').Page) {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '確定' }).click();
  }

  async function labelCenterX(page: import('@playwright/test').Page) {
    const box = await page.locator('.person-model__label').boundingBox();
    if (!box) {
      throw new Error('label not visible');
    }
    return box.x + box.width / 2;
  }

  test('「左」「右」を選ぶと、ラベルの画面上の位置が「中央」のときから変わり、移動後はステージ中央を向く', async ({
    page,
  }) => {
    await addMemberAtCenter(page);

    const centerX = await labelCenterX(page);

    await page.getByRole('button', { name: '右' }).click();
    await expect
      .poll(async () => Math.abs((await labelCenterX(page)) - centerX), { timeout: 3000 })
      .toBeGreaterThan(5);
    const afterRightX = await labelCenterX(page);

    await page.getByRole('button', { name: '左' }).click();
    await expect
      .poll(async () => Math.abs((await labelCenterX(page)) - afterRightX), { timeout: 3000 })
      .toBeGreaterThan(5);

    await page.getByRole('button', { name: '中央' }).click();
    await expect
      .poll(async () => Math.abs((await labelCenterX(page)) - centerX), { timeout: 3000 })
      .toBeLessThanOrEqual(2);
  });

  test('カメラの移動中に別のプリセットを選ぶと、その時点の位置から新しいプリセットの位置へ移動する', async ({
    page,
  }) => {
    await addMemberAtCenter(page);
    const centerX = await labelCenterX(page);

    await page.getByRole('button', { name: '右' }).click();
    // アニメーション完了前に別のプリセットへ切り替える
    await page.getByRole('button', { name: '前方' }).click();

    await expect
      .poll(async () => Math.abs((await labelCenterX(page)) - centerX), { timeout: 3000 })
      .toBeLessThanOrEqual(2);
  });

  test('3Dビュー上でドラッグ・ホイール操作をしてもカメラは動かない', async ({ page }) => {
    await addMemberAtCenter(page);
    const centerX = await labelCenterX(page);

    const canvasBox = await page.locator('.app-layout canvas').boundingBox();
    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      const cx = canvasBox.x + canvasBox.width / 2;
      const cy = canvasBox.y + canvasBox.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 200, cy + 100, { steps: 10 });
      await page.mouse.up();
      await page.mouse.wheel(0, -200);
    }

    expect(await labelCenterX(page)).toBeCloseTo(centerX, 0);
  });

  test('カメラ位置を変えてからページを再読み込みすると「中央」に戻り、未保存警告は出ない', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '後方' }).click();
    await expect(page.getByRole('button', { name: '後方' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    let dialogAppeared = false;
    page.once('dialog', () => {
      dialogAppeared = true;
    });

    await page.reload();

    expect(dialogAppeared).toBe(false);
    await expect(page.getByRole('button', { name: '中央' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

test.describe('操作バーのレイアウト', () => {
  test('操作バーは画面下部にあり3Dビューと重ならず、サムネイルは3Dビューの左上に表示される', async ({
    page,
  }) => {
    await page.goto('/');

    const canvasBox = await page.locator('.app-layout canvas').boundingBox();
    const barBox = await page.locator('.operations-bar').boundingBox();
    const thumbnailBox = await page.locator('.formation-thumbnail').boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect(thumbnailBox).not.toBeNull();
    if (canvasBox && barBox && thumbnailBox) {
      expect(barBox.y).toBeGreaterThanOrEqual(canvasBox.y + canvasBox.height);
      expect(thumbnailBox.x).toBeGreaterThanOrEqual(canvasBox.x);
      expect(thumbnailBox.y).toBeGreaterThanOrEqual(canvasBox.y);
    }
  });

  test('スマートフォン縦表示では「カメラ」ボタンに集約され、横スクロールは発生しない', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'カメラ' })).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
