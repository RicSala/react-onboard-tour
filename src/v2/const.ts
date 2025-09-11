import { CardPositioning, OverlayStyles } from './types';

export const STYLE_DEFAULT: Required<OverlayStyles> = {
  radius: 10,
  padding: 10,
  opacity: 0.2,
  colorRgb: '0, 0, 0',
};

export const CARD_POSITIONING_DEFAULT: Required<CardPositioning> = {
  floating: true,
  side: 'top',
  distancePx: 0,
};
