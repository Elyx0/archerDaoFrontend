import utils from './utils';

function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
  const pos = utils.clone(elFuturePos);
  const size = {
    width: elRegion.width,
    height: elRegion.height,
  };

  if (overflow.adjustX && pos.left < visibleRect.left) {
    pos.left = visibleRect.left;
  }

  // Left edge inside and right edge outside viewport, try to resize it.
  if (
    overflow.resizeWidth &&
    pos.left >= visibleRect.left &&
    pos.left + size.width > visibleRect.right
  ) {
    size.width -= pos.left + size.width - visibleRect.right;
  }

  // Right edge outside viewport, try to move it.
  if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
    // ä¿�è¯�å·¦è¾¹ç•Œå’Œå�¯è§†åŒºåŸŸå·¦è¾¹ç•Œå¯¹é½�
    pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
  }

  // Top edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top < visibleRect.top) {
    pos.top = visibleRect.top;
  }

  // Top edge inside and bottom edge outside viewport, try to resize it.
  if (
    overflow.resizeHeight &&
    pos.top >= visibleRect.top &&
    pos.top + size.height > visibleRect.bottom
  ) {
    size.height -= pos.top + size.height - visibleRect.bottom;
  }

  // Bottom edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
    // ä¿�è¯�ä¸Šè¾¹ç•Œå’Œå�¯è§†åŒºåŸŸä¸Šè¾¹ç•Œå¯¹é½�
    pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
  }

  return utils.mix(pos, size);
}

export default adjustForViewport;
