import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { useAuth } from '../context/AuthContext';
import { authorizedRequest, initiateOfflineSale } from '../api/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DashboardScreen({ navigation }) {
  const { user, token, signOut } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }

    const loadHistory = async () => {
      setLoading(true);
      try {
        const state = await Network.getNetworkStateAsync();
        const isOffline = !state.isConnected || !state.isInternetReachable;
        setOffline(isOffline);
        const queued = JSON.parse(await AsyncStorage.getItem('mobooka_offline_queue') || '[]');
        setQueueCount(queued.length);

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

  const handleExportHistory = async () => {
    if (history.length === 0) {
      Alert.alert('No data', 'There are no transactions to export.');
      return;
    }

    const header = ['Receipt', 'Book', 'Amount', 'Status', 'Provider', 'Purchased At'];
    const csvRows = [header.join(',')];
    history.forEach((item) => {
      const row = [
        item.receiptNumber || '',
        item.book?.title || '',
        item.amount.toFixed(2),
        item.status,
        item.provider,
        item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
      ];
      csvRows.push(row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
    });

    try {
      const fileUri = `${FileSystem.documentDirectory}mobooka-transactions-${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvRows.join('\n'), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Export unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share MoBooka transaction export',
      });
    } catch (err) {
      Alert.alert('Export failed', err.message);
    }
  };

  const handleSyncQueue = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      if (!state.isConnected || !state.isInternetReachable) {
        Alert.alert('Still offline', 'Please connect to the internet before syncing queued purchases.');
        return;
      }

      const queue = JSON.parse(await AsyncStorage.getItem('mobooka_offline_queue') || '[]');
      if (queue.length === 0) {
        Alert.alert('Nothing to sync', 'There are no queued offline purchases.');
        return;
      }

      for (const item of queue) {
        await initiateOfflineSale({ bookId: item.bookId, phone: item.phone, provider: item.provider, branchCode: item.branchCode }, token);
      }
      await AsyncStorage.removeItem('mobooka_offline_queue');
      setQueueCount(0);
      Alert.alert('Sync complete', `Synced ${queue.length} offline purchase(s).`);
      const data = await authorizedRequest('/transactions/me', token);
      setHistory(data.history || []);
    } catch (err) {
      Alert.alert('Sync failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your dashboard</Text>
      <Text style={styles.subtitle}>{user ? `Welcome, ${user.name}` : 'Loading user...'}</Text>
      {offline && <Text style={styles.offlineInfo}>Offline mode is active. Queued purchases: {queueCount}</Text>}
      {!offline && queueCount > 0 && (
        <Button title={`Sync ${queueCount} queued purchase(s)`} onPress={handleSyncQueue} />
      )}
      <Button title="Export transaction history" onPress={handleExportHistory} />
      {loading && <ActivityIndicator size="large" color="#0a71ff" style={{ marginTop: 24 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bookTitle}>{item.book.title}</Text>
              <Text>Receipt: {item.receiptNumber || 'Pending'}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Amount: UGX {item.amount.toFixed(2)}</Text>
              <Text>Purchased: {new Date(item.createdAt).toLocaleString()}</Text>
              {item.status === 'success' && (
                <Button
                  title="View receipt"
                  onPress={() => navigation.navigate('Receipt', { transactionId: item._id })}
                />
              )}
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
  offlineInfo: { marginBottom: 12, color: '#1167b1' },
  card: { backgroundColor: '#f4f7ff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#dfe5f5' },
  bookTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  empty: { marginTop: 24, textAlign: 'center', color: '#666' },
  error: { color: '#d32f2f', marginBottom: 16 },
});