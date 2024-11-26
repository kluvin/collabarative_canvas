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
    let lastX = 0;
    let lastY = 0;
    const userPaths = {};
    const user = this.el.dataset.userName;

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

    const continueSegment = ({ x, y, prevX, prevY }, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    this.handleEvent("new-draw-segment", ({ newPath, color, x, y, userId }) => {
      const coords = getCanvasCoords({ x, y });
      if (newPath) {
        userPaths[userId] = { lastX: coords.x, lastY: coords.y };
      } else {
        const lastCoords = userPaths[userId];
        if (lastCoords) {
          continueSegment(
            { x: coords.x, y: coords.y, prevX: lastCoords.lastX, prevY: lastCoords.lastY },
            color
          );
        }
        userPaths[userId] = { lastX: coords.x, lastY: coords.y };
      }
    });

    canvas.addEventListener("pointerdown", (e) => {
      isDrawing = true;
      const coords = getOffsetCoords(e);
      lastX = coords.x;
      lastY = coords.y;
      this.pushEvent("draw-segment", {
        ...getRelativeCoords(e),
        newPath: true,
        color: this.el.dataset.userColor,
        userId: user,
      });
    });

    canvas.addEventListener("pointermove", (e) => {
      if (isDrawing) {
        const coords = getOffsetCoords(e);
        continueSegment(
          { x: coords.x, y: coords.y, prevX: lastX, prevY: lastY },
          this.el.dataset.userColor
        );
        lastX = coords.x;
        lastY = coords.y;
        this.pushEvent("draw-segment", {
          ...getRelativeCoords(e),
          newPath: false,
          color: this.el.dataset.userColor,
          userId: user,
        });
      }
      this.pushEvent("mouse-move", { ...getRelativeCoords(e) });
    });

    canvas.addEventListener("pointerup", () => {
      isDrawing = false;
      this.pushEvent("mouse-up");
    });
  },
};
