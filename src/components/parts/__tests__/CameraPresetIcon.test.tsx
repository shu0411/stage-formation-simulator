import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CameraPresetIcon } from '../CameraPresetIcon';
import type { CameraPresetId } from '../../../domain/cameraPresets';

describe('CameraPresetIcon', () => {
  it.each<CameraPresetId>(['left', 'center', 'right', 'front', 'back'])(
    'presetId=%sに対応するアイコンが装飾用（aria-hidden）としてレンダリングされる',
    (presetId) => {
      const { container } = render(<CameraPresetIcon presetId={presetId} />);

      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    },
  );
});
