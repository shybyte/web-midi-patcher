import {assert, describe, test} from 'vitest'
import {merge, mergeByLength} from "../utils";


describe('merge', () => {
  function identity<T>(x: T): T {
    return x;
  }

  test('2 empty lists', () => {
    assert.deepEqual(
      merge([], [], identity),
      []
    );
  });

  test('1 empty list', () => {
    assert.deepEqual(
      merge([], [2, 3], identity),
      [2, 3]
    );
    assert.deepEqual(
      merge([1, 2], [], identity),
      [1, 2]
    );
  });

  test('concat 2 lists', () => {
    assert.deepEqual(
      merge([1, 2], [3, 4], identity),
      [1, 2, 3, 4]
    );
  });

  test('merge long list', () => {
    assert.deepEqual(
      merge([1, 3, 5], [2, 4, 6], identity),
      [1, 2, 3, 4, 5, 6]
    );
  });
});

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

