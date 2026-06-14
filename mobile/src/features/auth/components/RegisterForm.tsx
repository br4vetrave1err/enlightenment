import { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { z } from 'zod';
import { useAuthStore } from '../../../lib/store/auth-store';
import { NebulaButton } from '../../../components/ui/NebulaButton';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuthStore();

  const handleSubmit = async () => {
    const result = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, value]) => {
        if (value?.[0]) formattedErrors[key] = value[0];
      });
      setErrors(formattedErrors);
      return;
    }
    setErrors({});
    try {
      await register(name, email, password);
      onSuccess();
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Name"
        placeholderTextColor="#666666"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email"
        placeholderTextColor="#666666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Password"
        placeholderTextColor="#666666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={[styles.input, errors.confirmPassword && styles.inputError]}
        placeholder="Confirm Password"
        placeholderTextColor="#666666"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

      <NebulaButton onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Create Account'}
      </NebulaButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 8,
  },
});
