import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import "react-native-gesture-handler/jestSetup";

console.log("✅ Jest setup file loaded successfully");

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("react-native-gesture-handler", () =>
  jest.requireActual("react-native-gesture-handler"),
);

// Reanimated runs animations on a UI-thread worklet runtime that Jest does not have. Its official mock
// (react-native-reanimated/mock) still boots the native module under jest-expo's native resolution
// (Reanimated 4.7 / SDK 58), so we mock the small API surface the app uses. Styles are computed once
// per render, which is all the screen tests need.
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Animated = { View, createAnimatedComponent: (component: unknown) => component };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: <T,>(initial: T) => React.useRef({ value: initial }).current,
    useAnimatedStyle: (updater: () => object) => updater(),
  };
});

// --- AR museum: native modules replaced by inert fakes (no camera, sensors or file system in Jest) ---

jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    CameraView: (props: object) => React.createElement(View, props),
    useCameraPermissions: () => [
      { granted: true, canAskAgain: true, status: "granted", expires: "never" },
      jest.fn(),
      jest.fn(),
    ],
  };
});

jest.mock("expo-sensors", () => ({
  DeviceMotion: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: null })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: null })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

jest.mock("expo-file-system", () => {
  class MockDirectory {
    uri: string;
    exists = true;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === "string" ? p : p.uri)).join("/");
    }
    create() {}
  }
  class MockFile extends MockDirectory {
    copy = jest.fn(() => Promise.resolve());
    delete = jest.fn();
  }
  return { Directory: MockDirectory, File: MockFile, Paths: { document: { uri: "file:///document" } } };
});
