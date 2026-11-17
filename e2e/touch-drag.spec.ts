import { expect, test, type Page } from '@playwright/test';
import { STAGE_VIEW_BOX as VIEW_BOX, toSvgPoint } from '../src/hooks/svgCoordinates';

/** ドメインの立ち位置（バミリ番号）から、俯瞰図のバウンディングボックス内のクライアント座標を求める。 */
function clientPointForDomainPosition(
  svgBox: { x: number; y: number; width: number; height: number },
  domainX: number,
  domainY: number,
) {
  const { x: svgX, y: svgY } = toSvgPoint(domainX, domainY);
  return {
    x: svgBox.x + ((svgX - VIEW_BOX.minX) / VIEW_BOX.width) * svgBox.width,
    y: svgBox.y + ((svgY - VIEW_BOX.minY) / VIEW_BOX.height) * svgBox.height,
  };
}

type DispatchTarget = { selector: string } | 'window';

/**
 * ページ内 JS から `pointerType: 'touch'` を指定した `PointerEvent` を直接 dispatch する
 * （本文中の方式(b)）。CDP の `Input.dispatchTouchEvent` による実タッチ入力のエミュレートを
 * まず検証したところ、この Chromium ではヘッドレス環境固有の問題で SVG 子要素への
 * `touch-action` の指定に関わらずタッチ入力の途中で `pointercancel` が発生し、
 * 安定した検証ができなかった（CDP 自体の既知の制約で、Chromium の `touch-action` の
 * ヒットテストが SVG の子要素ではなく最上位の `<svg>` 単位で行われることに起因すると見られる）。
 * そのため、実装の内部ロジック（掴んだ位置のズレの保持、pointercancel での中断・復帰）は
 * 本方式で検証し、「ジェスチャーが実際にスクロールへ奪われない」こと自体の確認は
 * スマホ実機での手動確認（前提条件）に委ねる。
 */
async function dispatchTouchPointer(
  page: Page,
  target: DispatchTarget,
  type: string,
  point: { x: number; y: number },
  pointerId: number,
) {
  await page.evaluate(
    ({ target, type, point, pointerId }) => {
      const element = target === 'window' ? window : document.querySelector(target.selector);
      if (!element) {
        throw new Error(`element not found: ${JSON.stringify(target)}`);
      }
      element.dispatchEvent(
        new PointerEvent(type, {
          pointerId,
          pointerType: 'touch',
          clientX: point.x,
          clientY: point.y,
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    { target, type, point, pointerId },
  );
}

async function openEditorWithMember(page: Page) {
  await page.goto('/');
  await page.getByLabel('2D編集ポップアップを開く').click();
  await page.getByRole('button', { name: 'メンバーを追加' }).click();
}

test.describe('2Dエディターのタッチ操作でのドラッグ（仕様: タッチでのドラッグ）', () => {
  test('メンバーの円には touch-action: none が指定され、俯瞰図の背景には指定されない', async ({
    page,
  }) => {
    await openEditorWithMember(page);

    const memberTouchAction = await page
      .locator('[data-testid^="member-"]')
      .evaluate((element) => getComputedStyle(element).touchAction);
    expect(memberTouchAction).toBe('none');

    const backgroundTouchAction = await page
      .locator('.formation-editor-dialog__svg .stage-border')
      .evaluate((element) => getComputedStyle(element).touchAction);
    expect(backgroundTouchAction).not.toBe('none');
  });

  test('タッチでドラッグすると、ポインターの移動のたびに追従して立ち位置が変わる（pointerType: touch）', async ({
    page,
  }) => {
    await openEditorWithMember(page);

    const svgBox = await page.locator('.formation-editor-dialog__svg').boundingBox();
    const memberSelector = '[data-testid^="member-"]';
    const memberBox = await page.locator(memberSelector).boundingBox();
    expect(svgBox).not.toBeNull();
    expect(memberBox).not.toBeNull();
    if (!svgBox || !memberBox) {
      return;
    }
    const start = { x: memberBox.x + memberBox.width / 2, y: memberBox.y + memberBox.height / 2 };
    // 移動幅の初期値0.25の倍数になる位置まで、複数回に分けてポインターを動かし続ける
    // （前後は手前端(referenceValue=2)を超えない範囲で動かす）
    const mid = clientPointForDomainPosition(svgBox, 0.5, 1);
    const end = clientPointForDomainPosition(svgBox, 1, 1.75);

    await dispatchTouchPointer(page, { selector: memberSelector }, 'pointerdown', start, 1);
    await dispatchTouchPointer(page, 'window', 'pointermove', mid, 1);
    await dispatchTouchPointer(page, 'window', 'pointermove', end, 1);
    await dispatchTouchPointer(page, 'window', 'pointerup', end, 1);

    // ドラッグ中にジェスチャーが途切れていれば、終点まで座標が追従しない
    await expect(page.getByLabel('左右')).toHaveValue('1');
    await expect(page.getByLabel('前後')).toHaveValue('1.75');
  });

  test('ドラッグ中の中断（pointercancel）後も内部状態が残らず、同じメンバーを問題なく再度ドラッグできる（仕様: 中断されてもドラッグ状態が残らない）', async ({
    page,
  }) => {
    await openEditorWithMember(page);

    const svgBox = await page.locator('.formation-editor-dialog__svg').boundingBox();
    const memberSelector = '[data-testid^="member-"]';
    const memberBox = await page.locator(memberSelector).boundingBox();
    expect(svgBox).not.toBeNull();
    expect(memberBox).not.toBeNull();
    if (!svgBox || !memberBox) {
      return;
    }
    const start = { x: memberBox.x + memberBox.width / 2, y: memberBox.y + memberBox.height / 2 };
    const interrupted = clientPointForDomainPosition(svgBox, 0.5, 0);
    const final = clientPointForDomainPosition(svgBox, 1, 0);

    // 1本目の指でドラッグ中に、2本目の指が触れるなどでジェスチャーが中断される
    await dispatchTouchPointer(page, { selector: memberSelector }, 'pointerdown', start, 1);
    await dispatchTouchPointer(page, 'window', 'pointermove', interrupted, 1);
    await dispatchTouchPointer(page, 'window', 'pointercancel', interrupted, 1);

    // 中断された時点までの座標がそのまま保持される（仕様: エラー処理）
    await expect(page.getByLabel('左右')).toHaveValue('0.5');
    // 中断後は、ポインターが動いても座標は変わらない
    await dispatchTouchPointer(page, 'window', 'pointermove', final, 1);
    await expect(page.getByLabel('左右')).toHaveValue('0.5');

    // 中断後も、同じメンバーを問題なく再度ドラッグできる（内部状態が残っていない）。
    // 中断時点の座標(0.5, 0)が現在のメンバーの立ち位置になっているため、
    // その位置の中心をあらためて掴む
    const regrabPoint = clientPointForDomainPosition(svgBox, 0.5, 0);
    await dispatchTouchPointer(page, { selector: memberSelector }, 'pointerdown', regrabPoint, 1);
    await dispatchTouchPointer(page, 'window', 'pointermove', final, 1);
    await dispatchTouchPointer(page, 'window', 'pointerup', final, 1);

    await expect(page.getByLabel('左右')).toHaveValue('1');
    await expect(page.getByLabel('前後')).toHaveValue('0');
  });

  test('円の中心からズレた位置をタッチで掴んでドラッグしても、中心が指先へ飛ばずそのズレを保ったまま追従する（仕様: 掴んだ位置のズレを保つ）', async ({
    page,
  }) => {
    await openEditorWithMember(page);
    // 移動幅を0.1にして、掴んだ位置からの移動量(+0.9)に対応する0.9単位の吸着位置を目標にする
    await page.getByRole('combobox', { name: '移動幅' }).click();
    await page.getByRole('option', { name: '0.1' }).click();
    await expect(page.locator('.MuiPopover-root')).toHaveCount(0);

    const svgBox = await page.locator('.formation-editor-dialog__svg').boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) {
      return;
    }
    const memberSelector = '[data-testid^="member-"]';

    // メンバー（x=0, y=0）の中心からx方向にズレた位置（ドメイン座標 x=0.1）を掴む
    const grabPoint = clientPointForDomainPosition(svgBox, 0.1, 0);
    // 掴んだ位置からx方向にさらに0.9動かす（ドメイン座標 x=1.0）。
    // ズレが保たれれば移動量と同じだけ動いてx=0.9になり、中心が指先に飛ぶ場合はx=1.0になる
    const movePoint = clientPointForDomainPosition(svgBox, 1.0, 0);

    await dispatchTouchPointer(page, { selector: memberSelector }, 'pointerdown', grabPoint, 1);
    await dispatchTouchPointer(page, 'window', 'pointermove', movePoint, 1);
    await dispatchTouchPointer(page, 'window', 'pointerup', movePoint, 1);

    await expect(page.getByLabel('左右')).toHaveValue('0.9');
  });
});
