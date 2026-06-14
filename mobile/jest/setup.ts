/**
 * Pre-framework setup: mocks that must run before Jest globals are available.
 * Placed in jest/ (not __tests__/) so Jest doesn't treat it as a test suite.
 */
jest.mock('expo-constants', () => ({
  default: { manifest: { extra: {} } },
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  useAuthRequest: jest.fn(() => [null, null, null]),
  ResponseType: { Code: 'code' },
  makeRedirectUri: jest.fn(() => 'mock-redirect-uri'),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
  useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 0, height: 0 })),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = {
    default: {
      createAnimatedComponent: (c) => c,
      Value: jest.fn(),
      event: jest.fn(),
      block: jest.fn(),
      cond: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      clockRunning: jest.fn(),
      timing: jest.fn(),
      spring: jest.fn(),
    },
  };
  return Reanimated;
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = React.forwardRef((props, ref) =>
    React.createElement('Text', { testID: props.testID, ref, ...props }, props.name || '')
  );
  MockIcon.displayName = 'Ionicons';
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
    Entypo: MockIcon,
    AntDesign: MockIcon,
  };
});

// ═══════════════════════════════════════════════════════════════════════════
// Try running WITHOUT any react-native mocks beyond what the preset provides.
// The RN jest preset (via jest-expo) mocks View, Text, TextInput, Image,
// Modal, ScrollView, ActivityIndicator. We let it handle everything and
// see what breaks.
// ═══════════════════════════════════════════════════════════════════════════
