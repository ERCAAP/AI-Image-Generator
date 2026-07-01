import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../../src/constants';
import { useUserManagement } from '../../../src/hooks/useUserManagement';
import { FirebaseService } from '../../../src/services/FirebaseService';

export default function ProfileScreen() {
  const { currentUser, logout, isLoading } = useUserManagement();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authState, setAuthState] = useState<string>('checking');

  useEffect(() => {
    // Check Firebase auth state
    const unsubscribe = FirebaseService.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setAuthState(user ? 'authenticated' : 'anonymous');
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Başarılı', 'Hesabınızdan çıkış yapıldı.');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleResetAccount = async () => {
    Alert.alert(
      'Hesabı Sıfırla',
      'Bu işlem mevcut hesabınızı siler ve yeni bir hesap oluşturur. Bu işlem geri alınamaz!',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Force reload to create new account
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            } catch (error) {
              Alert.alert('Hata', 'Hesap sıfırlanırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const getAuthStatusColor = () => {
    switch (authState) {
      case 'authenticated':
        return Colors.accent.green;
      case 'anonymous':
        return Colors.accent.orange;
      default:
        return Colors.text.secondary;
    }
  };

  const getAuthStatusText = () => {
    switch (authState) {
      case 'authenticated':
        return 'Kimlik Doğrulandı';
      case 'anonymous':
        return 'Anonim Kullanıcı';
      default:
        return 'Kontrol Ediliyor...';
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background.primary, Colors.background.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.subtitle}>Hesap bilgileri ve ayarlar</Text>
          </View>

          {/* User Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={24} color={Colors.accent.blue} />
              <Text style={styles.cardTitle}>Kullanıcı Bilgileri</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kullanıcı ID:</Text>
              <Text style={styles.infoValue}>{currentUser?.id || 'Yükleniyor...'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Firebase UID:</Text>
              <Text style={styles.infoValue}>
                {firebaseUser?.uid || currentUser?.firebaseUID || 'Yok'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>
                {firebaseUser?.email || 'Anonim kullanıcı'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kredi:</Text>
              <Text style={[styles.infoValue, { color: Colors.accent.green }]}>
                {currentUser?.credits || 0}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durum:</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getAuthStatusColor() }]} />
                <Text style={[styles.infoValue, { color: getAuthStatusColor() }]}>
                  {getAuthStatusText()}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={24} color={Colors.accent.purple} />
              <Text style={styles.cardTitle}>Hesap İşlemleri</Text>
            </View>
            
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? Colors.accent.blue + '20' : 'transparent' }
              ]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="cog" size={20} color={Colors.accent.blue} />
              <Text style={styles.actionText}>Ayarlar</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? Colors.accent.orange + '20' : 'transparent' }
              ]}
              onPress={handleResetAccount}
            >
              <Ionicons name="refresh" size={20} color={Colors.accent.orange} />
              <Text style={styles.actionText}>Hesabı Sıfırla</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? Colors.accent.red + '20' : 'transparent' }
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color={Colors.accent.red} />
              <Text style={[styles.actionText, { color: Colors.accent.red }]}>Çıkış Yap</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
            </Pressable>
          </View>

          {/* Debug Info */}
          {__DEV__ && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="bug" size={24} color={Colors.accent.yellow} />
                <Text style={styles.cardTitle}>Debug Bilgileri</Text>
              </View>
              
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  Auth State: {authState}
                </Text>
                <Text style={styles.debugText}>
                  Loading: {isLoading ? 'true' : 'false'}
                </Text>
                <Text style={styles.debugText}>
                  Firebase User: {firebaseUser ? 'Var' : 'Yok'}
                </Text>
                <Text style={styles.debugText}>
                  Current User: {currentUser ? 'Var' : 'Yok'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  infoLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    ...Typography.body2,
    color: Colors.text.primary,
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
    marginVertical: Spacing.xs,
  },
  actionText: {
    ...Typography.body1,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  debugInfo: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: 8,
  },
  debugText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: Spacing.xs,
  },
});