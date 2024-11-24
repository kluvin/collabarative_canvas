defmodule CollabarativeCanvas.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CollabarativeCanvasWeb.Telemetry,
      {DNSCluster,
       query: Application.get_env(:collabarative_canvas, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CollabarativeCanvas.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: CollabarativeCanvas.Finch},
      CollabarativeCanvasWeb.Presence,
      # Start a worker by calling: CollabarativeCanvas.Worker.start_link(arg)
      # {CollabarativeCanvas.Worker, arg},
      # Start to serve requests, typically the last entry
      CollabarativeCanvasWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: CollabarativeCanvas.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    CollabarativeCanvasWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
