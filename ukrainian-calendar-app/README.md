# 📅 Український Календар Язичницьких Свят

Мобільний застосунок для Android та iOS з українськими язичницькими святами.

## ✨ Особливості

- 📱 Кросплатформний (Android + iOS)
- 🔔 Push-нотифікації про свята
- 📆 Інтеграція з Google Calendar
- 📖 Детальна інформація про кожне свято
- 🎨 Світла тема
- 🖼️ Зображення для подій
- 🔧 Адмін-панель для керування контентом

## 🏗️ Архітектура

```
ukrainian-calendar-app/
├── backend/          # Node.js + Express API
├── mobile/           # React Native app
├── admin/            # Admin panel (React)
├── database/         # PostgreSQL схеми та міграції
└── README.md
```

## 🛠️ Tech Stack

- **Frontend (Mobile)**: React Native
- **Frontend (Admin)**: React + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Push Notifications**: Firebase Cloud Messaging
- **Calendar Integration**: Google Calendar API
- **Image Storage**: AWS S3 / Local storage

## 🚀 Швидкий старт

### Вимоги
- Node.js 18+
- PostgreSQL 14+
- React Native CLI
- Android Studio / Xcode

### Backend
```bash
cd backend
npm install
npm run migrate
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npx react-native run-android  # або run-ios
```

### Admin Panel
```bash
cd admin
npm install
npm start
```

## 📊 База даних

PostgreSQL з таблицями:
- `events` - календарні події
- `event_images` - зображення подій
- `notifications` - історія нотифікацій
- `user_preferences` - налаштування користувачів

## 🔐 Безпека

- CORS налаштований
- Rate limiting
- Input validation
- SQL injection protection

## 📝 Ліцензія

MIT
