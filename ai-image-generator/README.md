# Studişo - AI Image Generator

Modern, güçlü kullanıcı yönetimi sistemi ile donatılmış AI görsel üretici mobil uygulama.

## ✨ Özellikler

### 🎨 AI Görsel Üretimi
- **Text to Image**: Metin açıklamalarından görsel üretimi
- **Image to Image**: Mevcut görselleri dönüştürme
- Replicate API entegrasyonu ile güçlü AI modelleri
- Template kategorileri: Magical, Fantasy, Classic, Destinations

### 👤 Güçlü Kullanıcı Yönetimi
- **3 Aşamalı Kurtarma Sistemi**:
  1. SecureStore persistent UUID (uygulama silme/yükleme sonrası kalıcı)
  2. Hardware fingerprinting ile cihaz tanıma
  3. Firebase Anonymous Authentication
- Çoklu cihaz desteği
- Otomatik veri senkronizasyonu

### 💎 Kredi Sistemi
- Gerçek zamanlı kredi senkronizasyonu
- Collision-safe işlemler
- Transaction history
- Emergency recovery sistemi

### 🎯 Modern UI/UX
- iOS-style modern tasarım
- Siyah-gri gradyan tema
- Responsive design
- Smooth animasyonlar (react-native-reanimated v3)
- Bottom tab navigation (Discover, Creations)

### ⚙️ Ayarlar
- Dil seçimi (Türkçe/İngilizce)
- Rate Us
- Privacy Policy
- Support
- Restore Purchase

## 🏗️ Teknoloji Stack

### Frontend (React Native + Expo)
- **Framework**: Expo Router v5 (file-based routing)
- **State Management**: Zustand
- **UI**: Custom design system (Typography, Colors, Spacing, Shadows)
- **Navigation**: @react-navigation/bottom-tabs
- **Animations**: react-native-reanimated v3
- **Storage**: expo-secure-store
- **Device Info**: react-native-device-info
- **Responsive**: react-native-responsive-screen

### Backend (Firebase)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Anonymous Auth
- **Functions**: Cloud Functions (TypeScript)
- **API Integration**: Replicate API (güvenli key yönetimi)

### Güvenlik
- Hardware fingerprinting
- Secure local storage
- Multi-layer user recovery
- Rate limiting
- Input validation

## 📱 Ekranlar

### Ana Ekranlar
- **Discover**: Ana sayfa, model seçimi, template kategorileri
- **Creations**: Kullanıcı oluşturduğu görseller, grid/list view
- **Settings**: Kullanıcı ayarları ve hesap yönetimi

### Navigasyon
- Tab-based navigation
- Modal screens (generation, settings)
- Smooth transitions

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Expo CLI
- Firebase CLI
- iOS/Android development environment

### 1. Proje Kurulumu
\`\`\`bash
# Repository'yi klonla
git clone [repo-url]
cd ai-image-generator

# Dependencies'leri yükle
npm install

# iOS için (macOS'ta)
npx pod-install ios
\`\`\`

### 2. Firebase Kurulumu
\`\`\`bash
# Firebase CLI yükle
npm install -g firebase-tools

# Firebase'e login ol
firebase login

# Firebase projesini initialize et
firebase init

# Functions dependencies yükle
cd firebase/functions
npm install
cd ../..
\`\`\`

### 3. Environment Variables
Firebase Functions için environment variables:
\`\`\`bash
# Replicate API key
firebase functions:config:set replicate.api_key="your-replicate-api-key"
\`\`\`

### 4. Firebase Deploy
\`\`\`bash
# Functions deploy
firebase deploy --only functions

# Firestore rules ve indexes
firebase deploy --only firestore
\`\`\`

### 5. App Başlatma
\`\`\`bash
# Development server başlat
npm start

# iOS/Android'de çalıştır
npm run ios
npm run android
\`\`\`

## 🏗️ Proje Yapısı

\`\`\`
ai-image-generator/
├── app/                          # Expo Router screens
│   ├── (tabs)/                  # Tab navigation
│   │   ├── discover.tsx         # Ana sayfa
│   │   └── creations.tsx        # Creations listesi
│   ├── settings/                # Settings screens
│   ├── onboarding/             # Onboarding flow
│   └── generation/             # Image generation
├── src/
│   ├── components/
│   │   └── common/             # Reusable UI components
│   ├── constants/              # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── shadows.ts
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic
│   │   ├── UserManagementService.ts
│   │   ├── FirebaseService.ts
│   │   ├── SecureStorageService.ts
│   │   └── DeviceFingerprintService.ts
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript definitions
├── firebase/
│   ├── functions/              # Cloud Functions
│   ├── firestore.rules        # Security rules
│   └── firestore.indexes.json # Database indexes
└── assets/                     # Static assets
\`\`\`

## 🔒 Güvenlik Özellikleri

### Kullanıcı Kurtarma Sistemi
1. **Persistent ID**: SecureStore'da kalıcı UUID
2. **Device Fingerprint**: Hardware bilgileri kombinasyonu
3. **Firebase UID**: Anonymous authentication

### Veri Koruması
- End-to-end user data encryption
- Secure API key management
- Rate limiting ve abuse protection

## 🎯 Gelecek Özellikler

### Yakında Gelecek
- [ ] Onboarding akışı (3 aşama)
- [ ] Image generation flow
- [ ] Template detay sayfaları
- [ ] Advanced generation settings
- [ ] Favorite/bookmark sistemi

### Uzun Vadeli
- [ ] Premium subscription
- [ ] Advanced AI models
- [ ] Social sharing
- [ ] Community features
- [ ] Custom model training

## 📄 Lisans

Bu proje özel bir lisans altındadır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

Proje şu anda aktif geliştirme aşamasındadır. Katkıda bulunmak için:

1. Issue açın
2. Feature request gönderin
3. Pull request oluşturun

## 📞 İletişim

- **Email**: support@studiso.app
- **Website**: https://studiso.app

---

**Made with ❤️ for AI enthusiasts**
