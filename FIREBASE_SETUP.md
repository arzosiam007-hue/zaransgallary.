# Firebase Integration Setup Guide

Your Zayans Gallery website has been successfully integrated with Firebase! Here's everything you need to know to get it up and running.

## 🚀 What's Been Added

### Firebase Services Integrated:
- ✅ **Authentication** - User login/register with Firebase Auth
- ✅ **Firestore Database** - NoSQL database for products, orders, users
- ✅ **Storage** - File storage for product images and user avatars
- ✅ **Analytics** - User behavior tracking
- ✅ **Functions** - Serverless functions (ready for use)

### Files Created:
- `lib/firebase.ts` - Firebase configuration and initialization
- `lib/firebase-auth.ts` - Authentication utilities
- `lib/firebase-firestore.ts` - Database operations
- `lib/firebase-storage.ts` - File storage operations
- `lib/seed-data.ts` - Sample data for testing
- `components/test/FirebaseTest.tsx` - Connection testing component
- `components/test/DataSeeder.tsx` - Database seeding component
- `app/test-firebase/page.tsx` - Test page

## 🔧 Setup Instructions

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "skincare" project (or create a new one)
3. Enable the following services:

#### Authentication
- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password** provider
- Optionally enable **Google** sign-in

#### Firestore Database
- Go to **Firestore Database** → **Create database**
- Choose **Start in test mode** (for development)
- Select a location close to your users

#### Storage
- Go to **Storage** → **Get started**
- Choose **Start in test mode** (for development)
- Select the same location as Firestore

### 2. Security Rules Setup

#### Firestore Rules
Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by everyone, writable by admins
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories are readable by everyone, writable by admins
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can manage their own cart and wishlist
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /wishlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read their own orders, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Storage Rules
Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own avatars
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Product images are readable by everyone, writable by admins
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 3. Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the test page: `http://localhost:3000/test-firebase`

3. Click "Test Firebase Connection" to verify everything is working

4. Use the "Seed All Data" button to populate your database with sample products

### 4. Create Admin User

1. Go to your test page and register a new user
2. In Firebase Console, go to **Firestore Database**
3. Find the user document in the `users` collection
4. Edit the document and change `role` from `"customer"` to `"admin"`

## 🎯 Key Features

### Authentication
- User registration and login
- Role-based access control (customer/admin)
- Persistent sessions
- Secure logout

### Database Operations
- Product management
- User profiles
- Shopping cart persistence
- Order tracking
- Wishlist management

### File Storage
- Product image uploads
- User avatar uploads
- Automatic URL generation

## 🔒 Security Features

- Firebase security rules for data protection
- Role-based access control
- Secure authentication tokens
- Protected admin routes

## 📱 Usage Examples

### Adding a Product (Admin only)
```typescript
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const addProduct = async (productData) => {
  await addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}
```

### Getting User's Cart
```typescript
import { getCart } from '@/lib/firebase-firestore'

const cartItems = await getCart(userId)
```

### Uploading Product Image
```typescript
import { uploadProductImage } from '@/lib/firebase-storage'

const imageUrl = await uploadProductImage(file, productId)
```

## 🚨 Important Notes

1. **Environment Variables**: The Firebase config is hardcoded for now. For production, move these to environment variables.

2. **Security Rules**: The test mode rules are permissive. Update them for production.

3. **Error Handling**: All Firebase operations include proper error handling.

4. **Offline Support**: Firestore provides offline support out of the box.

5. **Real-time Updates**: Firestore provides real-time data synchronization.

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**: Check your Firebase config in `lib/firebase.ts`

2. **"Permission denied"**: Check your Firestore security rules

3. **"Network error"**: Ensure your Firebase project is properly configured

4. **"User not found"**: Make sure Authentication is enabled in Firebase Console

### Getting Help:
- Check the browser console for detailed error messages
- Use the test page to diagnose connection issues
- Review Firebase Console logs for server-side errors

## 🎉 You're All Set!

Your Zayans Gallery website now has a complete Firebase backend! You can:
- Register and login users
- Manage products and categories
- Handle orders and payments
- Store user data securely
- Upload and manage images

Happy coding! 🚀
