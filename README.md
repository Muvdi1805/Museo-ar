# Museo AR 360°

Demo de realidad aumentada para Expo Go: obras virtuales flotando a 360° sobre la cámara en vivo, ubicadas con los sensores de movimiento del teléfono. Construida sobre `rn-uninorte-expo-template` (curso de React Native con Expo, Uninorte).

## Stack

- [Expo SDK 58](https://docs.expo.dev/) · React Native 0.88 · React 19.3
- Navegación con [React Navigation 7](https://reactnavigation.org/) (`NavigationContainer`, sin Expo Router)
- UI con [React Native Paper](https://callstack.github.io/react-native-paper/) (Material 3, tema claro/oscuro)
- Persistencia local con AsyncStorage
- Pruebas con Jest (`jest-expo`) y React Native Testing Library

## Requisitos

- **Node.js 24 LTS** (recomendado). Mínimo soportado: 22.13 o 24.3. Con nvm o fnm basta `nvm use` (lee `.nvmrc`).

## Crear un proyecto desde el template

```bash
npx create-expo-app@latest nombre-proyecto --template https://github.com/augustosalazar/rn-uninorte-expo-template
```

Esto descarga el template, renombra el proyecto (`name` y `slug`), instala las dependencias e inicializa un repositorio git.

Después de crearlo, cambie en `app.json` estos valores por unos propios:

- `scheme` (por defecto `myapp`): en minúsculas y sin espacios, por ejemplo `nombreproyecto`. Es el prefijo de los deep links (`nombreproyecto://...`); si dos apps instaladas comparten el mismo scheme, los enlaces pueden abrir la app equivocada.
- `android.package` e `ios.bundleIdentifier` (por defecto `com.example.myapp`): el identificador único de la app, por ejemplo `com.sunombre.nombreproyecto`. Dos apps con el mismo identificador se reemplazan entre sí en el dispositivo, y las tiendas rechazan `com.example`.

## Empezar

```bash
cd nombre-proyecto
npm start
```

Abre la app en [Expo Go](https://expo.dev/go) (escanee el QR o presione `a` / `i` para el emulador o simulador). `npx expo start` hace lo mismo.

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo (Expo Go) |
| `npm run android` / `ios` / `web` | Inicia y abre en la plataforma indicada |
| `npm run lint` | ESLint con la configuración de Expo |
| `npm test` | Jest en modo watch |
| `npm run test:ci` | Jest una sola vez (CI) |

## Estructura

El proyecto sigue una arquitectura limpia por funcionalidad (feature), con inyección de dependencias.

```
App.tsx                      # Providers (DI, features, Paper) + NavigationContainer
index.tsx                    # Punto de entrada (registerRootComponent)
src/
  core/
    di/
      container.ts           # Contenedor de dependencias (singletons por token)
      tokens.ts              # Un token por dependencia
      appContainer.ts        # Raíz de composición: qué implementación usa cada interfaz
      DIProvider.tsx         # Expone el contenedor con useDI()
    iLocalPreferences.ts     # Almacenamiento local (interfaz + implementación AsyncStorage)
  navigation/
    RootNavigator.tsx        # Stack raíz + tabs
    types.ts                 # Tipos de rutas y parámetros (navegación tipada)
  features/
    home/                    # Pantalla de inicio con instrucciones de la demo
    ar-museum/               # Museo AR 360° (todas las capas)
      domain/                # TypeScript puro: sin React, RN ni Expo
        entities/            # Artwork (con SpatialPosition), DeviceOrientation
        repositories/        # IArtworkRepository
        services/            # ISpatialTracker + spatialProjection (matemática de proyección)
        usecases/            # Place / GetGallery / Delete / ResetGallery / ObserveOrientation / Recalibrate
      data/
        datasources/         # AsyncStorage, copia de fotos con expo-file-system, obras de ejemplo
        repositories/        # ArtworkRepositoryImpl
        sensors/             # ExpoSensorsSpatialTracker (DeviceMotion de expo-sensors)
      presentation/
        context/             # ArMuseumProvider / useArMuseum (solo casos de uso)
        hooks/               # Orientación → SharedValues de Reanimated, selector de imágenes
        components/          # Cámara, marcos flotantes, HUD, radar, ficha técnica
        screens/             # ArViewerScreen, PlaceArtworkScreen
  theme/                     # Colores claro/oscuro y temas de Paper
__tests__/                   # Pruebas (unitarias, de pantalla y de flujo)
  helpers/                   # Dobles de prueba compartidos (Jest no los ejecuta como tests)
```

### Museo AR: cómo funciona

- **AR compatible con Expo Go:** la cámara trasera (`expo-camera`) se muestra de fondo y encima flota una capa con los cuadros. `DeviceMotion` (`expo-sensors`) entrega la orientación del teléfono; el adaptador calcula hacia dónde apunta la cámara con la matriz de rotación (evita el *gimbal lock* al sostener el teléfono vertical) y la suaviza con un filtro pasa-bajos.
- **Proyección:** `domain/services/spatialProjection.ts` convierte el ángulo de cada obra (yaw/pitch) en coordenadas de pantalla con un modelo de cámara estenopeica. La misma función corre en el hilo de UI con Reanimated, así los cuadros se mueven a 60 fps sin re-renderizar React.
- **Calibración:** al abrir el visor, hacia donde apunta el teléfono es 0°. El botón de la mira recalibra si las obras se desalinean. Si se mueven más rápido o más lento que el mundo real, ajuste `CAMERA_HORIZONTAL_FOV` en `ArViewerScreen.tsx`.
- **Añadir obras:** «Añadir obra» → elegir foto de la galería o tomarla con la cámara → título y descripción → de vuelta en el visor, apuntar y pulsar «Fijar aquí». La foto se copia al almacenamiento de la app y la galería se guarda en AsyncStorage.

### Usar imágenes propias

- **Desde la app:** cualquier foto de la galería o de la cámara se puede colgar con «Añadir obra». Quedan guardadas entre sesiones.
- **Como obras precargadas:** reemplace los archivos de `assets/images/ar-museum/` conservando los nombres (`starry-night.jpg`, `great-wave.jpg`, `pearl-earring.jpg`). Para cambiar títulos y posiciones, o agregar más obras, edite `src/features/ar-museum/data/datasources/sampleArtworks.ts` y registre cada imagen nueva en `src/features/ar-museum/presentation/assets/sampleArtworkImages.ts`. Luego use «Reiniciar sala» en la app para cargarlas.

Las obras de ejemplo son pinturas de dominio público obtenidas de Wikimedia Commons: *La noche estrellada* (Van Gogh), *La gran ola de Kanagawa* (Hokusai) y *La joven de la perla* (Vermeer).

### Reglas de dependencia

- `presentation` → `domain`: las pantallas usan el contexto, y el contexto usa los **casos de uso**, obtenidos con `useDI()`.
- `data` → `domain`: las implementaciones cumplen las interfaces del dominio.
- `domain` no importa nada de `data`, `presentation`, React ni librerías externas.
- Solo `core/di/appContainer.ts` conoce las clases concretas. Para cambiar el almacenamiento (por ejemplo a un backend remoto) se crea otro data source y se cambia ahí; las pantallas no cambian.

### Agregar una funcionalidad

1. Tome `src/features/ar-museum/` como referencia y defina entidades, interfaces y casos de uso en `domain/`.
2. Implemente data sources y repositorios en `data/`.
3. Agregue sus tokens en `tokens.ts` y regístrelos en `appContainer.ts`.
4. Cree el provider y las pantallas en `presentation/`; agregue el provider en `App.tsx` y las rutas en `navigation/types.ts` y `RootNavigator.tsx`.
5. Para probar pantallas sin almacenamiento real, pase un contenedor con dobles de prueba: `<DIProvider container={...}>` (ver `__tests__/features/ar-museum/ArViewerScreen.test.tsx`).

## Compilar la app nativa

Expo Go basta para el día a día. Para ver el ícono y el splash propios, o para usar librerías nativas fuera del SDK de Expo, compile e instale la app en un emulador o dispositivo:

```bash
npx expo run:android   # o npx expo run:ios
```

Esto requiere Android Studio (o Xcode en macOS) y los identificadores `android.package` / `ios.bundleIdentifier` de `app.json`. Si más adelante necesita las herramientas de un development build (menú de desarrollo, cambiar de servidor), instale `expo-dev-client` con `npx expo install expo-dev-client`.

## Ícono y splash screen

Las imágenes en `assets/images/` son **placeholders** ("RN" sobre el color primario del tema). Reemplácelas conservando nombre y tamaño; no hace falta tocar `app.json`.

| Archivo | Tamaño | Uso |
|---|---|---|
| `icon.png` | 1024×1024, opaco, sin esquinas redondeadas | Ícono iOS y por defecto |
| `android-icon-foreground.png` | 512×512, fondo transparente, logo dentro del 66 % central | Ícono adaptativo Android (capa frontal) |
| `android-icon-background.png` | 512×512 | Ícono adaptativo Android (fondo) |
| `android-icon-monochrome.png` | 432×432, blanco sobre transparente | Ícono temático Android 13+ |
| `splash-icon.png` | 1024×1024, fondo transparente | Logo del splash (se muestra a 200 px de ancho) |
| `favicon.png` | 48×48 | Web |

Los colores de fondo del splash (claro/oscuro) y del ícono adaptativo se definen en `app.json`. El splash permanece visible mientras `App.tsx` termina de cargar (función `prepare`); agregue ahí lo que la primera pantalla necesite.

Los cambios de ícono y splash solo se ven en un build nativo nuevo (`npx expo run:android` / `run:ios`), no en Expo Go.

## Actualizar Expo

```bash
npx expo install expo@^<versión> --fix
npx expo-doctor
```

Después de actualizar, revise la versión de Node que exige React Native (`engines.node` en `node_modules/react-native/package.json`) y ajuste `engines` en `package.json`, `.nvmrc` y la sección de requisitos.
