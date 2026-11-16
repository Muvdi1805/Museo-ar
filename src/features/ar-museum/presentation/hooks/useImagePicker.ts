import * as ImagePicker from "expo-image-picker";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  quality: 0.8,
};

// Opens the system photo picker / camera. Returns the temporary URI of the image, or null if cancelled.
// The repository later copies it to permanent storage.
export function useImagePicker() {
  const pickFromGallery = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    return result.canceled ? null : (result.assets[0]?.uri ?? null);
  };

  const takePhoto = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error("Se necesita permiso de cámara para tomar la foto.");
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    return result.canceled ? null : (result.assets[0]?.uri ?? null);
  };

  return { pickFromGallery, takePhoto };
}
