# 📱 Mobile App - Ukrainian Calendar

React Native застосунок для Android та iOS

## 🎨 Особливості

- ✅ Календар з українськими язичницькими святами
- 🔔 Push-нотифікації про події
- 📆 Додавання подій в Google Calendar
- 📖 Детальна інформація про кожне свято
- 🎨 Світла тема
- 🖼️ Зображення для подій
- ⚙️ Налаштування нотифікацій

## 📋 Вимоги

- Node.js 18+
- React Native CLI
- Android Studio (для Android)
- Xcode (для iOS, тільки на macOS)
- CocoaPods (для iOS)

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
npm install

# Для iOS додатково
cd ios && pod install && cd ..
```

### 2. Налаштування Firebase

1. Створіть проект в [Firebase Console](https://console.firebase.google.com/)
2. Завантажте `google-services.json` (Android) та `GoogleService-Info.plist` (iOS)
3. Помістіть файли:
   - Android: `android/app/google-services.json`
   - iOS: `ios/UkrainianCalendar/GoogleService-Info.plist`

### 3. Налаштування API

Відредагуйте `src/config/api.ts`:

```typescript
export const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

### 4. Запуск

```bash
# Android
npm run android

# iOS
npm run ios

# Metro bundler (в окремому терміналі)
npm start
```

## 📂 Структура проекту

```
mobile/
├── src/
│   ├── screens/          # Екрани застосунку
│   │   ├── HomeScreen.tsx       # Головний екран з календарем
│   │   ├── EventScreen.tsx      # Деталі події
│   │   ├── SettingsScreen.tsx   # Налаштування
│   │   └── AboutScreen.tsx      # Про застосунок
│   ├── components/       # Переиспользуемые компоненти
│   │   ├── Calendar.tsx         # Календар
│   │   ├── EventCard.tsx        # Картка події
│   │   └── NotificationManager.tsx
│   ├── navigation/       # Навігація
│   │   └── AppNavigator.tsx
│   ├── services/         # API та сервіси
│   │   ├── api.ts              # API клієнт
│   │   ├── firebase.ts         # Firebase сервіс
│   │   └── calendar.ts         # Google Calendar
│   ├── utils/            # Допоміжні функції
│   ├── types/            # TypeScript типи
│   └── config/           # Конфігурація
├── android/              # Android нативний код
├── ios/                  # iOS нативний код
├── App.tsx               # Точка входу
└── package.json
```

## 🔔 Push Нотифікації

### Android

Автоматично налаштовуються через Firebase.

### iOS

1. Відкрийте проект в Xcode
2. Увімкніть Push Notifications в Capabilities
3. Завантажте APNs ключ з Apple Developer
4. Додайте ключ в Firebase Console

## 📆 Google Calendar Integration

Користувачі можуть додавати події безпосередньо в свій Google Calendar одним кліком.

## 🎨 Дизайн

- Світла тема (Material Design)
- Адаптивний layout
- Українська локалізація
- Зручна навігація

## 📱 Екрани

1. **Головний екран** - Календар з позначенням свят
2. **Деталі події** - Опис, традиції, підготовка
3. **Налаштування** - Час нотифікацій, синхронізація
4. **Про застосунок** - Інформація та джерела

## 🧪 Тестування

```bash
npm test
```

## 🚢 Build для production

### Android (APK)

```bash
cd android
./gradlew assembleRelease
# APK буде в android/app/build/outputs/apk/release/
```

### iOS (Archive)

```bash
# Відкрити в Xcode
open ios/UkrainianCalendar.xcworkspace
# Product → Archive
```

## 📝 TODO

- [ ] Додати темну тему
- [ ] Додати можливість збереження улюблених свят
- [ ] Додати widget для головного екрана
- [ ] Додати можливість ділитися святами

## 📄 Ліцензія

MIT
