import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Card, Title, Paragraph, Text, useTheme, Divider, IconButton } from 'react-native-paper';
import { RootState, AppDispatch } from '../redux/store';
import { logout, loadUser } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ route, navigation }: HomeScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { user: reduxUser, isLoading } = useSelector((state: RootState) => state.auth);
  // Fallback to route params if redux hasn't hydrated yet (though AppNavigator handles loadUser)
  const user = reduxUser || route.params?.user;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadUser());
    setRefreshing(false);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f0f2f5' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Title style={styles.nameText}>{user?.name || 'User'}</Title>
            </View>
            <Avatar.Text
              size={56}
              label={getInitials(user?.name)}
              style={{ backgroundColor: theme.colors.secondary || '#ff9800' }}
              color="white"
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Account Info Card */}
          <Card style={styles.card}>
            <Card.Title
              title="My Account"
              subtitle="Personal Details"
              left={(props) => <Avatar.Icon {...props} icon="account-circle" />}
            />
            <Divider />
            <Card.Content style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>User ID:</Text>
                <Text style={styles.value}>#{user?.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Role:</Text>
                <Text style={[styles.value, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {user?.role || 'User'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status:</Text>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>Active • Verified</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Application Features / Quick Actions */}
          <Card style={[styles.card, { marginTop: 16 }]}>
            <Card.Title title="Dashboard" />
            <Card.Content style={styles.grid}>
              <TouchableOpacityAction
                icon="calendar"
                label="Schedule"
                color="#4caf50"
              />
              <TouchableOpacityAction
                icon="file-document"
                label="Reports"
                color="#2196f3"
              />
              <TouchableOpacityAction
                icon="bell"
                label="Alerts"
                color="#ff9800"
              />
              <TouchableOpacityAction
                icon="cog"
                label="Settings"
                color="#607d8b"
              />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
            buttonColor={theme.colors.error}
          >
            Log Out
          </Button>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for grid items
const TouchableOpacityAction = ({ icon, label, color }: { icon: string, label: string, color: string }) => (
  <View style={styles.actionItem}>
    <IconButton
      icon={icon}
      iconColor="white"
      size={24}
      style={{ backgroundColor: color }}
      onPress={() => { }}
    />
    <Text style={styles.actionLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  nameText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -30, // Pull up to overlap header
  },
  card: {
    borderRadius: 15,
    elevation: 3,
    backgroundColor: 'white',
  },
  cardContent: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  label: {
    color: '#666',
    fontSize: 15,
  },
  value: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 6,
    borderRadius: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '25%', // 4 items per row
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: -4,
  },
  versionText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
    fontSize: 12,
  }
});
