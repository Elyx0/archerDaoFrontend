/**
 * align dom node flexibly
 * @author yiminghe@gmail.com
 */

import utils from '../utils';
import getVisibleRectForElement from '../getVisibleRectForElement';
import adjustForViewport from '../adjustForViewport';
import getRegion from '../getRegion';
import getElFuturePos from '../getElFuturePos';

// http://yiminghe.iteye.com/blog/1124720

function isFailX(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.left < visibleRect.left ||
    elFuturePos.left + elRegion.width > visibleRect.right
  );
}

function isFailY(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.top < visibleRect.top ||
    elFuturePos.top + elRegion.height > visibleRect.bottom
  );
}

function isCompleteFailX(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.left > visibleRect.right ||
    elFuturePos.left + elRegion.width < visibleRect.left
  );
}

function isCompleteFailY(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.top > visibleRect.bottom ||
    elFuturePos.top + elRegion.height < visibleRect.top
  );
}

function flip(points, reg, map) {
  const ret = [];
  utils.each(points, p => {
    ret.push(
      p.replace(reg, m => {
        return map[m];
      }),
    );
  });
  return ret;
}

function flipOffset(offset, index) {
  offset[index] = -offset[index];
  return offset;
}

function convertOffset(str, offsetLen) {
  let n;
  if (/%$/.test(str)) {
    n = (parseInt(str.substring(0, str.length - 1), 10) / 100) * offsetLen;
  } else {
    n = parseInt(str, 10);
  }
  return n || 0;
}

function normalizeOffset(offset, el) {
  offset[0] = convertOffset(offset[0], el.width);
  offset[1] = convertOffset(offset[1], el.height);
}

/**
 * @param el
 * @param tgtRegion å�‚ç…§èŠ‚ç‚¹æ‰€å� çš„åŒºåŸŸ: { left, top, width, height }
 * @param align
 */
function doAlign(el, tgtRegion, align, isTgtRegionVisible) {
  let points = align.points;
  let offset = align.offset || [0, 0];
  let targetOffset = align.targetOffset || [0, 0];
  let overflow = align.overflow;
  const source = align.source || el;
  offset = [].concat(offset);
  targetOffset = [].concat(targetOffset);
  overflow = overflow || {};
  const newOverflowCfg = {};
  let fail = 0;
  const alwaysByViewport = !!(overflow && overflow.alwaysByViewport);
  // å½“å‰�èŠ‚ç‚¹å�¯ä»¥è¢«æ”¾ç½®çš„æ˜¾ç¤ºåŒºåŸŸ
  const visibleRect = getVisibleRectForElement(source, alwaysByViewport);
  // å½“å‰�èŠ‚ç‚¹æ‰€å� çš„åŒºåŸŸ, left/top/width/height
  const elRegion = getRegion(source);
  // å°† offset è½¬æ�¢æˆ�æ•°å€¼ï¼Œæ”¯æŒ�ç™¾åˆ†æ¯”
  normalizeOffset(offset, elRegion);
  normalizeOffset(targetOffset, tgtRegion);
  // å½“å‰�èŠ‚ç‚¹å°†è¦�è¢«æ”¾ç½®çš„ä½�ç½®
  let elFuturePos = getElFuturePos(
    elRegion,
    tgtRegion,
    points,
    offset,
    targetOffset,
  );
  // å½“å‰�èŠ‚ç‚¹å°†è¦�æ‰€å¤„çš„åŒºåŸŸ
  let newElRegion = utils.merge(elRegion, elFuturePos);

  // å¦‚æ�œå�¯è§†åŒºåŸŸä¸�èƒ½å®Œå…¨æ”¾ç½®å½“å‰�èŠ‚ç‚¹æ—¶å…�è®¸è°ƒæ•´
  if (
    visibleRect &&
    (overflow.adjustX || overflow.adjustY) &&
    isTgtRegionVisible
  ) {
    if (overflow.adjustX) {
      // å¦‚æ�œæ¨ªå�‘ä¸�èƒ½æ”¾ä¸‹
      if (isFailX(elFuturePos, elRegion, visibleRect)) {
        // å¯¹é½�ä½�ç½®å��ä¸‹
        const newPoints = flip(points, /[lr]/gi, {
          l: 'r',
          r: 'l',
        });
        // å��ç§»é‡�ä¹Ÿå��ä¸‹
        const newOffset = flipOffset(offset, 0);
        const newTargetOffset = flipOffset(targetOffset, 0);
        const newElFuturePos = getElFuturePos(
          elRegion,
          tgtRegion,
          newPoints,
          newOffset,
          newTargetOffset,
        );

        if (!isCompleteFailX(newElFuturePos, elRegion, visibleRect)) {
          fail = 1;
          points = newPoints;
          offset = newOffset;
          targetOffset = newTargetOffset;
        }
      }
    }

    if (overflow.adjustY) {
      // å¦‚æ�œçºµå�‘ä¸�èƒ½æ”¾ä¸‹
      if (isFailY(elFuturePos, elRegion, visibleRect)) {
        // å¯¹é½�ä½�ç½®å��ä¸‹
        const newPoints = flip(points, /[tb]/gi, {
          t: 'b',
          b: 't',
        });
        // å��ç§»é‡�ä¹Ÿå��ä¸‹
        const newOffset = flipOffset(offset, 1);
        const newTargetOffset = flipOffset(targetOffset, 1);
        const newElFuturePos = getElFuturePos(
          elRegion,
          tgtRegion,
          newPoints,
          newOffset,
          newTargetOffset,
        );

        if (!isCompleteFailY(newElFuturePos, elRegion, visibleRect)) {
          fail = 1;
          points = newPoints;
          offset = newOffset;
          targetOffset = newTargetOffset;
        }
      }
    }

    // å¦‚æ�œå¤±è´¥ï¼Œé‡�æ–°è®¡ç®—å½“å‰�èŠ‚ç‚¹å°†è¦�è¢«æ”¾ç½®çš„ä½�ç½®
    if (fail) {
      elFuturePos = getElFuturePos(
        elRegion,
        tgtRegion,
        points,
        offset,
        targetOffset,
      );
      utils.mix(newElRegion, elFuturePos);
    }
    const isStillFailX = isFailX(elFuturePos, elRegion, visibleRect);
    const isStillFailY = isFailY(elFuturePos, elRegion, visibleRect);
    // æ£€æŸ¥å��ä¸‹å��çš„ä½�ç½®æ˜¯å�¦å�¯ä»¥æ”¾ä¸‹äº†ï¼Œå¦‚æ�œä»�ç„¶æ”¾ä¸�ä¸‹ï¼š
    // 1. å¤�å�Ÿä¿®æ”¹è¿‡çš„å®šä½�å�‚æ•°
    if (isStillFailX || isStillFailY) {
      let newPoints = points;

      // é‡�ç½®å¯¹åº”éƒ¨åˆ†çš„ç¿»è½¬é€»è¾‘
      if (isStillFailX) {
        newPoints = flip(points, /[lr]/gi, {
          l: 'r',
          r: 'l',
        });
      }
      if (isStillFailY) {
        newPoints = flip(points, /[tb]/gi, {
          t: 'b',
          b: 't',
        });
      }

      points = newPoints;

      offset = align.offset || [0, 0];
      targetOffset = align.targetOffset || [0, 0];
    }
    // 2. å�ªæœ‰æŒ‡å®šäº†å�¯ä»¥è°ƒæ•´å½“å‰�æ–¹å�‘æ‰�è°ƒæ•´
    newOverflowCfg.adjustX = overflow.adjustX && isStillFailX;
    newOverflowCfg.adjustY = overflow.adjustY && isStillFailY;

    // ç¡®å®�è¦�è°ƒæ•´ï¼Œç”šè‡³å�¯èƒ½ä¼šè°ƒæ•´é«˜åº¦å®½åº¦
    if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
      newElRegion = adjustForViewport(
        elFuturePos,
        elRegion,
        visibleRect,
        newOverflowCfg,
      );
    }
  }

  // need judge to in case set fixed with in css on height auto element
  if (newElRegion.width !== elRegion.width) {
    utils.css(
      source,
      'width',
      utils.width(source) + newElRegion.width - elRegion.width,
    );
  }

  if (newElRegion.height !== elRegion.height) {
    utils.css(
      source,
      'height',
      utils.height(source) + newElRegion.height - elRegion.height,
    );
  }

  // https://github.com/kissyteam/kissy/issues/190
  // ç›¸å¯¹äº�å±�å¹•ä½�ç½®æ²¡å�˜ï¼Œè€Œ left/top å�˜äº†
  // ä¾‹å¦‚ <div 'relative'><el absolute></div>
  utils.offset(
    source,
    {
      left: newElRegion.left,
      top: newElRegion.top,
    },
    {
      useCssRight: align.useCssRight,
      useCssBottom: align.useCssBottom,
      useCssTransform: align.useCssTransform,
      ignoreShake: align.ignoreShake,
    },
  );

  return {
    points,
    offset,
    targetOffset,
    overflow: newOverflowCfg,
  };
}

export default doAlign;
/**
 *  2012-04-26 yiminghe@gmail.com
 *   - ä¼˜åŒ–æ™ºèƒ½å¯¹é½�ç®—æ³•
 *   - æ…�ç”¨ resizeXX
 *
 *  2011-07-13 yiminghe@gmail.com note:
 *   - å¢�åŠ æ™ºèƒ½å¯¹é½�ï¼Œä»¥å�Šå¤§å°�è°ƒæ•´é€‰é¡¹
 **/
