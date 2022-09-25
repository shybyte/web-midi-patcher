import {assert, describe, test} from 'vitest'
import {mergeByLength} from "../utils";

describe('mergeByLength', () => {
  interface DummyObject {
    id: number;
    delta: number;
  }

  function getDummyDelta(x: DummyObject): number {
    return x.delta;
  }

  function getIds(array: DummyObject[]): number[] {
    return array.map(x => x.id);
  }

  test('2 empty lists', () => {
    assert.deepEqual(
      getIds(mergeByLength([], [], getDummyDelta)),
      []
    );
  });

  test('1 empty list', () => {
    assert.deepEqual(
      getIds(mergeByLength([{id: 0, delta: 0}], [], getDummyDelta)),
      [0]
    );
    assert.deepEqual(
      getIds(mergeByLength([], [{id: 0, delta: 0}], getDummyDelta)),
      [0]
    );
  });


  test('2 lists', () => {
    const result = mergeByLength(
      [
        {id: 0, delta: 1},
        {id: 1, delta: 1},
        {id: 2, delta: 1},
      ],
      [
        {id: 10, delta: 1},
        {id: 11, delta: 1},
        {id: 12, delta: 1},
      ], getDummyDelta);

    assert.deepEqual(getIds(result),
      [0, 10, 1, 11, 2, 12]
    );
  });
})

