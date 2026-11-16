import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { Artwork } from "../../domain/entities/Artwork";
import { projectToViewport, Viewport } from "../../domain/services/spatialProjection";
import { resolveArtworkImage } from "../assets/sampleArtworkImages";

export const FRAME_WIDTH = 150;
const IMAGE_HEIGHT = 170;
const PLAQUE_HEIGHT = 36;
export const FRAME_HEIGHT = IMAGE_HEIGHT + PLAQUE_HEIGHT + 16; // + frame padding

const GOLD = "#C9A227";
const FOCUS = "#4FC3F7";

type Props = {
  artwork: Artwork;
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  viewport: Viewport;
  onPress: (artwork: Artwork) => void;
};

// A picture frame anchored at an angular position. Its screen position is recomputed on the UI thread
// every time the orientation changes, with the same pure projection used (and tested) in the domain.
export default function FloatingArtworkFrame({ artwork, yaw, pitch, viewport, onPress }: Props) {
  const position = artwork.position;

  const animatedStyle = useAnimatedStyle(() => {
    const p = projectToViewport(position, { yaw: yaw.value, pitch: pitch.value }, viewport);
    return {
      opacity: p.opacity,
      borderColor: p.focused ? FOCUS : GOLD,
      transform: [
        { translateX: p.x - FRAME_WIDTH / 2 },
        { translateY: p.y - FRAME_HEIGHT / 2 },
        { scale: p.scale },
      ],
    };
  });

  return (
    <Animated.View style={[styles.frame, animatedStyle]}>
      <Pressable
        onPress={() => onPress(artwork)}
        accessibilityRole="button"
        accessibilityLabel={`Obra: ${artwork.title}`}
      >
        <Image
          source={resolveArtworkImage(artwork.image)}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.plaque}>
          <Text style={styles.title} numberOfLines={2}>
            {artwork.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    padding: 6,
    borderWidth: 4,
    borderRadius: 4,
    backgroundColor: "#2B1D0E",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  image: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: "#111",
  },
  plaque: {
    height: PLAQUE_HEIGHT,
    marginTop: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4ECD8",
    borderRadius: 2,
  },
  title: {
    color: "#2B1D0E",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
