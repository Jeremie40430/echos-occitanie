import React from 'react';
import Svg, { G, Ellipse, Circle } from 'react-native-svg';
import { colors } from '../lib/theme';

const A8  = [0, 45, 90, 135, 180, 225, 270, 315];
const A12 = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

// Une pivoine stylisée en SVG pur — 3 couches de pétales superposées.
// Utilisée en fond sur les écrans d'onboarding.
// baseOpacity permet d'atténuer les fleurs satellites.
function SingleFlower({ cx = 0, cy = 0, scale = 1, baseOpacity = 1 }) {
  return (
    <G transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      {A8.map(deg => (
        <Ellipse key={`o${deg}`} cx={0} cy={0} rx={22} ry={90}
          transform={`rotate(${deg})`}
          fill={colors.plum} fillOpacity={0.055 * baseOpacity} />
      ))}
      {A12.map(deg => (
        <Ellipse key={`m${deg}`} cx={0} cy={0} rx={16} ry={62}
          transform={`rotate(${deg + 15})`}
          fill={colors.plum} fillOpacity={0.07 * baseOpacity} />
      ))}
      {A8.map(deg => (
        <Ellipse key={`i${deg}`} cx={0} cy={0} rx={11} ry={38}
          transform={`rotate(${deg + 22})`}
          fill={colors.plum} fillOpacity={0.09 * baseOpacity} />
      ))}
      <Circle cx={0} cy={0} r={14} fill={colors.plum} fillOpacity={0.12 * baseOpacity} />
      <Circle cx={0} cy={0} r={7}  fill={colors.plum} fillOpacity={0.16 * baseOpacity} />
    </G>
  );
}

// Composition de 4 fleurs : une grande principale + 3 satellites.
export default function FlowerBg({ width = 380, height = 320 }) {
  return (
    <Svg
      width={width} height={height}
      viewBox="0 0 420 320"
      style={{ position: 'absolute', top: 0, right: -40 }}
      pointerEvents="none"
    >
      <SingleFlower cx={300} cy={80} />
      <SingleFlower cx={60}  cy={200} scale={0.65} baseOpacity={0.7} />
      <SingleFlower cx={30}  cy={260} scale={0.45} baseOpacity={0.55} />
      <SingleFlower cx={390} cy={190} scale={0.4}  baseOpacity={0.5} />
    </Svg>
  );
}
