defmodule CollabarativeCanvasWeb.Canvas do
  import CollabarativeCanvasWeb.Colors
  alias CollabarativeCanvasWeb.Presence
  use CollabarativeCanvasWeb, :live_view

  @topic "canvasview"
  def mount(_params, %{"user" => user}, socket) do
    color = get_color(user)

    if connected?(socket) do
      Presence.track(self(), @topic, socket.id, %{
        socket_id: socket.id,
        # x, y should be retrieved from client on connect.\
        # the next props should ideally be one object
        x: 50,
        y: 50,
        name: user,
        color: color
      })

      CollabarativeCanvasWeb.Endpoint.subscribe(@topic)
    end

    updated =
      assign(socket, %{
        users: list_users(),
        socket_id: socket.id,
        user: %{
          name: user,
          color: color
        }
      })

    {:ok, updated}
  end

  def mount(_params, _session, socket) do
    {:ok, socket |> redirect(to: "/")}
  end

  def handle_event("mouse-move", params, socket) do
    metas =
      Presence.get_by_key(@topic, socket.id)[:metas]
      |> hd
      |> Map.merge(
        Map.new(params, fn {k, v} ->
          {String.to_existing_atom(k), v}
        end)
      )

    Presence.update(self(), @topic, socket.id, metas)

    {:noreply, socket}
  end

  def handle_event("mouse-up", _, socket) do
    {:noreply, socket}
  end

  def handle_event("draw-segment", params, socket) do
    CollabarativeCanvasWeb.Endpoint.broadcast_from(
      self(),
      @topic,
      "new-draw-segment",
      params
    )

    {:noreply, socket}
  end

  def handle_info(%{event: "new-draw-segment", payload: payload}, socket) do
    socket = push_event(socket, "new-draw-segment", payload)
    {:noreply, socket}
  end

  def handle_info(%{event: "presence_diff", payload: _payload}, socket) do
    socket = assign(socket, users: list_users())
    {:noreply, socket}
  end

  def render(assigns) do
    ~H"""
    <div
      id="canvas-page"
      class="touch-none"
      phx-hook="Canvas"
      data-user-color={@user.color}
      data-user-name={@user.name}
    >
      <canvas class="cursor-none" id="c" width="2000" height="1000" />
      <ul class="list-none" id="cursors">
        <%= for user <- @users do %>
          <li
            style={"color: #{user.color}; left: #{user.x}%; top: #{user.y}%;"}
            class="flex flex-col absolute pointer-events-none whitespace-nowrap overflow-hidden"
          >
            <svg
              version="1.1"
              width="25px"
              height="25px"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="8 3 21 21"
            >
              <polygon fill="black" points="8.2,20.9 8.2,4.9 19.8,16.5 13,16.5 12.6,16.6" />
              <polygon fill="currentColor" points="9.2,7.3 9.2,18.5 12.2,15.6 12.6,15.5 17.4,15.5" />
            </svg>

            <span style={"color: #{user.color};"} class="mt-1 ml-4 px-1 text-sm text-white">
              <%= user.name %>
            </span>
          </li>
        <% end %>
      </ul>
    </div>
    """
  end

  defp list_users do
    Presence.list(@topic)
    |> Enum.map(fn {_, data} -> hd(data.metas) end)
  end
end
