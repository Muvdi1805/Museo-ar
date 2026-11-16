import { CameraView } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  /** Only mount the camera while the screen is visible and permission is granted (frees the camera otherwise). */
  active: boolean;
};

// Live feed of the back camera behind the AR layer. Falls back to a dark "room" when inactive.
export default function CameraBackdrop({ active }: Props) {
  return (
    <View style={styles.fill}>
      {active && <CameraView style={StyleSheet.absoluteFill} facing="back" testID="ar-camera" />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#15120E",
  },
});
