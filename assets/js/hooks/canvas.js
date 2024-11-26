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
    const userId = this.el.dataset.userName;
    let relStart = null;
    const color = this.el.dataset.userColor;
    const editLog = [];

    const drawSegment = ({ relStart, relStop, color }) => {
      const absStart = getCanvasCoords(canvas, relStart);
      const absStop = getCanvasCoords(canvas, relStop);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(absStart.x, absStart.y);
      ctx.lineTo(absStop.x, absStop.y);
      ctx.stroke();
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeContext();

      editLog.forEach(drawSegment);
    };

    resizeCanvas();

    const handleNewDrawSegment = (segment) => {
      drawSegment(segment);
      editLog.push(segment);
    };

    const handlePointerDown = (e) => {
      isDrawing = true;
      relStart = getPercentageCoords(canvas, { x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e) => {
      const relStop = getPercentageCoords(canvas, {
        x: e.clientX,
        y: e.clientY,
      });

      if (isDrawing) {
        const segment = { relStart, relStop, color };
        drawSegment(segment);
        editLog.push(segment);

        this.pushEvent("draw-segment", {
          relStart,
          relStop,
          color,
          userId,
        });

        relStart = relStop;
      }

      this.pushEvent("mouse-move", relStop);
    };

    const handlePointerUp = () => {
      isDrawing = false;
      this.pushEvent("mouse-up");
    };

    this.handleEvent("new-draw-segment", handleNewDrawSegment);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
  },
};
