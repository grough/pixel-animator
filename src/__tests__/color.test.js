import { normalizeColor } from '../color';

it('should normalize a color name', () => {
  expect(normalizeColor('red')).toEqual({
    alpha: 1,
    blue: 54,
    green: 65,
    red: 255,
  });
});

it('should normalize a hex code', () => {
  expect(normalizeColor('#FF0000')).toEqual({
    alpha: 1,
    blue: 0,
    green: 0,
    red: 255,
  });
});

it('should normalize a partial RGBA object', () => {
  expect(normalizeColor({ red: 1 })).toEqual({
    alpha: 1,
    blue: 0,
    green: 0,
    red: 255,
  });
});

it('should normalize a complete RGBA object', () => {
  expect(
    normalizeColor({ red: 0.1, green: 0.2, blue: 0.3, alpha: 0.4 }),
  ).toEqual({
    alpha: 0,
    blue: 76,
    green: 51,
    red: 25,
  });
});

it('should normalize a number', () => {
  expect(normalizeColor(0.5)).toEqual({
    alpha: 1,
    blue: 127,
    green: 127,
    red: 127,
  });
});

it('should normalize a null value', () => {
  expect(normalizeColor(null)).toEqual({
    alpha: 0,
    blue: 0,
    green: 0,
    red: 0,
  });
});
