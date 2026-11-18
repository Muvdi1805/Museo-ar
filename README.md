# [Video Presentacion](https://youtu.be/cCyG8VLstHs)

# Museo AR 360°

Aplicación móvil de realidad aumentada para Expo Go: una galería de obras virtuales que flotan a tu alrededor, en 360°, sobre la imagen en vivo de la cámara. Las obras se ubican con los sensores de movimiento del teléfono.

## Grupo

- **Grupo N.9º:** 
- **Integrantes:**
  - Nicolas Muvdi
  - Juan José Bolívar

## Funcionalidades

- **Visor AR:** la cámara trasera muestra el entorno real y encima flotan los cuadros. Al girar el teléfono, cada cuadro se mantiene en su posición dentro del espacio.
- **Añadir obras:** eliges una foto de la galería o tomas una nueva, le pones título y descripción, y la fijas hacia donde apunta el teléfono.
- **Ficha técnica:** al tocar un cuadro se muestran su título, su descripción y sus coordenadas espaciales (yaw, pitch y distancia).
- **Gestión de la sala:** puedes eliminar obras o reiniciar la sala con las obras de ejemplo.
- **Radar:** un minimapa indica dónde está cada obra a tu alrededor.
- **Persistencia:** las obras y las fotos se conservan al cerrar la app.

## Tecnologías

Expo SDK 58 · React Native 0.88 · TypeScript · React Navigation 7 · React Native Paper · Reanimated · `expo-camera` · `expo-sensors` · `expo-image-picker` · `expo-file-system` · AsyncStorage · Jest

## Cómo ejecutarla

Requisitos: Node.js 24 LTS y la app [Expo Go](https://expo.dev/go) (SDK 58) en el teléfono.

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go. La experiencia AR necesita un teléfono físico, porque los emuladores no tienen sensores de movimiento.

## Uso

1. Entra a **Museo AR** y permite el acceso a la cámara.
2. Sostén el teléfono vertical y gira sobre ti mismo para recorrer la sala.
3. Toca un cuadro para ver su ficha técnica.
4. Pulsa **Añadir obra**, elige o toma una foto, apunta hacia donde quieras colgarla y pulsa **Fijar aquí**.
5. Si las obras se desalinean, apunta al frente y pulsa el botón de **recalibrar** (la mira).

## Arquitectura

Clean Architecture organizada por funcionalidad (*feature-first*), con inyección de dependencias:

```
src/
  core/di/                  # Contenedor de dependencias; appContainer.ts conecta interfaces con implementaciones
  features/ar-museum/
    domain/                 # TypeScript puro: entidades, interfaces y casos de uso
    data/                   # Implementaciones: AsyncStorage, almacenamiento de fotos, sensores
    presentation/           # Pantallas, componentes, hooks y contexto
  navigation/               # Rutas de la app
__tests__/                  # Pruebas unitarias, de pantalla y de flujo
```

- `domain` no depende de React, React Native ni Expo.
- `presentation` solo usa los casos de uso, que obtiene del contenedor con `useDI()`.
- Solo `appContainer.ts` conoce las clases concretas.

## Obras de ejemplo e imágenes propias

- **Desde la app:** usa **Añadir obra** con cualquier foto de la galería o de la cámara.
- **Como obras precargadas:** reemplaza las imágenes de `assets/images/ar-museum/` conservando los nombres de archivo. Los títulos y las posiciones se editan en `src/features/ar-museum/data/datasources/sampleArtworks.ts`. Después pulsa **Reiniciar sala** en la app para cargarlas.

## Scripts

| Comando | Descripción |
|---|---|
| `npx expo start` | Inicia el servidor de desarrollo |
| `npm run lint` | Revisa el código con ESLint |
| `npm run test:ci` | Ejecuta las pruebas una vez |

## Créditos

- Arquitectura basada en la plantilla [rn-uninorte-expo-template](https://github.com/augustosalazar/rn-uninorte-expo-template) del curso de React Native con Expo (Uninorte).
- Obras de ejemplo de dominio público, tomadas de Wikimedia Commons: *La noche estrellada* (Van Gogh), *La gran ola de Kanagawa* (Hokusai) y *La joven de la perla* (Vermeer).
