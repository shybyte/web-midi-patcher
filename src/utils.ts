import * as _ from 'lodash';

export function repeat<T>(array: T[], repetitions: number): T[] {
  return _.range(repetitions).reduce((acc, i) => acc.concat(array), [])
}