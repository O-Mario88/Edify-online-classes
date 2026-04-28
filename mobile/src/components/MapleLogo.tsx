import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface MapleLogoProps {
  /** Rendered width AND height (the artwork is square). */
  size?: number;
  /** Optional style passthrough (e.g. margin overrides). */
  style?: StyleProp<ImageStyle>;
}

const LOGO_SOURCE = require('../../assets/images/maple-logo.png');

/**
 * Maple Online School brand mark. Renders the official artwork shipped
 * in `mobile/assets/images/maple-logo.png` — the wordmark and tagline
 * are baked into the image, so callers don't need to render text
 * alongside it.
 */
export const MapleLogo: React.FC<MapleLogoProps> = ({ size = 96, style }) => (
  <Image
    source={LOGO_SOURCE}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
    accessibilityLabel="Maple Online School"
  />
);
