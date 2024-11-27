defmodule CollabarativeCanvasWeb.Router do
  import Phoenix.LiveDashboard.Router
  import Plug.BasicAuth
  use CollabarativeCanvasWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {CollabarativeCanvasWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # Pipeline for basic authentication
  pipeline :dashboard_auth do
    plug :basic_auth, username: "admin", password: "42"
  end

  scope "/", CollabarativeCanvasWeb do
    pipe_through :browser

    get "/", PageController, :home
    live "/canvas", Canvas
  end

  scope "/" do
    pipe_through [:browser, :dashboard_auth]
    live_dashboard "/dashboard", metrics: CollabarativeCanvasWeb.Telemetry
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:collabarative_canvas, :dev_routes) do
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
