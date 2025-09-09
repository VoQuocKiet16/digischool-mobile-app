# DIGISchool - Mobile School Management Application

<div align="center">
  <img src="./assets/images/app-digi-icon.png" alt="DIGISchool Logo" width="120" height="120">
  
  <h3>Comprehensive school management system for students, teachers, and administrators</h3>
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-53.0.17-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)
</div>

## 📱 Overview

DIGISchool is a mobile application developed with React Native and Expo, providing a comprehensive school management solution. The application supports multiple user roles including students, teachers, and school administrators with specialized features for each user type.

## ✨ Key Features

### 🎓 For Students
- **View Schedule**: Track weekly class schedules
- **Lesson Information**: Details about subjects and content
- **Lesson Evaluation**: View learning results and assessments
- **Leave Requests**: Submit leave requests by period or day
- **Messaging**: Communicate with teachers and classmates
- **News**: Stay updated with school information
- **Notes**: Store personal notes

### 👨‍🏫 For Teachers
- **Schedule Management**: View and manage teaching schedules
- **Lesson Information**: Details about teaching periods
- **Student Evaluation**: Attendance, grading, violation records
- **Change Requests**: Leave requests, period swaps, makeup classes
- **Class Management**: Monitor students in class
- **Messaging**: Communicate with students and colleagues
- **News**: Post and manage subject-related news

### 🏫 For Administrators
- **School Management**: Overview of school activities
- **Account Management**: Manage student and teacher accounts
- **Progress Management**: Track learning progress
- **Attendance Management**: Monitor attendance status
- **Schedule Management**: Organize and manage class schedules
- **Feedback Management**: Handle user feedback
- **Statistics**: Detailed reports and analytics

### 🔧 Common Features
- **Multi-role Authentication**: Support for multiple user roles
- **Real-time Messaging**: Direct chat with Socket.IO
- **Push Notifications**: Instant notifications via Firebase
- **File Management**: Upload and share documents
- **Responsive UI**: Optimized for various screen sizes
- **Dark/Light Mode**: Support for light/dark themes

## 🛠 Technology Stack

### Frontend
- **React Native 0.79.5**: Mobile application development framework
- **Expo 53.0.17**: Development and deployment platform
- **TypeScript 5.8.3**: Primary programming language
- **Expo Router 5.1.3**: File-based routing system
- **NativeWind 4.1.23**: Styling with Tailwind CSS
- **React Navigation 7.x**: In-app navigation

### State Management & Data
- **Zustand 4.5.7**: Global state management
- **AsyncStorage**: Local data storage
- **Axios 1.10.0**: HTTP client for API calls
- **Socket.IO Client 4.8.1**: Real-time communication

### UI/UX Libraries
- **React Native Paper 5.14.5**: Material Design components
- **React Native Vector Icons 10.2.0**: Icon library
- **FontAwesome 6.7.2**: Icon set
- **React Native Reanimated 3.17.4**: Animations
- **React Native Modal 14.0.0**: Modal components
- **React Native Toast Message 2.3.3**: Toast notifications

### Media & Files
- **Expo Image Picker 16.1.4**: Select images from device
- **Expo Document Picker 13.1.6**: Select documents
- **Expo File System 18.1.11**: File system management
- **Expo Print 14.1.4**: Document printing
- **React Native WebView 13.13.5**: Web content display

### Firebase & Notifications
- **React Native Firebase 23.0.0**: Firebase integration
- **Firebase Messaging**: Push notifications
- **Expo Notifications**: Local notifications

### Development Tools
- **ESLint 9.25.0**: Code linting
- **Babel**: JavaScript transpiler
- **Metro**: React Native bundler

## 📁 Project Structure

```
Digital-School-Mobile-School/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with navigation
│   ├── index.tsx                # Home page
│   ├── auth/                    # Authentication
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── set-password.tsx
│   ├── students/                # Student features
│   │   ├── schedule/
│   │   ├── lesson_information/
│   │   └── leave_request/
│   ├── teachers/                # Teacher features
│   │   ├── schedule/
│   │   ├── lesson_information/
│   │   ├── lesson_request/
│   │   └── test_information/
│   ├── manage/                  # Management features
│   │   ├── absence.tsx
│   │   ├── attended.tsx
│   │   └── list_activity.tsx
│   ├── message/                 # Messaging
│   ├── news/                    # News
│   ├── notification/            # Notifications
│   ├── note/                    # Notes
│   └── setting/                 # Settings
├── components/                   # Reusable components
│   ├── AnimatedTabBar.tsx       # Tab bar with animation
│   ├── Header.tsx               # Header component
│   ├── LoadingModal.tsx         # Loading modal
│   ├── ToastNotification.tsx    # Toast notification
│   ├── schedule/                # Schedule components
│   ├── lesson_detail/           # Lesson detail components
│   ├── lesson_evaluate/         # Lesson evaluation components
│   └── manage/                  # Management components
├── contexts/                     # React Context providers
│   ├── UserContext.tsx          # User data context
│   ├── SessionContext.tsx       # Session management
│   ├── NotificationContext.tsx  # Notification context
│   └── ChatContext.tsx          # Chat context
├── services/                     # API services
│   ├── api.config.ts            # API configuration
│   ├── auth.service.ts          # Authentication service
│   ├── schedule.service.ts      # Schedule service
│   ├── chat.service.ts          # Chat service
│   ├── news.service.ts          # News service
│   ├── notification.service.ts  # Notification service
│   └── ...                      # Other services
├── hooks/                        # Custom React hooks
│   ├── useSessionCheck.ts       # Session validation
│   ├── useUserData.ts           # User data management
│   └── useFirebaseMessaging.ts  # Firebase messaging
├── types/                        # TypeScript type definitions
│   ├── user.types.ts            # User types
│   ├── lesson.types.ts          # Lesson types
│   └── schedule.types.ts        # Schedule types
├── utils/                        # Utility functions
│   ├── responsive.ts            # Responsive utilities
│   ├── storage-utils.ts         # Storage utilities
│   └── lessonSubtitle.ts        # Lesson subtitle utilities
├── constants/                    # App constants
│   ├── api.constants.ts         # API endpoints
│   └── Colors.ts                # Color constants
├── assets/                       # Static assets
│   ├── images/                  # Images
│   └── fonts/                   # Custom fonts
└── android/                      # Android specific files
    └── app/                     # Android app configuration
```

## 🚀 Installation and Setup

### System Requirements
- Node.js >= 18.0.0
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd Digital-School-Mobile-School
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install Expo CLI (if not already installed)**
```bash
npm install -g @expo/cli
```

### Running the Application

1. **Start development server**
```bash
npm start
# or
expo start
```

2. **Run on device**
   - **Android**: `npm run android` or `expo run:android`
   - **iOS**: `npm run ios` or `expo run:ios`
   - **Web**: `npm run web` or `expo start --web`

3. **Using Expo Go**
   - Install Expo Go on your phone
   - Scan QR code from terminal
   - App will load on device

### API Configuration

1. **Update API endpoint**
```typescript
// services/api.config.ts
export const baseURL = "https://your-api-domain.com";
```

2. **Configure Firebase** (if using)
   - Add `google-services.json` to `android/app/`
   - Configure Firebase project in `app.json`

## 🔧 Environment Configuration

### Environment Variables
Create `.env` file in root directory:
```env
API_BASE_URL=https://your-api-domain.com
FIREBASE_PROJECT_ID=your-firebase-project-id
SOCKET_URL=https://your-socket-server.com
```

### Android Configuration
- Update `android/app/build.gradle` if needed
- Add permissions in `android/app/src/main/AndroidManifest.xml`

### iOS Configuration
- Update `ios/DigiSchool/Info.plist` if needed
- Add permissions for camera, storage, etc.

## 📱 Build and Deploy

### Development Build
```bash
# Android
expo build:android

# iOS
expo build:ios
```

### Production Build
```bash
# Using EAS Build
eas build --platform android
eas build --platform ios
```

### App Store Deployment
```bash
# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🧪 Testing

### Run tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type checking
```bash
npx tsc --noEmit
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `GET /api/auth/me` - Get user information

### Schedule Endpoints
- `GET /api/schedules/class/{className}/{academicYear}/{weekNumber}` - Student schedule
- `GET /api/schedules/teacher/{teacherId}/{academicYear}/{weekNumber}` - Teacher schedule
- `GET /api/schedules/lesson/{lessonId}` - Lesson details
- `PATCH /api/schedules/lesson/{lessonId}/complete` - Complete lesson

### Chat Endpoints
- `GET /api/chat/conversations` - Conversation list
- `GET /api/chat/messages/{userId}` - Messages with user
- `POST /api/chat/message` - Send message
- `POST /api/chat/upload` - Upload file

### News Endpoints
- `GET /api/news/all` - All news
- `GET /api/news/by-subject` - News by subject
- `POST /api/news/create` - Create news
- `PATCH /api/news/update/{id}` - Update news
- `DELETE /api/news/delete/{id}` - Delete news

## 🔒 Security

- **JWT Authentication**: Using JWT tokens for authentication
- **Session Management**: Automatic session management
- **API Security**: Interceptors for request/response
- **Data Encryption**: Encrypting sensitive data
- **Role-based Access**: Role-based permissions

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
```bash
npx expo start --clear
```

2. **Android build issues**
```bash
cd android && ./gradlew clean
```

3. **iOS build issues**
```bash
cd ios && pod install
```

4. **Dependencies conflicts**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Debug mode
```bash
# Enable debug mode
expo start --dev-client
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is private property. Distribution or use without permission is prohibited.

## 📞 Contact

- **Developer**: GDevX Team
- **Email**: vok89265@gmail.com
- **Website**: https://www.digischool.site

## 🙏 Acknowledgments

- React Native community
- Expo team
- All contributors and testers

---

<div align="center">
  <p>Developed with ❤️ by GDevX Team</p>
  <p>© 2024 DIGISchool. All rights reserved.</p>
</div>
