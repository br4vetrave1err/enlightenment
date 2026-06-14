import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { GoogleAuthButton } from '../../features/auth/components/GoogleAuthButton';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Begin your space exploration journey</Text>

      <RegisterForm onSuccess={() => router.replace('/(tabs)')} />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleAuthButton onSuccess={() => router.replace('/(tabs)')} />

      <Text style={styles.footer}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.push('/login')}>
          Sign in
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A1A2E',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666666',
  },
  footer: {
    marginTop: 24,
    color: '#666666',
  },
  link: {
    color: '#00D4FF',
    fontWeight: '600',
  },
});
