// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "../vendor/topbar";

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");

let Hooks = {};

Hooks.TrackClientCursor = {
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
      y: (e.pageY / window.innerHeight) * 100
    })

    const getOffsetCoords = (e) => ({
      x: e.offsetX,
      y: e.offsetY
    })

    const startSegment = ({x, y}) => {
        ctx.strokeStyle = this.el.dataset.userColor;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    const continueSegment = ({x, y}) => {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    const _drawSegment = ({ start, end, color, continuePath = false }) => {
      ctx.strokeStyle = color;
      if (!continuePath) {
        ctx.beginPath();
      }
      ctx.moveTo(start.x, start.y);
      continueSegment(...end)
    };

    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      startSegment(
        getOffsetCoords(e)
      )
      this.pushEvent("start-segment", { ...getRelativeCoords(e) });
    });

    canvas.addEventListener("mousemove", (e) => {
      if (isDrawing) {
        continueSegment(
          getOffsetCoords(e)
        )
        this.pushEvent("continue-segment", {  ...getRelativeCoords(e) });

      }
      this.pushEvent("mouse-move", {  ...getRelativeCoords(e) }
);
    });

    canvas.addEventListener("mouseup", () => {
      isDrawing = false;
      this.pushEvent("mouse-up")
    });
    
    canvas.addEventListener("mouseleave", () => {
      isDrawing = false;
      this.pushEvent("mouse-up")
    });
  },
};

let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  hooks: Hooks,
  params: { _csrf_token: csrfToken },
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;
