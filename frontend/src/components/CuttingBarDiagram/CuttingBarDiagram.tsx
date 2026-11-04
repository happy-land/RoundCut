import { FC } from "react";
import block from "bem-cn";
import "./CuttingBarDiagram.scss";

const cnStyles = block("cutting-bar-diagram");

type Props = {
  /** Общая длина круга, мм */
  barLengthMm: number;
  /** Заготовки в этом круге, мм (по порядку укладки) */
  piecesMm: number[];
  /** Толщина реза (пропил), мм */
  kerfMm: number;
  /** Торцевой рез в начале, мм */
  endCutMm: number;
  /** Хвост (остаток), мм */
  remainderMm: number;
  /** Компактный режим — живое превью в карточке */
  compact?: boolean;
};

const WIDTH = 620;

const fmtM = (mm: number): string => {
  const m = mm / 1000;
  return `${Number(m.toFixed(3))} м`;
};

const CuttingBarDiagram: FC<Props> = ({
  barLengthMm,
  piecesMm,
  kerfMm,
  endCutMm,
  remainderMm,
  compact = false,
}) => {
  if (barLengthMm <= 0 || piecesMm.length === 0) return null;

  const BAR_Y = compact ? 10 : 26;
  const BAR_H = compact ? 8 : 12;
  const TICK = compact ? 6 : 10;
  const VIEW_H = compact ? 42 : 78;

  const scale = WIDTH / barLengthMm;

  // Сегменты: торцевой рез, заготовки (между ними пропилы), хвост
  const segments: { x: number; w: number; lengthMm: number }[] = [];
  const cutXs: number[] = []; // позиции резов (красные метки)

  let cursor = 0;
  if (endCutMm > 0) {
    cursor += endCutMm * scale;
    cutXs.push(cursor);
  }

  piecesMm.forEach((len, i) => {
    if (i > 0) {
      cursor += kerfMm * scale;
      cutXs.push(cursor);
    }
    segments.push({ x: cursor, w: len * scale, lengthMm: len });
    cursor += len * scale;
  });

  // Рез, отделяющий хвост
  if (remainderMm > 0 && cursor < WIDTH - 0.5) {
    cutXs.push(cursor);
  }

  const remainderW = Math.max(0, remainderMm * scale);
  const usedMm = barLengthMm - remainderMm;

  return (
    <figure className={cnStyles({ compact })}>
      <svg
        viewBox={`0 0 ${WIDTH} ${VIEW_H}`}
        className={cnStyles("svg")}
        role="img"
        aria-label="Схема реза круга"
      >
        <defs>
          <pattern
            id="cbd-hatch"
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="6" height="6" fill="#eceff1" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#cfd8dc" strokeWidth="2" />
          </pattern>
        </defs>

        {/* Основа круга */}
        <rect
          x={0}
          y={BAR_Y}
          width={WIDTH}
          height={BAR_H}
          fill="#fff"
          stroke="#111"
          strokeWidth={2}
        />

        {/* Торцевой рез */}
        {endCutMm > 0 && (
          <rect
            x={0}
            y={BAR_Y}
            width={Math.max(2, endCutMm * scale)}
            height={BAR_H}
            fill="#ffcdd2"
          />
        )}

        {/* Заготовки */}
        {segments.map((s, i) => (
          <g key={i}>
            <rect
              x={s.x}
              y={BAR_Y}
              width={Math.max(1, s.w)}
              height={BAR_H}
              fill="#e3f2fd"
            />
            {s.w > 34 && (
              <text
                x={s.x + s.w / 2}
                y={BAR_Y + BAR_H + 14}
                textAnchor="middle"
                className={cnStyles("piece-label")}
              >
                {s.lengthMm}
              </text>
            )}
          </g>
        ))}

        {/* Хвост */}
        {remainderW > 0 && (
          <rect
            x={remainderMm > 0 ? WIDTH - remainderW : WIDTH}
            y={BAR_Y}
            width={remainderW}
            height={BAR_H}
            fill="url(#cbd-hatch)"
          />
        )}

        {/* Красные метки резов */}
        {cutXs.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={BAR_Y - TICK}
            x2={x}
            y2={BAR_Y + BAR_H + TICK}
            stroke="#d32f2f"
            strokeWidth={3}
          />
        ))}

        {/* Подписи А и В по краям — только в полном режиме */}
        {!compact && (
          <>
            <text x={0} y={BAR_Y - 8} className={cnStyles("edge-label")}>
              А
            </text>
            <text
              x={WIDTH}
              y={BAR_Y - 8}
              textAnchor="end"
              className={cnStyles("edge-label")}
            >
              В
            </text>
          </>
        )}
      </svg>

      {!compact && (
        <figcaption className={cnStyles("dims")}>
          <div>
            Заготовки: {piecesMm.map((p) => `${p} мм`).join(" + ")}
            {endCutMm > 0 && ` · торцевой рез ${endCutMm} мм`}
          </div>
          <div>
            длина хвоста В = {fmtM(remainderMm)} = {remainderMm} мм
          </div>
          <div>
            Общая длина = {fmtM(barLengthMm)} = {barLengthMm} мм
            {usedMm > 0 && ` · использовано ${usedMm} мм`}
          </div>
        </figcaption>
      )}
    </figure>
  );
};

export default CuttingBarDiagram;
