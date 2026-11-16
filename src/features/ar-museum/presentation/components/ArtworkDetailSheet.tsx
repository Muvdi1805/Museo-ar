import { Image } from "expo-image";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Modal, Portal, Text, useTheme } from "react-native-paper";

import { Artwork } from "../../domain/entities/Artwork";
import { resolveArtworkImage } from "../assets/sampleArtworkImages";

type Props = {
  artwork: Artwork | null;
  deleting: boolean;
  onDismiss: () => void;
  onDelete: (artwork: Artwork) => void;
};

const signed = (deg: number) => `${deg >= 0 ? "+" : "−"}${Math.abs(deg).toFixed(1)}°`;

// Technical sheet shown when an artwork is tapped in the AR view.
export default function ArtworkDetailSheet({ artwork, deleting, onDismiss, onDelete }: Props) {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={artwork !== null}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.sheet, { backgroundColor: theme.colors.elevation.level3 }]}
      >
        {artwork && (
          <ScrollView>
            <Image source={resolveArtworkImage(artwork.image)} style={styles.image} contentFit="contain" />
            <Text variant="titleLarge" style={styles.title}>
              {artwork.title}
            </Text>
            {artwork.isSample && (
              <Chip icon="star" compact style={styles.chip}>
                Obra de ejemplo
              </Chip>
            )}
            {!!artwork.description && <Text variant="bodyMedium">{artwork.description}</Text>}

            <Text variant="titleSmall" style={styles.section}>
              Ficha técnica · coordenadas espaciales
            </Text>
            <Row label="Yaw (horizontal)" value={signed(artwork.position.yaw)} />
            <Row label="Pitch (vertical)" value={signed(artwork.position.pitch)} />
            <Row label="Distancia virtual" value={`${artwork.position.distance.toFixed(1)} m`} />
            {!artwork.isSample && (
              <Row label="Fijada el" value={new Date(artwork.createdAt).toLocaleString()} />
            )}

            <View style={styles.actions}>
              <Button
                mode="outlined"
                icon="delete-outline"
                textColor={theme.colors.error}
                onPress={() => onDelete(artwork)}
                loading={deleting}
                disabled={deleting}
                accessibilityLabel={`Eliminar «${artwork.title}»`}
              >
                Eliminar
              </Button>
              <Button mode="contained" onPress={onDismiss}>
                Cerrar
              </Button>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={styles.rowLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: "85%",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    backgroundColor: "#111",
  },
  title: {
    marginTop: 12,
    marginBottom: 4,
  },
  chip: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(127,127,127,0.3)",
  },
  rowLabel: {
    opacity: 0.7,
  },
  rowValue: {
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
