import { createFrameIterator } from './create-frame-iterator';
import { renderAnimatedDom } from './render-dom';
import { baseAnimation } from './base-animation';

export default function PixelAnimator(userAnimation, domNode) {
  const animation = { ...baseAnimation, ...userAnimation };
  if (domNode) return renderAnimatedDom(animation, domNode);
  return createFrameIterator(animation);
}
