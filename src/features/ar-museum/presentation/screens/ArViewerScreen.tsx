import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Dialog, Portal, Snackbar, Text } from "react-native-paper";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { Artwork } from "../../domain/entities/Artwork";
import { Viewport } from "../../domain/services/spatialProjection";
import ArHud from "../components/ArHud";
import ArtworkDetailSheet from "../components/ArtworkDetailSheet";
import CameraBackdrop from "../components/CameraBackdrop";
import FloatingArtworkFrame from "../components/FloatingArtworkFrame";
import PendingArtworkPreview from "../components/PendingArtworkPreview";
import PermissionGate from "../components/PermissionGate";
import { useArMuseum } from "../context/ArMuseumContext";
import { useOrientationSharedValues } from "../hooks/useOrientationSharedValues";

/**
 * Horizontal field of view of a phone's back camera once the preview is cropped to fill a portrait screen.
 * Raise it if artworks seem to move faster than the real world; lower it if they lag behind.
 */
const CAMERA_HORIZONTAL_FOV = 50;

export default function ArViewerScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const museum = useArMuseum();
  const { artworks, loading, error, pendingDraft } = museum;

  const [permission, requestPermission] = useCameraPermissions();
  const [skipCamera, setSkipCamera] = useState(false);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { yaw, pitch, roll, readout, available } = useOrientationSharedValues(isFocused);

  // Counter-rotate the whole artwork layer so frames stay level with the horizon when the phone tilts.
  const levelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-roll.value}deg` }] }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewport({ width, height, horizontalFov: CAMERA_HORIZONTAL_FOV });
  };

  const withBusy = async <T,>(action: () => Promise<T>) => {
    setBusy(true);
    try {
      return await action();
    } finally {
      setBusy(false);
    }
  };

  const onConfirmPlacement = () =>
    withBusy(async () => {
      const placed = await museum.placePendingArtwork();
      if (placed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setNotice(`«${placed.title}» fijada en ${placed.position.yaw.toFixed(0)}°`);
      }
    });

  const onDelete = (artwork: Artwork) =>
    withBusy(async () => {
      if (await museum.deleteArtwork(artwork.id)) {
        setSelected(null);
        setNotice(`«${artwork.title}» eliminada`);
      }
    });

  const onReset = () =>
    withBusy(async () => {
      setConfirmReset(false);
      if (await museum.resetGallery()) setNotice("Sala reiniciada con las obras de ejemplo");
    });

  const onRecalibrate = () => {
    museum.recalibrate();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setNotice("Frente recalibrado: hacia donde apuntas ahora es 0°");
  };

  const cameraGranted = permission?.granted ?? false;
  const showGate = permission !== null && !cameraGranted && !skipCamera;

  return (
    <View style={styles.container} onLayout={onLayout} testID="ar-viewer">
      <CameraBackdrop active={isFocused && cameraGranted} />

      {viewport && (
        <Animated.View style={[StyleSheet.absoluteFill, levelStyle]} testID="ar-layer">
          {artworks.map((artwork) => (
            <FloatingArtworkFrame
              key={artwork.id}
              artwork={artwork}
              yaw={yaw}
              pitch={pitch}
              viewport={viewport}
              onPress={setSelected}
            />
          ))}
        </Animated.View>
      )}

      {pendingDraft && <PendingArtworkPreview draft={pendingDraft} />}

      <ArHud
        artworks={artworks}
        yaw={yaw}
        readout={readout}
        sensorsAvailable={available}
        placing={pendingDraft !== null}
        busy={busy}
        onAdd={() => navigation.navigate("PlaceArtwork")}
        onRecalibrate={onRecalibrate}
        onReset={() => setConfirmReset(true)}
        onConfirmPlacement={onConfirmPlacement}
        onCancelPlacement={() => museum.setPendingDraft(null)}
      />

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {showGate && (
        <PermissionGate
          canAskAgain={permission?.canAskAgain ?? true}
          onRequest={requestPermission}
          onSkip={() => setSkipCamera(true)}
        />
      )}

      <ArtworkDetailSheet
        artwork={selected}
        deleting={busy}
        onDismiss={() => setSelected(null)}
        onDelete={onDelete}
      />

      <Portal>
        <Dialog visible={confirmReset} onDismiss={() => setConfirmReset(false)}>
          <Dialog.Title>¿Reiniciar la sala?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Se eliminarán las obras que agregaste y volverán las obras de ejemplo a sus posiciones originales.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmReset(false)}>Cancelar</Button>
            <Button onPress={onReset}>Reiniciar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!error || !!notice}
        onDismiss={() => {
          museum.clearError();
          setNotice(null);
        }}
        duration={3000}
      >
        {error ?? notice ?? ""}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  loading: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
});
