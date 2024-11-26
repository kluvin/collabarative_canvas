defmodule CollabarativeCanvasWeb.PageController do
  use CollabarativeCanvasWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    session =
      get_session(conn)

    conn =
      case session do
        _ ->
          conn
          |> put_session(:user, CollabarativeCanvas.Name.generate())
          |> configure_session(renew: true)
      end

    redirect(conn, to: "/canvas")
  end
end
