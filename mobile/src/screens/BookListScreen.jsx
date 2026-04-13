import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchBooks } from '../api/api';

export default function BookListScreen({ navigation }) {
  const { user, token, signOut } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.books || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookDetail', { bookId: item._id })}>
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookMeta}>By {item.authors?.join(', ') || 'Unknown author'}</Text>
      <Text style={styles.bookPrice}>{item.price > 0 ? `UGX ${item.price.toFixed(2)}` : 'Free'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Available books</Text>
        <View style={styles.headerActions}>
          {user ? (
            <Button title="Dashboard" onPress={() => navigation.navigate('Dashboard')} />
          ) : (
            <Button title="Login" onPress={() => navigation.navigate('Login')} />
          )}
        </View>
      </View>
      {loading && <ActivityIndicator size="large" color="#0a71ff" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No books available yet.</Text>}
        />
      )}
      {user && <Button title="Logout" onPress={signOut} color="#ff4d4d" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row' },
  list: { paddingBottom: 16 },
  card: { backgroundColor: '#f8faff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e8eef6' },
  bookTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  bookMeta: { fontSize: 14, color: '#555', marginBottom: 4 },
  bookPrice: { fontSize: 16, color: '#0a71ff', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#666' },
  errorText: { color: '#d32f2f', textAlign: 'center', marginTop: 20 },
});