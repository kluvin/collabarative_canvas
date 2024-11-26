export default {
  mounted() {
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

    let isDrawing = false;
    let start = { x: 0, y: 0 };
    const userPaths = {};
    const user = this.el.dataset.userName;

    const drawSegment = (start, stop, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(stop.x, stop.y);
      ctx.stroke();
    };

    this.handleEvent("new-draw-segment", ({ newPath, color, x, y, userId }) => {
      
      // Convert relative percentage coordinates (x, y)%
      // back into absolute canvas coordinates.
      const getCanvasCoords = ({ x, y }) => {
        const rect = canvas.getBoundingClientRect();
        const absX = (x / 100) * window.innerWidth;
        const absY = (y / 100) * window.innerHeight;
        return {
          x: absX - rect.left,
          y: absY - rect.top,
        };
      };

      const coords = getCanvasCoords({ x, y });
      if (newPath) {
        userPaths[userId] = { x: coords.x, y: coords.y };
      } else {
        const prevCoords = userPaths[userId];
        if (prevCoords) {
          drawSegment(
            { x: prevCoords.x, y: prevCoords.y },
            { x: coords.x, y: coords.y },
            color
          );
        }
        userPaths[userId] = { x: coords.x, y: coords.y };
      }
    });

    canvas.addEventListener("pointerdown", (e) => {
      isDrawing = true;
      // e.offsetX and e.offsetY provide the x and y coordinates of the mouse pointer
      // relative to the position of the padding edge of the target element (the canvas).
      start = { x: e.offsetX, y: e.offsetY };
    });

    canvas.addEventListener("pointermove", (e) => {
      const relativeCoords = {
        // Convert the absolute page coordinates of the mouse event to relative coordinates
        // relative to the viewport size, scaled to a percentage (0-100).

        // window.innerWidth and window.innerHeight represent the full width and height of the viewport.
        // The resulting x and y values are the percentage positions of the mouse event within the viewport.
        x: (e.pageX / window.innerWidth) * 100,
        y: (e.pageY / window.innerHeight) * 100,
      };

      if (isDrawing) {
        const stop = { x: e.offsetX, y: e.offsetY };
        drawSegment(start, stop, this.el.dataset.userColor);
        start = stop;
        this.pushEvent("draw-segment", {
          ...relativeCoords,
          newPath: false,
          color: this.el.dataset.userColor,
          userId: user,
        });
      }
      // This is totally redundant. Right now we're storing the mouse movement in Presence
      // however, we can just use channels here as well.
      this.pushEvent("mouse-move", { ...relativeCoords });
    });

    canvas.addEventListener("pointerup", () => {
      isDrawing = false;
      this.pushEvent("mouse-up");
    });
  },
};
