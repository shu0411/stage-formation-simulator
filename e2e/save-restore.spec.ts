import { expect, test } from '@playwright/test';

test.describe('保存・復元', () => {
  test('保存データがない状態でアプリを開くと、メンバー0人の空のステージが表示される', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('.person-model__label')).toHaveCount(0);
  });

  test('フォーメーションを編集して保存ボタンを押した後にページを再読み込みすると、保存した状態が復元される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '閉じる' }).click();

    await page.getByRole('button', { name: '保存' }).click();
    await page.reload();

    await expect(page.locator('.person-model__label')).toHaveCount(1);
    await expect(page.locator('.person-model__label')).toHaveText('メンバー1');
  });

  test('未保存の変更がある状態でページを再読み込みしようとすると、警告が表示される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '閉じる' }).click();

    // 警告(beforeunload)がダイアログをキャンセルすると reload() 自体のナビゲーションは
    // 完了しないため、reload() の完了は待たずダイアログイベントの発生のみを検証する
    const dialogPromise = page.waitForEvent('dialog', { timeout: 5000 });
    page.reload({ timeout: 5000 }).catch(() => {});

    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('beforeunload');
    await dialog.dismiss();
  });

  test('未保存の変更がない状態では、警告なしにページを再読み込みできる', async ({ page }) => {
    await page.goto('/');

    let dialogAppeared = false;
    page.once('dialog', () => {
      dialogAppeared = true;
    });

    await page.reload();

    expect(dialogAppeared).toBe(false);
  });
});
