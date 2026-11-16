import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { Artwork } from "../../domain/entities/Artwork";

const SIZE = 120;
const RADIUS = SIZE / 2;
const DOT = 11;
const WEDGE_HALF_WIDTH = 26;

type Props = { artworks: Artwork[]; yaw: SharedValue<number> };

// Mini-map of the 360° room seen from above: the wedge is where the camera looks,
// the dots are the artworks. The dot layer counter-rotates as the user turns.
export default function ArtworkRadar({ artworks, yaw }: Props) {
  const layerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-yaw.value}deg` }] }));

  return (
    <View style={styles.radar} accessibilityLabel="Radar de obras">
      <View style={styles.wedge} />
      <Animated.View style={[StyleSheet.absoluteFill, layerStyle]}>
        <Text style={styles.front}>F</Text>
        {artworks.map((a) => {
          const angle = (a.position.yaw * Math.PI) / 180;
          const r = RADIUS - DOT - 2;
          return (
            <View
              key={a.id}
              style={[
                styles.dot,
                {
                  left: RADIUS + r * Math.sin(angle) - DOT / 2,
                  top: RADIUS - r * Math.cos(angle) - DOT / 2,
                  backgroundColor: a.isSample ? "#C9A227" : "#81C784",
                },
              ]}
            />
          );
        })}
      </Animated.View>
      <View style={styles.center} />
    </View>
  );
}

const styles = StyleSheet.create({
  radar: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
  },
  wedge: {
    position: "absolute",
    left: RADIUS - WEDGE_HALF_WIDTH,
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: WEDGE_HALF_WIDTH,
    borderRightWidth: WEDGE_HALF_WIDTH,
    borderTopWidth: RADIUS,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(79,195,247,0.35)",
  },
  front: {
    position: "absolute",
    top: 2,
    width: SIZE,
    textAlign: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  dot: {
    position: "absolute",
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  center: {
    position: "absolute",
    left: RADIUS - 4,
    top: RADIUS - 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4FC3F7",
  },
});
