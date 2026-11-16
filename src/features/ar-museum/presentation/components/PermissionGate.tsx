import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

type Props = {
  canAskAgain: boolean;
  onRequest: () => void;
  onSkip: () => void;
};

// Explains why the camera is needed. The demo still works without it (artworks over a dark room).
export default function PermissionGate({ canAskAgain, onRequest, onSkip }: Props) {
  return (
    <View style={styles.overlay}>
      <Card style={styles.card}>
        <Card.Title title="Permiso de cámara" />
        <Card.Content>
          <Text variant="bodyMedium">
            El museo AR muestra las obras flotando sobre la imagen en vivo de la cámara trasera. Las imágenes no se
            guardan ni se envían a ningún lado.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={onSkip}>Continuar sin cámara</Button>
          {canAskAgain ? (
            <Button mode="contained" onPress={onRequest}>
              Permitir cámara
            </Button>
          ) : (
            <Button mode="contained" onPress={() => Linking.openSettings()}>
              Abrir ajustes
            </Button>
          )}
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  card: {
    paddingBottom: 4,
  },
});
