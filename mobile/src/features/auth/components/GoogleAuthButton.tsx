import { Alert } from 'react-native';
import { useAuthStore } from '../../../lib/store/auth-store';
import { NebulaButton } from '../../../components/ui/NebulaButton';

interface GoogleAuthButtonProps {
  onSuccess: () => void;
}

const hasGoogleConfig = !!(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID && process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

export function GoogleAuthButton({ onSuccess }: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuthStore();

  const handleGoogleLogin = async () => {
    Alert.alert('Google Sign-In Not Configured', 'Please set GOOGLE_CLIENT_ID and GOOGLE_ANDROID_CLIENT_ID in your .env file to enable Google sign-in.');
  };

  return (
    <NebulaButton onPress={handleGoogleLogin} disabled={!hasGoogleConfig} variant="outline">
      Continue with Google
    </NebulaButton>
  );
}

function GoogleAuthButtonInternal({ onSuccess }: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
  });

  const handleGoogleLogin = async () => {
    const result = await promptAsync();
    if (result.type === 'success') {
      try {
        await loginWithGoogle(result.authentication?.idToken || '');
        onSuccess();
      } catch (error) {
        Alert.alert('Google Login Failed', (error as Error).message);
      }
    }
  };

  return (
    <NebulaButton onPress={handleGoogleLogin} disabled={!request} variant="outline">
      Continue with Google
    </NebulaButton>
  );
}

export default hasGoogleConfig ? GoogleAuthButtonInternal : GoogleAuthButton;
