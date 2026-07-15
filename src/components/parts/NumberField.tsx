import * as React from 'react';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';

type NumberFieldProps = BaseNumberField.Root.Props & {
  label?: React.ReactNode;
  size?: 'small' | 'medium';
  /** 増加ボタンの aria-label（同じ画面に複数並べる場合に区別できるようにする）。 */
  incrementLabel?: string;
  /** 減少ボタンの aria-label（同じ画面に複数並べる場合に区別できるようにする）。 */
  decrementLabel?: string;
};

/**
 * 増減ボタン付きの数値入力欄。MUI は数値入力コンポーネントを提供していないため、
 * Base UI の NumberField（ヘッドレス実装）を MUI の outlined TextField と同じ
 * 見た目に組み合わせた共通部品（MUI 公式ドキュメントの Number Field レシピを
 * 移植したもの。https://mui.com/material-ui/react-number-field/）。
 */
export function NumberField({
  id: idProp,
  label,
  size = 'medium',
  incrementLabel = '増加',
  decrementLabel = '減少',
  ...other
}: NumberFieldProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  return (
    <BaseNumberField.Root
      {...other}
      render={(props, state) => (
        <FormControl size={size} ref={props.ref} disabled={state.disabled} variant="outlined">
          {props.children}
        </FormControl>
      )}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <BaseNumberField.Input
        id={id}
        render={(props, state) => (
          <OutlinedInput
            label={label}
            inputRef={props.ref}
            value={state.inputValue}
            onBlur={props.onBlur}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={props.onKeyDown}
            onFocus={props.onFocus}
            slotProps={{
              input: {
                ...props,
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  props.onKeyDown?.(event);
                  // Base UI は Enter をナビゲーションキーとして扱い値を確定しないため、
                  // blur させて onValueCommitted（reason: input-blur）を発火させる。
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                },
              },
            }}
            endAdornment={
              <InputAdornment
                position="end"
                sx={{
                  flexDirection: 'column',
                  maxHeight: 'unset',
                  alignSelf: 'stretch',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  ml: 0,
                  '& button': {
                    padding: 0,
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    width: size === 'small' ? 18 : 22,
                    borderRadius: 0.5,
                    fontSize: size === 'small' ? '0.5rem' : '0.6rem',
                    lineHeight: 1,
                  },
                }}
              >
                <BaseNumberField.Increment
                  render={<IconButton size={size} aria-label={incrementLabel} />}
                >
                  ▲
                </BaseNumberField.Increment>
                <BaseNumberField.Decrement
                  render={<IconButton size={size} aria-label={decrementLabel} />}
                >
                  ▼
                </BaseNumberField.Decrement>
              </InputAdornment>
            }
            sx={{ pr: 0 }}
          />
        )}
      />
    </BaseNumberField.Root>
  );
}
