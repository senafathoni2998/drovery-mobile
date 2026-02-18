import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface Delivery {
  id: string;
  title: string;
  eta: string;
  status: string;
  progress: number;
  statusColor: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const activeDeliveries: Delivery[] = [
    {
      id: '11324572',
      title: 'Hamburger & Fries',
      eta: 'ETA 11:00 AM',
      status: 'In Progress',
      progress: 0.65,
      statusColor: '#00C2A8',
    },
    {
      id: '11324578',
      title: 'Protein Shakes',
      eta: 'ETA Today',
      status: 'Picked up',
      progress: 0.4,
      statusColor: '#4FC3F7',
    },
  ];

  const QuickActionButton = ({
    icon,
    iconFamily,
    title,
    color,
    onPress,
  }: {
    icon: string;
    iconFamily: 'MaterialIcons' | 'FontAwesome5';
    title: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        {iconFamily === 'MaterialIcons' ? (
          <MaterialIcons name={icon as any} size={28} color="#fff" />
        ) : (
          <FontAwesome5 name={icon as any} size={24} color="#fff" />
        )}
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => (
    <TouchableOpacity style={styles.deliveryCard}>
      <View style={styles.deliveryCardHeader}>
        <View style={styles.deliveryIconContainer}>
          <MaterialIcons name="local-shipping" size={24} color="#00C2A8" />
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>{delivery.title}</Text>
          <Text style={styles.deliverySubtitle}>
            id: {delivery.id} • {delivery.eta}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#999" />
      </View>
      <View style={styles.deliveryStatusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: delivery.statusColor }]}>
          <Text style={styles.statusText}>{delivery.status}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${delivery.progress * 100}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <MaterialIcons name="local-shipping" size={24} color="#00C2A8" />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingPrefix}>Good day,</Text>
              <Text style={styles.greetingName}>Sena</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialIcons name="notifications-none" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Location Bar */}
          <TouchableOpacity style={styles.locationBar}>
            <MaterialIcons name="location-on" size={18} color="#666" />
            <Text style={styles.locationText}>Set location • Jakarta</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={20} color="#fff" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deliveries, IDs, addresses"
            placeholderTextColor="rgba(255, 255, 255, 0.8)"
          />
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            icon="add"
            iconFamily="MaterialIcons"
            title="New Delivery"
            color="#00C2A8"
            onPress={() => {}}
          />
          <QuickActionButton
            icon="qrcode"
            iconFamily="MaterialIcons"
            title="Scan QR"
            color="#5E6EF2"
            onPress={() => {}}
          />
          <QuickActionButton
            icon="truck"
            iconFamily="FontAwesome5"
            title="Track Package"
            color="#4CAF50"
            onPress={() => {}}
          />
          <QuickActionButton
            icon="dollar-sign"
            iconFamily="FontAwesome5"
            title="Price Estimate"
            color="#FF9800"
            onPress={() => {}}
          />
        </View>

        {/* Active Deliveries Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active deliveries</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {activeDeliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </View>

        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoIconContainer}>
            <MaterialIcons name="card-giftcard" size={32} color="#FF9800" />
          </View>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Free delivery for your next order</Text>
            <Text style={styles.promoSubtitle}>Use code FLYFAST • valid today only</Text>
          </View>
          <TouchableOpacity style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingContainer: {
    flex: 1,
    marginLeft: 12,
  },
  greetingPrefix: {
    fontSize: 14,
    color: '#666',
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  notificationButton: {
    padding: 4,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C2A8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  quickActionButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00C2A8',
    textDecorationLine: 'underline',
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
 borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  deliverySubtitle: {
    fontSize: 13,
    color: '#666',
  },
  deliveryStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00C2A8',
    borderRadius: 3,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  promoIconContainer: {
    marginRight: 12,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  claimButton: {
    backgroundColor: '#00C2A8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
