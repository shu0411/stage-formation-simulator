import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CameraPresetSelector } from '../CameraPresetSelector';

const theme = createTheme();

function renderSelector(value: 'left' | 'center' | 'right' | 'front' | 'back', onChange = vi.fn()) {
  render(
    <ThemeProvider theme={theme}>
      <CameraPresetSelector value={value} onChange={onChange} />
    </ThemeProvider>,
  );
  return onChange;
}

function mockMatchMedia(isMobile: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('max-width') ? isMobile : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('CameraPresetSelector', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('幅900px以上では、トグルボタン群が表示され選択中のプリセットが押下状態になる（`matchMedia` 未定義のjsdomでは常にこちら）', () => {
    renderSelector('center');

    const centerButton = screen.getByRole('button', { name: '中央' });
    expect(centerButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '左' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('トグル表示で別のプリセットを押すとonChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = renderSelector('center');

    await user.click(screen.getByRole('button', { name: '右' }));

    expect(onChange).toHaveBeenCalledWith('right');
  });

  it('トグル表示で選択中のボタンを押してもonChangeは呼ばれない', async () => {
    const user = userEvent.setup();
    const onChange = renderSelector('center');

    await user.click(screen.getByRole('button', { name: '中央' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('幅900px未満では「カメラ」ボタンに集約され、メニューから選ぶとonChangeが呼ばれメニューが閉じる', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    const onChange = renderSelector('center');

    await user.click(screen.getByRole('button', { name: 'カメラ' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: '前方' }));

    expect(onChange).toHaveBeenCalledWith('front');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('幅900px未満では、選択中のプリセットがメニュー項目で区別される', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    renderSelector('right');

    await user.click(screen.getByRole('button', { name: 'カメラ' }));

    expect(screen.getByRole('menuitem', { name: '右' })).toHaveAttribute('aria-selected', 'true');
  });
});
