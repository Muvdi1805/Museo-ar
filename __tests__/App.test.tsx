import { render, screen } from "@testing-library/react-native";
import React from "react";

import App from "../App";

describe("App", () => {
  it("renders the home screen", async () => {
    render(<App />);
    expect(await screen.findByText("Museo AR 360°")).toBeTruthy();
    expect(screen.getByText("Entrar al museo")).toBeTruthy();
  });
});
