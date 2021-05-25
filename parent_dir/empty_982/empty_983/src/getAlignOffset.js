/**
 * è�·å�– node ä¸Šçš„ align å¯¹é½�ç‚¹ ç›¸å¯¹äº�é¡µé�¢çš„å��æ ‡
 */

function getAlignOffset(region, align) {
  const V = align.charAt(0);
  const H = align.charAt(1);
  const w = region.width;
  const h = region.height;

  let x = region.left;
  let y = region.top;

  if (V === 'c') {
    y += h / 2;
  } else if (V === 'b') {
    y += h;
  }

  if (H === 'c') {
    x += w / 2;
  } else if (H === 'r') {
    x += w;
  }

  return {
    left: x,
    top: y,
  };
}

export default getAlignOffset;
