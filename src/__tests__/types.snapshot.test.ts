import { expect, test } from 'vitest';
import * as Types from '../types';

test('exported types snapshot', () => {
  const exported = Object.keys(Types).sort();
  expect(exported).toMatchSnapshot();
});
