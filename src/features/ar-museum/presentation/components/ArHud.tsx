import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, FAB, IconButton } from "react-native-paper";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Artwork } from "../../domain/entities/Artwork";
import { OrientationReadout } from "../hooks/useOrientationSharedValues";
import ArtworkRadar from "./ArtworkRadar";

type Props = {
  artworks: Artwork[];
  yaw: SharedValue<number>;
  readout: OrientationReadout | null;
  sensorsAvailable: boolean | null;
  placing: boolean;
  busy: boolean;
  onAdd: () => void;
  onRecalibrate: () => void;
  onReset: () => void;
  onConfirmPlacement: () => void;
  onCancelPlacement: () => void;
};

/** Distance from the safe-area top to the radar, in px. */
const RADAR_TOP_OFFSET = 90;

const formatAngle = (deg: number) => `${deg >= 0 ? "+" : "−"}${Math.abs(deg).toFixed(0).padStart(3, "0")}°`;

// Heads-up display drawn over the camera: readout, radar, crosshair and controls.
export default function ArHud(props: Props) {
  const insets = useSafeAreaInsets();
  const { readout, placing, busy } = props;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.readout}>
          <Text style={styles.readoutTitle}>Museo AR 360°</Text>
          <Text style={styles.readoutText}>
            {readout
              ? `Rumbo ${formatAngle(readout.yaw)} · Inclinación ${formatAngle(readout.pitch)}`
              : "Esperando sensores…"}
          </Text>
          <Text style={styles.readoutText}>{props.artworks.length} obras en la sala</Text>
        </View>
      </View>

      {/* Below the top-right corner, which Expo Go's floating dev button covers. */}
      <View style={[styles.radar, { top: insets.top + RADAR_TOP_OFFSET }]}>
        <ArtworkRadar artworks={props.artworks} yaw={props.yaw} />
      </View>

      {props.sensorsAvailable === false && (
        <Text style={styles.warning}>
          Este dispositivo no reporta sensores de movimiento. Usa un teléfono físico para la experiencia AR.
        </Text>
      )}

      <View style={styles.crosshair}>
        <View style={styles.crossH} />
        <View style={styles.crossV} />
      </View>

      <View style={styles.bottomBar}>
        {placing ? (
          <>
            <Button mode="contained-tonal" onPress={props.onCancelPlacement} disabled={busy}>
              Cancelar
            </Button>
            <Button mode="contained" icon="pin" onPress={props.onConfirmPlacement} loading={busy} disabled={busy}>
              Fijar aquí
            </Button>
          </>
        ) : (
          <>
            <IconButton
              icon="crosshairs-gps"
              mode="contained"
              onPress={props.onRecalibrate}
              accessibilityLabel="Recalibrar frente"
            />
            <FAB icon="image-plus" label="Añadir obra" onPress={props.onAdd} accessibilityLabel="Añadir obra" />
            <IconButton
              icon="restore"
              mode="contained"
              onPress={props.onReset}
              disabled={busy}
              accessibilityLabel="Reiniciar sala"
            />
          </>
        )}
      </View>
    </View>
  );
}

const textShadow = {
  textShadowColor: "rgba(0,0,0,0.8)",
  textShadowRadius: 4,
  textShadowOffset: { width: 0, height: 1 },
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "box-none",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    pointerEvents: "box-none",
  },
  radar: {
    position: "absolute",
    right: 16,
  },
  readout: {
    flexShrink: 1,
    paddingRight: 12,
  },
  readoutTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    ...textShadow,
  },
  readoutText: {
    color: "#fff",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    ...textShadow,
  },
  warning: {
    margin: 16,
    padding: 10,
    borderRadius: 8,
    overflow: "hidden",
    color: "#fff",
    backgroundColor: "rgba(183,28,28,0.8)",
  },
  crosshair: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    pointerEvents: "none",
  },
  crossH: {
    position: "absolute",
    top: 13,
    width: 28,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  crossV: {
    position: "absolute",
    left: 13,
    width: 2,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});
