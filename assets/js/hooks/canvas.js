import { getPercentageCoords, getCanvasCoords } from "../utils/converters";

export default {
  mounted() {
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");

    const initializeContext = () => {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 1;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    };
    initializeContext();

    let isDrawing = false;
    let start = null;
    const user = this.el.dataset.userName;
    const userColor = this.el.dataset.userColor;
    const editLog = [];

    const drawSegment = (start, stop, color) => {
      const startCoords = getCanvasCoords(canvas, start);
      const stopCoords = getCanvasCoords(canvas, stop);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(startCoords.x, startCoords.y);
      ctx.lineTo(stopCoords.x, stopCoords.y);
      ctx.stroke();
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeContext();

      editLog.forEach(({ start, stop, color }) => {
        drawSegment(start, stop, color);
      });
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    this.handleEvent("new-draw-segment", ({ color, start, stop, _userId }) => {
      drawSegment(start, stop, color);
      editLog.push({ start, stop, color });
    });

    canvas.addEventListener("pointerdown", (e) => {
      isDrawing = true;
      start = getPercentageCoords(canvas, { x: e.clientX, y: e.clientY });
    });

    canvas.addEventListener("pointermove", (e) => {
      const stop = getPercentageCoords(canvas, { x: e.clientX, y: e.clientY });

      if (isDrawing) {
        drawSegment(start, stop, userColor);
        editLog.push({ start, stop, color: userColor });

        this.pushEvent("draw-segment", {
          start,
          stop,
          color: userColor,
          userId: user,
        });

        start = stop;
      }

      this.pushEvent("mouse-move", {
        x: stop.x,
        y: stop.y,
      });
    });

    canvas.addEventListener("pointerup", () => {
      isDrawing = false;
      this.pushEvent("mouse-up");
    });
  },
};
