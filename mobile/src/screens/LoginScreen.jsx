import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/api';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      signIn(data);
      navigation.navigate('BookList');
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to MoBooka</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={handleLogin} disabled={loading} />
      <View style={styles.actionRow}>
        <Text>Don&apos;t have an account?</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Sign up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#222' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  actionRow: { marginTop: 24, flexDirection: 'row', justifyContent: 'center' },
  link: { color: '#0a71ff', marginLeft: 8 },
});