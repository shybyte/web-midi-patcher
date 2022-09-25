import {assert, expect, describe, test} from 'vitest';
import * as fc from 'fast-check';
import {mergeByLength} from "../utils";


describe('mergeByLength', () => {
  interface DummyObject {
    id: number;
    delta: number;
  }

  function getDummyLength(x: DummyObject): number {
    return x.delta;
  }

  function getIds(array: DummyObject[]): number[] {
    return array.map(x => x.id);
  }

  test('2 empty lists', () => {
    assert.deepEqual(
      getIds(mergeByLength([], [], getDummyLength)),
      []
    );
  });

  test('1 empty list', () => {
    assert.deepEqual(
      getIds(mergeByLength([{id: 0, delta: 0}], [], getDummyLength)),
      [0]
    );
    assert.deepEqual(
      getIds(mergeByLength([], [{id: 0, delta: 0}], getDummyLength)),
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
      ], getDummyLength);

    assert.deepEqual(getIds(result),
      [0, 10, 1, 11, 2, 12]
    );
  });

  function getPositions(array: DummyObject[]): Map<DummyObject, number> {
    let pos = 0;
    const result = new Map();
    for (const dummyObject of array) {
      result.set(dummyObject, pos);
      pos += getDummyLength(dummyObject);
    }
    return result;
  }

  test('mergeByLength should work for all inputs', () => fc.assert(
    fc.property(
      fc.array(fc.record<DummyObject>({id: fc.nat(), delta: fc.double({min: 0, max: 1000})})),
      fc.array(fc.record<DummyObject>({id: fc.nat(), delta: fc.double({min: 0, max: 1000})})),
      (arr1, arr2) => {
        const mergedArray = mergeByLength(arr1, arr2, getDummyLength);

        expect(mergedArray).to.include.members(arr1);
        expect(mergedArray).to.include.members(arr2);

        expect(mergedArray.filter(x => arr1.includes(x))).toEqual(arr1);
        expect(mergedArray.filter(x => arr2.includes(x))).toEqual(arr2);

        const positions1 = getPositions(arr1);
        const positions2 = getPositions(arr2);
        const mergedOriginalPositions = new Map([...positions1, ...positions2]);

        for (let idx = 1; idx < mergedArray.length; ++idx)
          if (mergedOriginalPositions.get(mergedArray[idx - 1])! > mergedOriginalPositions.get(mergedArray[idx])!)
            return false;
        return true;
      }
    )
  ));
})

