defmodule CollabarativeCanvasWeb.ErrorJSONTest do
  use CollabarativeCanvasWeb.ConnCase, async: true

  test "renders 404" do
    assert CollabarativeCanvasWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert CollabarativeCanvasWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
