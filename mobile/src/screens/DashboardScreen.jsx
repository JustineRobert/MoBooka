import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authorizedRequest } from '../api/api';

export default function DashboardScreen({ navigation }) {
  const { user, token, signOut } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await authorizedRequest('/transactions/me', token);
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your dashboard</Text>
      <Text style={styles.subtitle}>{user ? `Welcome, ${user.name}` : 'Loading user...'}</Text>
      {loading && <ActivityIndicator size="large" color="#0a71ff" style={{ marginTop: 24 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bookTitle}>{item.book.title}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Amount: UGX {item.amount.toFixed(2)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No purchase history yet.</Text>}
        />
      )}
      <Button title="Logout" onPress={() => { signOut(); navigation.navigate('BookList'); }} color="#ff4d4d" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16, color: '#555' },
  card: { backgroundColor: '#f4f7ff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#dfe5f5' },
  bookTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  empty: { marginTop: 24, textAlign: 'center', color: '#666' },
  error: { color: '#d32f2f', marginBottom: 16 },
});