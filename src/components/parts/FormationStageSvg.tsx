import { useRef } from 'react';
import { useMemberDrag } from '../../hooks/useMemberDrag';
import { toSvgPoint } from '../../hooks/svgCoordinates';
import { GRID_INTERVAL, STAGE_HALF_DEPTH, STAGE_HALF_WIDTH } from '../../domain/stageConstants';
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

const MEMBER_RADIUS = 0.35;

function range(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let value = from; value <= to + 1e-9; value += step) {
    values.push(Math.round(value * 1000) / 1000);
  }
  return values;
}

/**
 * ステージの俯瞰図を SVG で描画する（2.1: サムネイルとポップアップで共用）。
 * viewBox はドメインの座標系（メートル、中央原点）と一致させている。
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

  const verticalLines = range(-STAGE_HALF_WIDTH, STAGE_HALF_WIDTH, GRID_INTERVAL);
  const horizontalLines = range(-STAGE_HALF_DEPTH, STAGE_HALF_DEPTH, GRID_INTERVAL);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${-STAGE_HALF_WIDTH} ${-STAGE_HALF_DEPTH} ${STAGE_HALF_WIDTH * 2} ${STAGE_HALF_DEPTH * 2}`}
      role="img"
      aria-label="ステージの俯瞰図"
    >
      <rect
        className="stage-border"
        x={-STAGE_HALF_WIDTH}
        y={-STAGE_HALF_DEPTH}
        width={STAGE_HALF_WIDTH * 2}
        height={STAGE_HALF_DEPTH * 2}
      />
      {verticalLines.map((x) => (
        <line
          key={`v-${x}`}
          className={x === 0 ? 'grid-line grid-line--center' : 'grid-line'}
          x1={x}
          y1={-STAGE_HALF_DEPTH}
          x2={x}
          y2={STAGE_HALF_DEPTH}
        />
      ))}
      {horizontalLines.map((y) => (
        <line
          key={`h-${y}`}
          className={y === 0 ? 'grid-line grid-line--center' : 'grid-line'}
          x1={-STAGE_HALF_WIDTH}
          y1={y}
          x2={STAGE_HALF_WIDTH}
          y2={y}
        />
      ))}
      {formation.members.map((member) => {
        const point = toSvgPoint(member.x, member.y);
        const selected = member.id === selectedMemberId;
        return (
          <circle
            key={member.id}
            data-testid={`member-${member.id}`}
            className={selected ? 'member member--selected' : 'member'}
            cx={point.x}
            cy={point.y}
            r={MEMBER_RADIUS}
            onClick={interactive ? () => onSelectMember?.(member.id) : undefined}
            onPointerDown={interactive ? () => startDrag(member.id) : undefined}
          />
        );
      })}
    </svg>
  );
}
