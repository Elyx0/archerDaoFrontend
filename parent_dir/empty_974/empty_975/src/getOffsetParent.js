import utils from './utils';

/**
 * å¾—åˆ°ä¼šå¯¼è‡´å…ƒç´ æ˜¾ç¤ºä¸�å…¨çš„ç¥–å…ˆå…ƒç´ 
 */
const { getParent } = utils;

function getOffsetParent(element) {
  if (utils.isWindow(element) || element.nodeType === 9) {
    return null;
  }
  // ie è¿™ä¸ªä¹Ÿä¸�æ˜¯å®Œå…¨å�¯è¡Œ
  /*
   <div style="width: 50px;height: 100px;overflow: hidden">
   <div style="width: 50px;height: 100px;position: relative;" id="d6">
   å…ƒç´  6 é«˜ 100px å®½ 50px<br/>
   </div>
   </div>
   */
  // element.offsetParent does the right thing in ie7 and below. Return parent with layout!
  //  In other browsers it only includes elements with position absolute, relative or
  // fixed, not elements with overflow set to auto or scroll.
  //        if (UA.ie && ieMode < 8) {
  //            return element.offsetParent;
  //        }
  // ç»Ÿä¸€çš„ offsetParent æ–¹æ³•
  const doc = utils.getDocument(element);
  const body = doc.body;
  let parent;
  let positionStyle = utils.css(element, 'position');
  const skipStatic = positionStyle === 'fixed' || positionStyle === 'absolute';

  if (!skipStatic) {
    return element.nodeName.toLowerCase() === 'html'
      ? null
      : getParent(element);
  }

  for (
    parent = getParent(element);
    parent && parent !== body && parent.nodeType !== 9;
    parent = getParent(parent)
  ) {
    positionStyle = utils.css(parent, 'position');
    if (positionStyle !== 'static') {
      return parent;
    }
  }
  return null;
}

export default getOffsetParent;
