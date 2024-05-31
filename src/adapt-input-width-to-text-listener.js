/**
 * Sets the width of an input element to match the width of the content inside
 */
export function adaptInputWidthToTextListener() {
  // 'this' is the input element itself

  // set the font properties on a canvas context to match the input element
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = getComputedStyle(this).font;
  context.font = font;

  // measure the text width and adapt the width of the input
  const textWidth = context.measureText(this.value || this.placeholder).width;
  this.style.width = `${textWidth}px`;
}
