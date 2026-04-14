import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { useAuth } from '../context/AuthContext';
import { fetchBookById, initiatePurchase, initiateOfflineSale, verifyPurchase } from '../api/api';

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params || {};
  const { user, token } = useAuth();
  const [book, setBook] = useState(null);
  const [provider, setProvider] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      try {
        const data = await fetchBookById(bookId);
        setBook(data);
        const state = await Network.getNetworkStateAsync();
        setOffline(!(state.isConnected && state.isInternetReachable));
      } catch (err) {
        Alert.alert('Fetch error', err.message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [bookId]);

  const handleBuy = async () => {
    if (!user || !token) {
      navigation.navigate('Login');
      return;
    }
    if (!phone) {
      Alert.alert('Validation', 'Please enter your phone number.');
      return;
    }

    if (offline) {
      const queued = JSON.parse(await AsyncStorage.getItem('mobooka_offline_queue') || '[]');
      queued.push({ bookId, phone, provider, createdAt: new Date().toISOString() });
      await AsyncStorage.setItem('mobooka_offline_queue', JSON.stringify(queued));
      Alert.alert('Queued offline', 'Your purchase request was saved locally and will sync when you are back online.');
      setPurchaseMessage('Offline purchase queued.');
      return;
    }

    setPurchaseMessage('Initiating payment...');
    try {
      const initiateResult = await initiatePurchase({ bookId, provider, phone }, token);
      setPurchaseMessage('Payment initiated, verifying...');
      const verifyResult = await verifyPurchase({ reference: initiateResult.reference }, token);
      setTransaction(verifyResult.transaction || null);
      if (verifyResult.transaction?.status === 'success') {
        setPurchaseMessage('Purchase successful! You can now download the book.');
        if (verifyResult.transaction.downloadToken) {
          setDownloadLink(verifyResult.transaction.downloadToken);
        }
      } else {
        setPurchaseMessage('Purchase pending or failed. Please check again later.');
      }
    } catch (err) {
      Alert.alert('Purchase error', err.message);
      setPurchaseMessage('');
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

      const results = [];
      for (const item of queue) {
        const response = await initiateOfflineSale({ bookId: item.bookId, phone: item.phone, branchCode: item.branchCode }, token);
        results.push(response.transaction || response);
      }
      await AsyncStorage.removeItem('mobooka_offline_queue');
      Alert.alert('Sync complete', `Synced ${results.length} offline purchase(s).`);
    } catch (err) {
      Alert.alert('Sync failed', err.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0a71ff" />
      </View>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.meta}>By {book.authors?.join(', ') || 'Unknown author'}</Text>
      <Text style={styles.price}>{book.price > 0 ? `UGX ${book.price.toFixed(2)}` : 'Free'}</Text>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{book.description || 'No description available.'}</Text>
      {book.price > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Buy with Mobile Money</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <View style={styles.providerRow}>
            <Button title={provider === 'mtn' ? 'MTN selected' : 'Select MTN'} onPress={() => setProvider('mtn')} />
            <Button title={provider === 'airtel' ? 'Airtel selected' : 'Select Airtel'} onPress={() => setProvider('airtel')} />
          </View>
          <Button title={offline ? 'Queue offline purchase' : 'Purchase book'} onPress={handleBuy} />
          {offline && (
            <View style={{ marginTop: 12 }}>
              <Button title="Sync queued purchases" onPress={handleSyncQueue} />
            </View>
          )}
          {purchaseMessage ? <Text style={styles.message}>{purchaseMessage}</Text> : null}
          {transaction?.receiptNumber ? <Text style={styles.receiptInfo}>Receipt: {transaction.receiptNumber}</Text> : null}
          {transaction?.status ? <Text style={styles.receiptInfo}>Status: {transaction.status}</Text> : null}
          {transaction?.status === 'success' ? (
            <View style={styles.receiptButton}>
              <Button
                title="View receipt"
                onPress={() => navigation.navigate('Receipt', { transactionId: transaction._id })}
              />
            </View>
          ) : null}
        </>
      ) : (
        <Text style={styles.freeText}>This book is free. Download it from the web store once logged in.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  meta: { color: '#555', marginBottom: 12 },
  price: { fontSize: 20, color: '#0a71ff', fontWeight: '600', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  description: { fontSize: 14, color: '#333', lineHeight: 22 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  providerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  message: { marginTop: 16, color: '#333' },
  receiptInfo: { marginTop: 10, color: '#333', fontWeight: '600' },
  receiptButton: { marginTop: 16 },
  freeText: { marginTop: 20, color: '#555', fontStyle: 'italic' },
});