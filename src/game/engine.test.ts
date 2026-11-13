import { describe, expect, it, vi } from 'vitest';

import {
  INITIAL_DIFFICULTY,
  calculateBonus,
  generateSequence,
  isSelectionCorrect,
  nextDifficulty,
  SHAPE_IDS,
  type ShapeId,
} from './engine';

describe('memory game engine', () => {
  it('generates a sequence with the expected length', () => {
    const sequence = generateSequence(6, () => 0.5);

    expect(sequence).toHaveLength(6);
    sequence.forEach((shapeId) => expect(SHAPE_IDS).toContain(shapeId));
  });

  it('avoids duplicate adjacent shapes when possible', () => {
    const sequence = generateSequence(12, () => 0.2);

    for (let index = 1; index < sequence.length; index += 1) {
      expect(sequence[index]).not.toBe(sequence[index - 1]);
    }
  });

  it('validates correct and incorrect selections', () => {
    const sequence: ShapeId[] = ['circle', 'square', 'triangle'];

    expect(isSelectionCorrect(sequence, 0, 'circle')).toBe(true);
    expect(isSelectionCorrect(sequence, 1, 'circle')).toBe(false);
  });

  it('calculates a score bonus from the remaining milliseconds', () => {
    expect(calculateBonus(1234)).toBe(12);
    expect(calculateBonus(0)).toBe(0);
  });

  it('advances difficulty and respects the cap and minimum duration', () => {
    let difficulty = INITIAL_DIFFICULTY;

    difficulty = nextDifficulty(difficulty);
    expect(difficulty.sequenceLength).toBe(4);
    expect(difficulty.displayDurationMs).toBe(1800);

    difficulty = nextDifficulty({
      ...INITIAL_DIFFICULTY,
      sequenceLength: 10,
      displayDurationMs: 600,
      maxSequenceLength: 10,
      minDisplayDurationMs: 600,
    });
    expect(difficulty.sequenceLength).toBe(10);
    expect(difficulty.displayDurationMs).toBe(600);
  });

  it('allows deterministic random generation in tests', () => {
    const randomValues = vi.fn().mockReturnValue(0.1);
    const sequence = generateSequence(4, randomValues);

    expect(sequence).toHaveLength(4);
    expect(randomValues).toHaveBeenCalled();
  });
});
