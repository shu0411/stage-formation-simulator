import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test.describe('JSON エクスポート・インポート', () => {
  test('エクスポート操作をすると、現在のフォーメーションを含むJSONファイルがダウンロードされる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '閉じる' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'JSONエクスポート' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('formation.json');
    const path = await download.path();
    const content = JSON.parse(readFileSync(path!, 'utf-8'));
    expect(content.version).toBe(1);
    expect(content.members).toHaveLength(1);
    expect(content.members[0].name).toBe('メンバー1');
  });

  test('エクスポートしたJSONをインポートすると、同じフォーメーションが2Dエディター・3Dビューに反映される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '閉じる' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'JSONエクスポート' }).click();
    const download = await downloadPromise;
    const exportedPath = await download.path();
    const exportedContent = readFileSync(exportedPath!, 'utf-8');

    await page.reload();
    await expect(page.locator('.person-model__label')).toHaveCount(0);

    await page.getByLabel('JSONインポート').setInputFiles({
      name: 'formation.json',
      mimeType: 'application/json',
      buffer: Buffer.from(exportedContent),
    });

    await expect(page.locator('.person-model__label')).toHaveCount(2);
  });

  test('不正な形式のファイルを選択すると、エラーメッセージが表示され現在のフォーメーションは変更されない', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '閉じる' }).click();

    const invalidFilePath = join(tmpdir(), `invalid-formation-${Date.now()}.json`);
    writeFileSync(invalidFilePath, 'これはJSONではありません');

    await page.getByLabel('JSONインポート').setInputFiles(invalidFilePath);

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.locator('.person-model__label')).toHaveCount(1);
  });
});
