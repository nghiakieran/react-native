import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ReactLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function ReactLogo({ 
  width = 112, 
  height = 102, 
  color = '#61DAFB' 
}: ReactLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 112 102" fill="none">
      <Circle cx="56" cy="51.165" r="10.667" fill={color} />
      <Path
        d="M56 75.165c29.455 0 53.333-10.745 53.333-24s-23.878-24-53.333-24-53.334 10.745-53.334 24 23.879 24 53.334 24Z"
        stroke={color}
        strokeWidth="5.333"
      />
      <Path
        d="M35.215 63.165c14.728 25.509 35.972 40.815 47.451 34.188 11.48-6.628 8.846-32.68-5.882-58.188-14.727-25.51-35.972-40.816-47.45-34.188-11.48 6.627-8.846 32.679 5.881 58.188Z"
        stroke={color}
        strokeWidth="5.333"
      />
      <Path
        d="M35.215 39.165c-14.727 25.509-17.36 51.56-5.882 58.188 11.48 6.627 32.724-8.68 47.451-34.188 14.728-25.51 17.362-51.56 5.883-58.188-11.48-6.628-32.724 8.679-47.452 34.188Z"
        stroke={color}
        strokeWidth="5.333"
      />
    </Svg>
  );
}
