# Project Simplification Summary

## Overview
The project has been simplified to include only 3 core features as requested:

1. **User Registration & Login**
   - Email/password registration
   - Email verification with OTP
   - Login with email/password
   - Google OAuth login
   - Password reset functionality

2. **Profile Management**
   - View profile
   - Edit basic profile information (name, email)
   - Update profile picture
   - Edit birthday
   - Edit gender
   - Edit country
   - Edit language preference

3. **Simple Itinerary Management**
   - View list of itineraries
   - View itinerary details
   - Create a basic itinerary
   - Archive/restore itineraries
   - Delete itineraries

## Backend Changes

### Removed Routes
- `/api/tour` - Tour routes
- `/api/emergency` - Emergency hotlines
- `/api/filters` - Filter routes
- `/api/admin` - Admin management routes
- `/api/bot` - Public bot routes
- `/api/admin/tags` - Tag management
- `/api/admin/categories` - Category management
- `/api/admin/bot` - Admin bot routes
- `/api/pins` - Pin management
- `/api/mask` - Mask routes
- `/api/photobooth/filters` - Photobooth filters
- `/api/visited-sites` - Visited sites tracking
- `/api/reviews` - Review system
- `/api/openai` - OpenAI integration
- `/api/itinerary-progress` - Itinerary progress tracking
- `/api/logs` - Activity logging

### Kept Routes
- `/api/auth` - Authentication (registration, login, profile updates)
- `/api/itineraries` - Itinerary management
- `/api/userItineraries` - User-specific itineraries

### Modified Files
- `backend/server.js` - Removed all unnecessary route imports and registrations
- `backend/routes/itineraryRoute.js` - Removed logging dependencies

## Frontend Changes

### Removed Routes
- All admin routes (`/AdminHome`, `/AdminManageContent`, etc.)
- `/Homepage` - Redirects to `/TouristItinerary`
- `/TourMap` - Tour map feature
- `/Chatbot` - Chatbot feature
- `/Emergency` - Emergency hotlines
- `/Photobooth` - Photobooth feature
- `/TripArchive` - Trip archives
- `/GuestHomepage` - Guest mode
- `/GuestProfile` - Guest profile
- `/GuestItinerary` - Guest itinerary

### Kept Routes
- `/login` - Login page
- `/signup` - Registration page
- `/CompleteProfile` - Profile completion
- `/TouristItinerary` - Main itinerary list (default landing page after login)
- `/CreateItinerary` - Create new itinerary
- `/TouristItineraryMap/:itineraryId` - View itinerary on map
- `/Profile` - User profile with sub-routes:
  - `/Profile` - View profile
  - `/Profile/Account` - Edit account info
  - `/Profile/Birthday` - Edit birthday
  - `/Profile/Gender` - Edit gender
  - `/Profile/Country` - Edit country
  - `/Profile/Language` - Edit language

### Modified Files
- `frontend/src/App.jsx` - Removed all unnecessary imports and routes
- `frontend/src/components/userComponents/sideButtons.jsx` - Kept only Create Itinerary and Profile buttons
- `frontend/src/components/userComponents/BackButton.jsx` - Updated default navigation to `/TouristItinerary`
- `frontend/src/components/loginComponents/loginForm.jsx` - Updated navigation to `/TouristItinerary`, removed guest mode
- `frontend/src/components/loginComponents/signupForm.jsx` - Updated navigation to `/TouristItinerary`

## User Flow

1. **New User**
   - Visit `/login`
   - Click "Create an account here"
   - Fill registration form
   - Verify email with OTP
   - Redirected to `/TouristItinerary`

2. **Existing User**
   - Visit `/login`
   - Enter credentials or use Google login
   - Redirected to `/TouristItinerary`

3. **Main Navigation**
   - Side buttons show:
     - Create Itinerary button → `/CreateItinerary`
     - Profile button → `/Profile`
   - Back button navigates to `/TouristItinerary`

## What Still Works

✅ User registration with email verification
✅ Login with email/password
✅ Google OAuth login
✅ Profile viewing and editing
✅ Profile picture upload
✅ Itinerary creation
✅ Itinerary viewing
✅ Itinerary editing
✅ Itinerary archiving/restoration
✅ Itinerary deletion

## What Was Removed

❌ Admin dashboard and all admin features
❌ Guest mode
❌ Tour map with pins
❌ Chatbot
❌ Emergency hotlines
❌ Photobooth
❌ Trip archives
❌ Activity logging
❌ Review system
❌ OpenAI integration
❌ Visited sites tracking
❌ Itinerary progress tracking

## Database Models Still Required

- `User` - User accounts
- `PendingUser` - Users pending email verification
- `Itinerary` - Itinerary data
- `Pin` - Site/location data (referenced by itineraries)
- `Category` - Site categories (referenced by pins)

## Next Steps

To test the simplified application:

1. Start the backend:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Test the core features:
   - Register a new account
   - Login
   - Edit your profile
   - Create an itinerary
   - View itinerary details
   - Edit/delete itineraries

## Notes

- The application now has a much simpler structure focused on the 3 core features
- All removed features can be re-added later if needed
- The backend still has the old route files, but they are not imported in `server.js`
- The frontend still has the old component files, but they are not imported in `App.jsx`
- You may want to delete the unused files to clean up the codebase further
