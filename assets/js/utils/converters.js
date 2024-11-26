/** The functions exported by this module are inverse functions of each other.
 */

export const getCanvasCoords = (canvas, { x, y }) => {
  return {
    x: (x / 100) * canvas.width,
    y: (y / 100) * canvas.height,
  };
};

export const getPercentageCoords = (canvas, { x, y }) => {
  return {
    x: (x / canvas.width) * 100,
    y: (y / canvas.height) * 100,
  };
};
