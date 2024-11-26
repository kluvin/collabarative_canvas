defmodule CollabarativeCanvasWeb.Colors do
  def get_color(username) do
    # Compute a SHA256 hash of the username
    hash = :crypto.hash(:sha256, username)

    # Extract bytes from the hash for hue, chroma, and lightness
    <<hue_byte1, hue_byte2, chroma_byte, lightness_byte, _rest::binary>> = hash

    # Calculate hue (0 to 359 degrees)
    hue = rem(hue_byte1 * 256 + hue_byte2, 360)

    # Calculate chroma (0.1 to 0.9)
    chroma = 0.1 + chroma_byte / 255.0 * 0.8

    # Calculate lightness (0.3 to 0.7)
    lightness = 0.3 + lightness_byte / 255.0 * 0.4

    # Format the OKLCH color string
    "oklch(#{Float.round(lightness, 4)} #{Float.round(chroma, 4)} #{hue}deg)"
  end
end
