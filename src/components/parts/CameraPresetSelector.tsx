import { useState } from 'react';
import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CAMERA_PRESETS } from '../../domain/cameraPresets';
import type { CameraPresetId } from '../../domain/cameraPresets';

type CameraPresetSelectorProps = {
  value: CameraPresetId;
  onChange: (presetId: CameraPresetId) => void;
};

/**
 * カメラ位置のプリセット切り替えUI（仕様: カメラ位置の切り替え）。幅900px未満
 * （MUIの`md`ブレークポイント未満）では「カメラ」ボタン+メニューに集約する。
 * アプリ状態には依存せず、呼び出し側（`OperationsBar`）が結線する。
 */
export function CameraPresetSelector({ value, onChange }: CameraPresetSelectorProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (isCompact) {
    const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const handleSelect = (presetId: CameraPresetId) => {
      onChange(presetId);
      handleClose();
    };

    return (
      <>
        <Button
          variant="outlined"
          onClick={handleOpen}
          startIcon={<CameraAltIcon aria-hidden="true" />}
        >
          カメラ
        </Button>
        <Menu anchorEl={anchorEl} open={anchorEl !== null} onClose={handleClose}>
          {CAMERA_PRESETS.map((preset) => (
            <MenuItem
              key={preset.id}
              selected={preset.id === value}
              aria-selected={preset.id === value}
              onClick={() => handleSelect(preset.id)}
            >
              {preset.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <VideocamIcon aria-hidden="true" fontSize="small" />
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_event, presetId: CameraPresetId | null) => {
          if (presetId !== null) {
            onChange(presetId);
          }
        }}
      >
        {CAMERA_PRESETS.map((preset) => (
          <ToggleButton key={preset.id} value={preset.id}>
            {preset.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
