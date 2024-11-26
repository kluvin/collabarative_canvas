export default {
  mounted() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

    let isDrawing = false;

    const getRelativeCoords = (e) => ({
      x: (e.pageX / window.innerWidth) * 100,
      y: (e.pageY / window.innerHeight) * 100,
    });

    const getOffsetCoords = (e) => ({
      x: e.offsetX,
      y: e.offsetY,
    });

    const getCanvasCoords = ({ x, y }) => {
      const rect = canvas.getBoundingClientRect();
      const absX = (x / 100) * window.innerWidth;
      const absY = (y / 100) * window.innerHeight;
      return {
        x: absX - rect.left,
        y: absY - rect.top,
      };
    };

    const startSegment = ({ x, y }, color) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const continueSegment = ({ x, y }, color) => {
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    this.handleEvent("new-draw-segment", ({ newPath, color, x, y }) => {
      const coords = getCanvasCoords({ x, y });
      if (newPath) {
        startSegment(coords, color);
      } else {
        continueSegment(coords, color);
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      startSegment(getOffsetCoords(e), this.el.dataset.userColor);
      this.pushEvent("draw-segment", {
        ...getRelativeCoords(e),
        newPath: true,
        color: this.el.dataset.userColor,
      });
    });

    canvas.addEventListener("mousemove", (e) => {
      if (isDrawing) {
        continueSegment(getOffsetCoords(e), this.el.dataset.userColor);
        this.pushEvent("draw-segment", {
          ...getRelativeCoords(e),
          newPath: false,
          color: this.el.dataset.userColor,
        });
      }
      this.pushEvent("mouse-move", { ...getRelativeCoords(e) });
    });

    canvas.addEventListener("mouseup", () => {
      isDrawing = false;
      this.pushEvent("mouse-up");
    });
  },
};
