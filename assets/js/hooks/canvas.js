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
    const editLog = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      editLog.forEach(({ start, stop, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(stop.x, stop.y);
        ctx.stroke();
      });
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    const drawSegment = (start, stop, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(stop.x, stop.y);
      ctx.stroke();

      editLog.push({ start, stop, color });
    };

    const getCanvasCoords = ({ x, y }) => {
      const absX = (x / 100) * canvas.width;
      const absY = (y / 100) * canvas.height;
      return { x: absX, y: absY };
    };

    this.handleEvent("new-draw-segment", ({ newPath, color, x, y, userId }) => {
      const coords = getCanvasCoords({ x, y });
      if (newPath) {
        userPaths[userId] = { x: coords.x, y: coords.y };
      } else {
        const prevCoords = userPaths[userId];
        if (prevCoords) {
          drawSegment(prevCoords, coords, color);
        }
        userPaths[userId] = { x: coords.x, y: coords.y };
      }
    });

    canvas.addEventListener("pointerdown", (e) => {
      isDrawing = true;
      start = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("pointermove", (e) => {
      if (isDrawing) {
        const stop = { x: e.clientX, y: e.clientY };
        drawSegment(start, stop, this.el.dataset.userColor);
        start = stop;
        this.pushEvent("draw-segment", {
          x: (e.clientX / canvas.width) * 100,
          y: (e.clientY / canvas.height) * 100,
          newPath: false,
          color: this.el.dataset.userColor,
          userId: user,
        });
      }
      this.pushEvent("mouse-move", {
        x: (e.clientX / canvas.width) * 100,
        y: (e.clientY / canvas.height) * 100,
      });
    });

    canvas.addEventListener("pointerup", () => {
      isDrawing = false;
      this.pushEvent("mouse-up");
    });
  },
};