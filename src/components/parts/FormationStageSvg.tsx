import { useRef } from 'react';
import { useMemberDrag } from '../../hooks/useMemberDrag';
import {
  AXIS_LABEL_MARGIN,
  STAGE_RECT,
  STAGE_VIEW_BOX,
  toSvgPoint,
} from '../../hooks/svgCoordinates';
import { toMeters } from '../../domain/axisScale';
import { gridLineValues } from '../../domain/gridLines';
import {
  STAGE_DEPTH,
  STAGE_HALF_WIDTH,
  X_AXIS_SCALE,
  Y_AXIS_SCALE,
} from '../../domain/stageConstants';
import type { Formation } from '../../domain/types';
import './FormationStageSvg.css';

type FormationStageSvgProps = {
  formation: Formation;
  selectedMemberId?: string | null;
  /** true の場合、メンバーの選択・ドラッグ操作を受け付ける（1.6 メンバーの選択、1.5 立ち位置変更）。 */
  interactive?: boolean;
  onSelectMember?: (id: string) => void;
  onMoveMember?: (id: string, x: number, y: number) => void;
  className?: string;
};

const MEMBER_RADIUS = 0.3;
const MEMBER_FOCUS_RADIUS = MEMBER_RADIUS + 0.12;
const LABEL_OFFSET = AXIS_LABEL_MARGIN / 2;

/**
 * ステージの俯瞰図を SVG で描画する（2.1: サムネイルとポップアップで共用）。
 * viewBox はグリッド番号表示用の余白を含み、ステージ本体（STAGE_RECT）はその内側に描画する。
 */
export function FormationStageSvg({
  formation,
  selectedMemberId = null,
  interactive = false,
  onSelectMember,
  onMoveMember,
  className,
}: FormationStageSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { startDrag } = useMemberDrag(svgRef, (id, x, y) => onMoveMember?.(id, x, y));

  const verticalLineValues = gridLineValues(X_AXIS_SCALE, -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH);
  const horizontalLineValues = gridLineValues(Y_AXIS_SCALE, 0, STAGE_DEPTH);
  const stageRight = STAGE_RECT.minX + STAGE_RECT.width;
  const stageBottom = STAGE_RECT.minY + STAGE_RECT.height;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${STAGE_VIEW_BOX.minX} ${STAGE_VIEW_BOX.minY} ${STAGE_VIEW_BOX.width} ${STAGE_VIEW_BOX.height}`}
      role="img"
      aria-label="ステージの俯瞰図"
    >
      <rect
        className="stage-border"
        x={STAGE_RECT.minX}
        y={STAGE_RECT.minY}
        width={STAGE_RECT.width}
        height={STAGE_RECT.height}
      />
      {verticalLineValues.map((value) => {
        const x = toMeters(value, X_AXIS_SCALE);
        return (
          <line
            key={`v-${value}`}
            className={value === 0 ? 'grid-line grid-line--center' : 'grid-line'}
            x1={x}
            y1={STAGE_RECT.minY}
            x2={x}
            y2={stageBottom}
          />
        );
      })}
      {horizontalLineValues.map((value) => {
        const y = STAGE_DEPTH - toMeters(value, Y_AXIS_SCALE);
        return (
          <line
            key={`h-${value}`}
            className={value === 0 ? 'grid-line grid-line--center' : 'grid-line'}
            x1={STAGE_RECT.minX}
            y1={y}
            x2={stageRight}
            y2={y}
          />
        );
      })}
      {verticalLineValues.map((value) => (
        <text
          key={`vl-${value}`}
          className="grid-label"
          x={toMeters(value, X_AXIS_SCALE)}
          y={stageBottom + LABEL_OFFSET}
        >
          {value}
        </text>
      ))}
      {horizontalLineValues.map((value) => {
        const y = STAGE_DEPTH - toMeters(value, Y_AXIS_SCALE);
        return (
          <g key={`hl-${value}`}>
            <text className="grid-label" x={STAGE_RECT.minX - LABEL_OFFSET} y={y}>
              {value}
            </text>
            <text className="grid-label" x={stageRight + LABEL_OFFSET} y={y}>
              {value}
            </text>
          </g>
        );
      })}
      {formation.members.map((member) => {
        const point = toSvgPoint(member.x, member.y);
        const selected = member.id === selectedMemberId;
        return (
          <g key={member.id}>
            <circle
              className={
                selected ? 'member-focus-ring member-focus-ring--visible' : 'member-focus-ring'
              }
              cx={point.x}
              cy={point.y}
              r={MEMBER_FOCUS_RADIUS}
            />
            <circle
              data-testid={`member-${member.id}`}
              className={selected ? 'member member--selected' : 'member'}
              cx={point.x}
              cy={point.y}
              r={MEMBER_RADIUS}
              style={{ fill: member.color }}
              onPointerDown={
                interactive
                  ? () => {
                      onSelectMember?.(member.id);
                      startDrag(member.id);
                    }
                  : undefined
              }
            />
          </g>
        );
      })}
    </svg>
  );
}
