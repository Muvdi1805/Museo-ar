import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";
import React from "react";

import App from "../../App";

// End-to-end through the real container:
// screens -> context -> use cases -> repository / sensor adapter -> AsyncStorage, DeviceMotion (mocked).

const rad = (deg: number) => (deg * Math.PI) / 180;

// Pushes a DeviceMotion reading to whatever the app subscribed (phone upright, turned `yawDeg` to the right).
function pushReading(yawDeg: number) {
  const calls = (DeviceMotion.addListener as jest.Mock).mock.calls;
  const listener = calls[calls.length - 1][0] as (m: DeviceMotionMeasurement) => void;
  listener({ rotation: { alpha: rad(-yawDeg), beta: rad(90), gamma: 0, timestamp: 0 } } as DeviceMotionMeasurement);
}

// The AR layer needs the screen size, which Jest never measures on its own.
function layoutArView() {
  fireEvent(screen.getByTestId("ar-viewer"), "layout", {
    nativeEvent: { layout: { width: 400, height: 800, x: 0, y: 0 } },
  });
}

describe("AR museum flow", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("shows the samples, pins a new photo where the phone points, then resets the room", async () => {
    render(<App />);

    fireEvent.press(await screen.findByText("Entrar al museo"));
    layoutArView();

    // Samples are seeded on first launch.
    expect(await screen.findByLabelText("Obra: La noche estrellada")).toBeTruthy();
    expect(screen.getByText("3 obras en la sala")).toBeTruthy();

    // Step 1: choose a photo and a title.
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///cache/ImagePicker/photo.jpg" }],
    });
    fireEvent.press(screen.getByLabelText("Añadir obra"));
    fireEvent.press(await screen.findByText("Galería"));
    expect(await screen.findByTestId("artwork-preview")).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("Título"), "Foto del salón");
    fireEvent.press(screen.getByText("Continuar: apuntar y fijar"));

    // Step 2: back in the AR view, the phone points to the front and the artwork is pinned there.
    expect(await screen.findByText("Fijar aquí")).toBeTruthy();
    act(() => pushReading(0));
    fireEvent.press(screen.getByText("Fijar aquí"));

    expect(await screen.findByLabelText("Obra: Foto del salón")).toBeTruthy();
    expect(screen.getByText("4 obras en la sala")).toBeTruthy();
    expect(await AsyncStorage.getItem("ar-museum.artworks")).toContain("Foto del salón");

    // Reset the room: back to the 3 samples.
    fireEvent.press(screen.getByLabelText("Reiniciar sala"));
    fireEvent.press(await screen.findByText("Reiniciar"));
    expect(await screen.findByText("3 obras en la sala")).toBeTruthy();
    expect(screen.queryByLabelText("Obra: Foto del salón")).toBeNull();
  });
});
