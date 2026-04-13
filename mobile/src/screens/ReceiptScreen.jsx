import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchTransaction } from '../api/api';

export default function ReceiptScreen({ route, navigation }) {
  const { transactionId } = route.params || {};
  const { token } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!token || !transactionId) return;
      setLoading(true);
      try {
        const data = await fetchTransaction(transactionId, token);
        setReceipt(data.transaction);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReceipt();
  }, [token, transactionId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0a71ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Receipt not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Receipt</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Transaction details</Text>
        <Text>Receipt #: {receipt.receiptNumber || 'N/A'}</Text>
        <Text>Reference: {receipt.reference}</Text>
        <Text>Status: {receipt.status}</Text>
        <Text>Provider: {receipt.provider}</Text>
        <Text>Amount: UGX {receipt.amount.toFixed(2)}</Text>
        <Text>Commission: UGX {receipt.commission.toFixed(2)}</Text>
        <Text>Paid at: {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : 'Pending'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Book</Text>
        <Text>Title: {receipt.book?.title}</Text>
        <Text>Category: {receipt.book?.category}</Text>
        <Text>Price: UGX {receipt.book?.price?.toFixed(2) || '0.00'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Buyer</Text>
        <Text>Name: {receipt.buyer?.name}</Text>
        <Text>Email: {receipt.buyer?.email}</Text>
        <Text>Phone: {receipt.buyer?.phone || 'Not provided'}</Text>
      </View>

      <Button title="Back to dashboard" onPress={() => navigation.navigate('Dashboard')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  card: { backgroundColor: '#f4f7ff', padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#dfe5f5' },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  error: { color: '#d32f2f', fontSize: 16 },
  empty: { color: '#666', fontSize: 16 },
});
