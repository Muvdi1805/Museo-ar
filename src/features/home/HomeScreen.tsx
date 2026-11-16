import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Surface, Text } from "react-native-paper";

const STEPS = [
  "Abre «Museo AR» y permite el acceso a la cámara.",
  "Mantén el teléfono vertical y gira sobre ti mismo: las obras están repartidas en 360° a tu alrededor.",
  "Toca un cuadro para ver su ficha técnica y sus coordenadas espaciales.",
  "Pulsa «Añadir obra», elige o toma una foto y fíjala hacia donde apuntes.",
  "Si las obras se desalinean, pulsa el botón de recalibrar (la mira) apuntando al frente.",
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium">Museo AR 360°</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Demostración de realidad aumentada con cámara en vivo y sensores de movimiento.
        </Text>

        <Card style={styles.card}>
          <Card.Title title="Cómo usarlo" />
          <Card.Content>
            {STEPS.map((step, i) => (
              <Text key={step} variant="bodyMedium" style={styles.step}>
                {i + 1}. {step}
              </Text>
            ))}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon="rotate-3d-variant"
          onPress={() => navigation.navigate("Tabs", { screen: "ArMuseum" })}
          style={styles.button}
        >
          Entrar al museo
        </Button>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  card: {
    marginTop: 20,
  },
  step: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
});
