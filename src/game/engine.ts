export type ShapeId = 'circle' | 'square' | 'star' | 'triangle';
export type GamePhase =
  | 'HOME'
  | 'COUNTDOWN'
  | 'SHOWING_SEQUENCE'
  | 'PLAYER_INPUT'
  | 'ROUND_SUCCESS'
  | 'GAME_OVER';

export interface ShapeDefinition {
  id: ShapeId;
  label: string;
  color: string;
}

export interface Difficulty {
  sequenceLength: number;
  displayDurationMs: number;
  inputTimeMs: number;
  maxSequenceLength: number;
  minDisplayDurationMs: number;
}

export interface PlayerSelection {
  id: string;
  shape: ShapeId;
  isCorrect: boolean;
}

export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  { id: 'circle', label: 'Circle', color: '#EF1C27' },
  { id: 'square', label: 'Square', color: '#079FE0' },
  { id: 'star', label: 'Star', color: '#FFE500' },
  { id: 'triangle', label: 'Triangle', color: '#20AE4B' },
];

export const SHAPE_IDS = SHAPE_DEFINITIONS.map((shape) => shape.id);
export const SHAPE_INDEX: Record<ShapeId, ShapeDefinition> = Object.fromEntries(
  SHAPE_DEFINITIONS.map((shape) => [shape.id, shape]),
) as Record<ShapeId, ShapeDefinition>;

export const INITIAL_DIFFICULTY: Difficulty = {
  sequenceLength: 3,
  displayDurationMs: 2000,
  inputTimeMs: 10000,
  maxSequenceLength: 10,
  minDisplayDurationMs: 600,
};

export function nextDifficulty(current: Difficulty): Difficulty {
  const nextSequenceLength = Math.min(
    current.sequenceLength + 1,
    current.maxSequenceLength,
  );
  const nextDisplayDuration = Math.max(
    current.minDisplayDurationMs,
    current.displayDurationMs - 200,
  );

  return {
    ...current,
    sequenceLength: nextSequenceLength,
    displayDurationMs: nextDisplayDuration,
  };
}

export function generateSequence(
  length: number,
  randomFn: () => number = Math.random,
): ShapeId[] {
  const sequence: ShapeId[] = [];

  for (let index = 0; index < length; index += 1) {
    const previousShape = sequence[index - 1];
    const candidates = SHAPE_IDS.filter((shapeId) => {
      if (previousShape == null) {
        return true;
      }

      return shapeId !== previousShape && randomFn() > 0.35;
    });

    const nextShape =
      candidates.length > 0
        ? candidates[Math.floor(randomFn() * candidates.length)]
        : SHAPE_IDS.find((shapeId) => shapeId !== previousShape) ?? SHAPE_IDS[0];

    sequence.push(nextShape);
  }

  return sequence;
}

export function isSelectionCorrect(
  sequence: ShapeId[],
  index: number,
  selection: ShapeId,
): boolean {
  return sequence[index] === selection;
}

export function calculateBonus(remainingMilliseconds: number): number {
  return Math.floor(remainingMilliseconds / 100);
}

export function getDisplaySequence(
  sequence: ShapeId[],
  visibleIndex: number | null,
): ShapeId[] {
  if (visibleIndex == null) {
    return [];
  }

  return sequence.slice(0, visibleIndex + 1);
}
