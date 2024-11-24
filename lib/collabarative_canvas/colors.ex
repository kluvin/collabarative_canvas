defmodule CollabarativeCanvasWeb.Colors do
  def getColor(s) do
    hue = to_charlist(s) |> Enum.sum() |> rem(360)
    "oklch(0.5 1 #{hue}deg)"
  end
end
