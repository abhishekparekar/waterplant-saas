import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { orderService } from '@/services/orderService';
import { Loader } from '@/components/common/Loader';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Order } from '@/types/order';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      orderService.getById(id)
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Order not found.</Text>
      </View>
    );
  }

  const getStatusColor = () => {
    switch (order.status) {
      case 'delivered':
        return Colors.success;
      case 'cancelled':
        return Colors.danger;
      case 'assigned':
        return Colors.secondary;
      default:
        return Colors.warning;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Invoice & Run Slip</Text>
          <View style={[styles.badge, { backgroundColor: `${getStatusColor()}15` }]}>
            <Text style={[styles.badgeText, { color: getStatusColor() }]}>
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Order Reference: <Text style={{ color: colors.text, fontWeight: '600' }}>#{order.id.substring(0, 8).toUpperCase()}</Text>
        </Text>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Placed on: <Text style={{ color: colors.text, fontWeight: '600' }}>{formatDate(order.createdAt)}</Text>
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Customer Box */}
        <Text style={styles.sectionLabel}>Customer Details</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{order.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{order.deliveryAddress}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Items Listing */}
        <Text style={styles.sectionLabel}>Items ordered</Text>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.itemName} <Text style={{ fontWeight: '400', fontSize: 13, color: colors.textSecondary }}>x {item.quantity}</Text>
            </Text>
            <Text style={[styles.itemPrice, { color: colors.text }]}>
              {formatCurrency(item.totalPrice)}
            </Text>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Assigned logistics helper */}
        <Text style={styles.sectionLabel}>Logistics Assignment</Text>
        <View style={styles.infoRow}>
          <Ionicons name="bicycle-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {order.assignedHelperName || 'Unassigned / Self-delivery'}
          </Text>
        </View>

        {order.notes && (
          <View style={styles.notesBox}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Driver Notes:</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{order.notes}</Text>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.footerRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total Invoice Value:</Text>
          <Text style={[styles.totalPriceText, { color: colors.text }]}>
            {formatCurrency(order.totalAmount)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.primary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalPriceText: {
    fontSize: 22,
    fontWeight: '800',
  },
});
