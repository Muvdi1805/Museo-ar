import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Surface, Text, TextInput } from "react-native-paper";

import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "../../domain/usecases/PlaceArtworkUseCase";
import { useArMuseum } from "../context/ArMuseumContext";
import { useImagePicker } from "../hooks/useImagePicker";

// Step 1 of adding an artwork: choose the photo and write its texts.
// Step 2 happens back in the AR view: aim the phone and press "Fijar aquí".
export default function PlaceArtworkScreen() {
  const navigation = useNavigation();
  const { setPendingDraft } = useArMuseum();
  const { pickFromGallery, takePhoto } = useImagePicker();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const choose = async (source: () => Promise<string | null>) => {
    setError(null);
    try {
      const uri = await source();
      if (uri) setImageUri(uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo obtener la imagen.");
    }
  };

  const canContinue = !!imageUri && title.trim().length > 0;

  const onContinue = () => {
    if (!imageUri) return;
    setPendingDraft({ title, description, imageUri });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Surface style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.preview}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" testID="artwork-preview" />
            ) : (
              <Text variant="bodyMedium" style={styles.placeholder}>
                Elige una foto de tu galería o toma una nueva
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <Button mode="contained-tonal" icon="image-multiple" onPress={() => choose(pickFromGallery)} style={styles.half}>
              Galería
            </Button>
            <Button mode="contained-tonal" icon="camera" onPress={() => choose(takePhoto)} style={styles.half}>
              Cámara
            </Button>
          </View>

          <TextInput
            label="Título"
            accessibilityLabel="Título"
            value={title}
            onChangeText={setTitle}
            maxLength={MAX_TITLE_LENGTH}
            mode="outlined"
            style={styles.field}
          />
          <HelperText type="info">
            {title.length}/{MAX_TITLE_LENGTH}
          </HelperText>

          <TextInput
            label="Descripción (opcional)"
            accessibilityLabel="Descripción"
            value={description}
            onChangeText={setDescription}
            maxLength={MAX_DESCRIPTION_LENGTH}
            multiline
            numberOfLines={3}
            mode="outlined"
          />
          <HelperText type="info">
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </HelperText>

          {error && <HelperText type="error">{error}</HelperText>}

          <Button mode="contained" icon="crosshairs" onPress={onContinue} disabled={!canContinue} style={styles.field}>
            Continuar: apuntar y fijar
          </Button>
          <Text variant="bodySmall" style={styles.hint}>
            Volverás al visor AR con la obra en el centro. Gira el teléfono hacia donde quieras colgarla y pulsa «Fijar
            aquí».
          </Text>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  preview: {
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(127,127,127,0.6)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    opacity: 0.7,
    textAlign: "center",
    padding: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  half: {
    flex: 1,
  },
  field: {
    marginTop: 8,
  },
  hint: {
    marginTop: 12,
    opacity: 0.7,
    textAlign: "center",
  },
});
