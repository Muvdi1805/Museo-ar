import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PlaceArtworkInput } from "../../domain/usecases/PlaceArtworkUseCase";
import { FRAME_HEIGHT, FRAME_WIDTH } from "./FloatingArtworkFrame";

// Ghost of the artwork about to be pinned, fixed at the center of the screen (under the crosshair).
export default function PendingArtworkPreview({ draft }: { draft: PlaceArtworkInput }) {
  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        <Image source={{ uri: draft.imageUri }} style={styles.image} contentFit="cover" />
        <Text style={styles.title} numberOfLines={1}>
          {draft.title}
        </Text>
      </View>
      <Text style={styles.hint}>Apunta a donde quieras colgarla y pulsa «Fijar aquí»</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    padding: 6,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#4FC3F7",
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.25)",
    opacity: 0.85,
  },
  image: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  hint: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
});
