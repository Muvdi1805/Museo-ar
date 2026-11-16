import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { DeleteArtworkUseCase } from "@/src/features/ar-museum/domain/usecases/DeleteArtworkUseCase";
import { GetGalleryArtworksUseCase } from "@/src/features/ar-museum/domain/usecases/GetGalleryArtworksUseCase";
import { ObserveDeviceOrientationUseCase } from "@/src/features/ar-museum/domain/usecases/ObserveDeviceOrientationUseCase";
import { PlaceArtworkUseCase } from "@/src/features/ar-museum/domain/usecases/PlaceArtworkUseCase";
import { RecalibrateSpatialTrackerUseCase } from "@/src/features/ar-museum/domain/usecases/RecalibrateSpatialTrackerUseCase";
import { ResetGalleryUseCase } from "@/src/features/ar-museum/domain/usecases/ResetGalleryUseCase";
import { ArMuseumProvider } from "@/src/features/ar-museum/presentation/context/ArMuseumContext";
import ArViewerScreen from "@/src/features/ar-museum/presentation/screens/ArViewerScreen";
import { FakeSpatialTracker, InMemoryArtworkRepository, makeArtwork } from "../../helpers/arMuseumFakes";

const Stack = createNativeStackNavigator();

// Real use cases over fake repository/tracker, injected through the DI container.
function renderViewer(repo: InMemoryArtworkRepository, tracker = new FakeSpatialTracker()) {
  const container = new Container()
    .register(TOKENS.PlaceArtworkUC, new PlaceArtworkUseCase(repo, tracker))
    .register(TOKENS.GetGalleryArtworksUC, new GetGalleryArtworksUseCase(repo))
    .register(TOKENS.DeleteArtworkUC, new DeleteArtworkUseCase(repo))
    .register(TOKENS.ResetGalleryUC, new ResetGalleryUseCase(repo))
    .register(TOKENS.ObserveDeviceOrientationUC, new ObserveDeviceOrientationUseCase(tracker))
    .register(TOKENS.RecalibrateSpatialTrackerUC, new RecalibrateSpatialTrackerUseCase(tracker));

  const utils = render(
    <DIProvider container={container}>
      <ArMuseumProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="ArMuseum" component={ArViewerScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ArMuseumProvider>
    </DIProvider>,
  );
  // Give the screen a size so the AR layer (which needs the viewport) is rendered.
  fireEvent(utils.getByTestId("ar-viewer"), "layout", {
    nativeEvent: { layout: { width: 400, height: 800, x: 0, y: 0 } },
  });
  return { ...utils, tracker };
}

const starry = makeArtwork({ id: "s1", title: "La noche estrellada", description: "Van Gogh, 1889" });
const mine = makeArtwork({
  id: "m1",
  title: "Mi foto",
  isSample: false,
  image: { kind: "uri", uri: "file:///x.jpg" },
  position: { yaw: 45, pitch: -10, distance: 2 },
});

describe("ArViewerScreen", () => {
  it("shows the gallery's artworks as floating frames", async () => {
    renderViewer(new InMemoryArtworkRepository([starry, mine]));
    expect(await screen.findByLabelText("Obra: La noche estrellada")).toBeTruthy();
    expect(screen.getByLabelText("Obra: Mi foto")).toBeTruthy();
    expect(screen.getByText("2 obras en la sala")).toBeTruthy();
  });

  it("shows the live orientation readout from the tracker", async () => {
    const { tracker } = renderViewer(new InMemoryArtworkRepository([starry]));
    await screen.findByLabelText("Obra: La noche estrellada");

    act(() => tracker.emit({ yaw: 45, pitch: -12, roll: 0 }));

    expect(screen.getByText("Rumbo +045° · Inclinación −012°")).toBeTruthy();
  });

  it("opens the technical sheet with the spatial coordinates when a frame is tapped", async () => {
    renderViewer(new InMemoryArtworkRepository([mine]));
    fireEvent.press(await screen.findByLabelText("Obra: Mi foto"));

    expect(await screen.findByText("Ficha técnica · coordenadas espaciales")).toBeTruthy();
    expect(screen.getByText("+45.0°")).toBeTruthy();
    expect(screen.getByText("−10.0°")).toBeTruthy();
    expect(screen.getByText("2.0 m")).toBeTruthy();
  });

  it("deletes an artwork from its sheet", async () => {
    const repo = new InMemoryArtworkRepository([starry, mine]);
    renderViewer(repo);
    fireEvent.press(await screen.findByLabelText("Obra: Mi foto"));
    fireEvent.press(await screen.findByLabelText("Eliminar «Mi foto»"));

    expect(await screen.findByText("«Mi foto» eliminada")).toBeTruthy();
    expect(repo.artworks.map((a) => a.id)).toEqual(["s1"]);
    expect(screen.queryByLabelText("Obra: Mi foto")).toBeNull();
  });

  it("resets the room after confirming", async () => {
    const repo = new InMemoryArtworkRepository([mine], [starry]);
    renderViewer(repo);
    await screen.findByLabelText("Obra: Mi foto");

    fireEvent.press(screen.getByLabelText("Reiniciar sala"));
    fireEvent.press(await screen.findByText("Reiniciar"));

    expect(await screen.findByLabelText("Obra: La noche estrellada")).toBeTruthy();
    expect(screen.queryByLabelText("Obra: Mi foto")).toBeNull();
  });

  it("recalibrates the tracker", async () => {
    const { tracker } = renderViewer(new InMemoryArtworkRepository([starry]));
    fireEvent.press(await screen.findByLabelText("Recalibrar frente"));
    expect(tracker.recalibrations).toBe(1);
  });
});
