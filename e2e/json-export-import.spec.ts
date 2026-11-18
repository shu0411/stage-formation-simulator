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
    await page.getByRole('button', { name: '確定' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'エクスポート' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('formation.json');
    const path = await download.path();
    const content = JSON.parse(readFileSync(path!, 'utf-8'));
    expect(content.version).toBe(2);
    expect(content.members).toHaveLength(1);
    expect(content.members[0].name).toBe('メンバー1');
    expect(content.formations).toHaveLength(1);
  });

  test('エクスポートしたJSONをインポートすると、同じフォーメーションが2Dエディター・3Dビューに反映される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '確定' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'エクスポート' }).click();
    const download = await downloadPromise;
    const exportedPath = await download.path();
    const exportedContent = readFileSync(exportedPath!, 'utf-8');

    await page.reload();
    await expect(page.locator('.person-model__label')).toHaveCount(0);

    await page.getByLabel('インポート').setInputFiles({
      name: 'formation.json',
      mimeType: 'application/json',
      buffer: Buffer.from(exportedContent),
    });

    await expect(page.locator('.person-model__label')).toHaveCount(2);
  });

  test('不正な形式のファイルを選択すると、エラーダイアログが表示され現在のフォーメーションは変更されない', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '確定' }).click();

    const invalidFilePath = join(tmpdir(), `invalid-formation-${Date.now()}.json`);
    writeFileSync(invalidFilePath, 'これはJSONではありません');

    const dialogPromise = page.waitForEvent('dialog');
    await page.getByLabel('インポート').setInputFiles(invalidFilePath);
    const dialog = await dialogPromise;

    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe(
      '不正なファイルです。フォーメーションのJSONファイルを選択してください。',
    );
    await dialog.accept();

    await expect(page.locator('.person-model__label')).toHaveCount(1);
  });

  test('version 1のJSONファイルを選択すると、エラーダイアログが表示され現在のフォーメーションは変更されない', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('2D編集ポップアップを開く').click();
    await page.getByRole('button', { name: 'メンバーを追加' }).click();
    await page.getByRole('button', { name: '確定' }).click();

    const legacyJson = JSON.stringify({
      version: 1,
      members: [{ id: 'legacy-1', name: '旧メンバー', x: 0, y: 0, color: '#ff0000', height: 170 }],
    });
    const legacyFilePath = join(tmpdir(), `legacy-formation-${Date.now()}.json`);
    writeFileSync(legacyFilePath, legacyJson);

    const dialogPromise = page.waitForEvent('dialog');
    await page.getByLabel('インポート').setInputFiles(legacyFilePath);
    const dialog = await dialogPromise;

    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe(
      '不正なファイルです。フォーメーションのJSONファイルを選択してください。',
    );
    await dialog.accept();

    await expect(page.locator('.person-model__label')).toHaveCount(1);
  });

  test('colorまたはheightが欠けたメンバーを含むJSONファイルを選択すると、エラーダイアログが表示される', async ({
    page,
  }) => {
    await page.goto('/');

    const missingFieldsJson = JSON.stringify({
      version: 2,
      members: [{ id: 'm-1', name: 'メンバー1' }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'm-1': { x: 0, y: 0 } } }],
    });
    const missingFieldsFilePath = join(tmpdir(), `missing-fields-formation-${Date.now()}.json`);
    writeFileSync(missingFieldsFilePath, missingFieldsJson);

    const dialogPromise = page.waitForEvent('dialog');
    await page.getByLabel('インポート').setInputFiles(missingFieldsFilePath);
    const dialog = await dialogPromise;

    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe(
      '不正なファイルです。フォーメーションのJSONファイルを選択してください。',
    );
    await dialog.accept();

    await expect(page.locator('.person-model__label')).toHaveCount(0);
  });
});
