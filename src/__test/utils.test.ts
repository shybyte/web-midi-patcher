import {assert, describe, expect, test} from 'vitest';
import * as fc from 'fast-check';
import {merge} from "../utils";

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

  function sortNumbers(array: number[]): number[] {
    return [...array].sort((a, b) => a - b);
  }

  test('merge should work for all inputs', () => fc.assert(
    fc.property(
      fc.array(fc.nat()),
      fc.array(fc.nat()),
      (arr1Unsorted, arr2Unsorted) => {
        const arr1 = sortNumbers(arr1Unsorted);
        const arr2 = sortNumbers(arr2Unsorted);

        const mergedArray = merge(arr1, arr2, identity);

        expect(mergedArray.length).toEqual(arr1.length + arr2.length);
        expect(mergedArray).to.include.members(arr1);
        expect(mergedArray).to.include.members(arr2);

        // Is correctly sorted?
        for (let idx = 1; idx < mergedArray.length; ++idx)
          if (mergedArray[idx - 1] > mergedArray[idx])
            return false;

        return true;
      }
    )
  ))
});


