# Campus Marketplace - Complete Feature & Architecture Summary Report

## 📌 Executive Summary
This document provides a comprehensive report of all features, backend architectural components, API routes, database models, frontend components, and styling refactoring implemented in the **Campus Marketplace** project since inception.

---

## 🛠️ 1. Git Branching & Rollback Setup
* **Feature Branch Created:** `feature/author-contact-and-chat` (submitted as `feature/author-contact-and-chat-5663501984624171280`).
* **Documentation File:** `GIT_ROLLBACK_GUIDE.md` added to the repository root detailing step-by-step instructions on:
  * How to inspect and work on the feature branch.
  * How to merge changes into `main`.
  * How to roll back `main` or safely discard feature branch work if needed.

---

## 🗄️ 2. Backend Database Schemas & Models

### **User Model (`backend/src/models/User.js`)**
Extended to support user profiles, saved wishlists, and seller ratings:
* `name`: String (Required)
* `email`: String (Required, Unique)
* `phone`: String (Optional, for SMS/Call meetup contact)
* `password`: String (Hashed via bcrypt)
* `favorites`: Array of ObjectIds referencing `Listing`
* `ratings`: Array of rating objects (`rater`, `rating` [1-5], `review`, `createdAt`)

### **Listing Model (`backend/src/models/Listing.js`)**
Extended for campus items, condition tags, location coordinates, and price offers:
* `title`: String (Required)
* `description`: String (Required)
* `category`: String (`for-sale`, `free`, `lost`, `found`)
* `condition`: String (`Brand New`, `Like New`, `Used - Good`, `Used - Fair`)
* `price`: Number (Required for `for-sale`, in Pakistani Rupees `Rs.`)
* `image`: String (Image URL / Path)
* `status`: String (`active`, `resolved`)
* `postedBy`: ObjectId referencing `User`
* `interestedUsers`: Array of ObjectIds referencing `User`
* `meetupLocation`: Object (`spotName`, `lat`, `lng`)
* `offers`: Array of offer objects (`offeredBy`, `offerPrice`, `status` ['pending', 'accepted', 'declined'], `createdAt`)

### **Message Model (`backend/src/models/Message.js`)**
Stores in-app peer-to-peer chat conversations per listing:
* `listing`: ObjectId referencing `Listing`
* `sender`: ObjectId referencing `User`
* `receiver`: ObjectId referencing `User`
* `text`: String
* `createdAt`: Timestamp

### **Notification Model (`backend/src/models/Notification.js`)**
Stores real-time seller and buyer alerts:
* `user`: ObjectId referencing target `User`
* `type`: String (`interest`, `offer`, `message`, `rating`)
* `message`: String
* `listing`: ObjectId referencing `Listing`
* `read`: Boolean (default `false`)
* `createdAt`: Timestamp

---

## 📡 3. Backend Controllers & API Routes

### **Authentication (`backend/src/controllers/authController.js` & `authRoutes.js`)**
* `POST /api/auth/register` - Registers new student accounts with name, email, phone, and password.
* `POST /api/auth/login` - Authenticates user and returns JWT token + user details.
* `GET /api/auth/me` - Validates session token and returns active user profile.
* `PATCH /api/auth/profile` - Updates phone number and user profile info.

### **Listings (`backend/src/controllers/listingController.js` & `listingRoutes.js`)**
* `GET /api/listings` - Fetches active campus listings with multi-facet filters:
  * `category` (`for-sale`, `free`, `lost`, `found`)
  * `condition` (`Brand New`, `Like New`, `Used - Good`, `Used - Fair`)
  * `search` (Title & description text search)
  * `minPrice` & `maxPrice` (In Pakistani Rupees `Rs.`)
  * `sortBy` (`newest`, `price_asc`, `price_desc`, `most_interested`)
* `POST /api/listings` - Creates listing with image upload and GPS meetup location.
* `GET /api/listings/mine` - Returns user's own created listings with interested buyers list.
* `PATCH /api/listings/:id` - Marks listing as `resolved` / sold.
* `DELETE /api/listings/:id` - Deletes user's listing.
* `POST /api/listings/:id/interest` - Toggles buyer interest count and notifies author.
* `POST /api/listings/:id/offer` - Submits price offer/bargain to listing author.
* `POST /api/listings/:id/respond-offer` - Allows seller to accept/decline buyer offers.

### **Messages & Chat (`backend/src/controllers/messageController.js` & `messageRoutes.js`)**
* `GET /api/messages/:listingId` - Retrieves chat history for a listing between buyer and seller.
* `POST /api/messages/:listingId` - Sends a message and triggers a notification to the receiver.

### **Notifications (`backend/src/controllers/notificationController.js` & `notificationRoutes.js`)**
* `GET /api/notifications` - Fetches user notifications.
* `PATCH /api/notifications/read-all` - Marks all notifications as read.
* `PATCH /api/notifications/:id/read` - Marks single notification as read.

### **Users & Favorites (`backend/src/controllers/userController.js` & `userRoutes.js`)**
* `GET /api/users/favorites` - Fetches bookmarked listings.
* `POST /api/users/favorites` - Toggles saving/removing listing from user's favorites.
* `POST /api/users/:userId/rate` - Submits a 1-5 star review and rating for a seller.

---

## 🎨 4. Frontend Components & Refactored Pages

### **Navigation & Shell (`frontend/src/components/Navbar.jsx` & `App.jsx`)**
* Responsive navigation bar with logo, notification badge counter, login status, and mobile drawer menu.
* Auto-validates JWT tokens on mount to prevent stale sessions.

### **Interactive Modals**
1. **`ContactModal.jsx`**: Displays seller contact info with clickable `tel:` and `mailto:` links, seller star rating, and mapped campus meetup spot.
2. **`ChatModal.jsx`**: Real-time messaging modal with auto-scrolling, offer banner response controls, and polling.
3. **`OfferModal.jsx`**: Form for buyers to submit custom price offers (in `Rs.`).
4. **`NotificationsModal.jsx`**: Notification list with unread markers and click-to-chat navigation.
5. **`RatingModal.jsx`**: Star rating (1-5) and text review submission dialog for sellers.
6. **`CampusMap.jsx`**: Dynamic Leaflet map component with live GPS geolocation detection and selectable campus meetup spots.

### **Pages**
1. **`Home.jsx`**:
   * Compact dark brown hero header (`Buy, Sell & Trade on Campus` with `List an Item` button).
   * Category chip selectors (`All Items`, `For Sale`, `Free Giveaways`, `Lost Items`, `Found Items`).
   * Search input, condition filter, price range filter (`Rs.`), and sort dropdowns.
   * Responsive listing cards with image preview, seller rating, meetup location, interest count, and quick action buttons.
   * Footer with Quick Links, Category Links, and Support Details (`steameraccount2222@gmail.com` and `03127897548`).
2. **`PostItems.jsx`**: Form to post items with image upload, condition selector, price input in `Rs.`, and GPS meetup spot picker.
3. **`MyListings.jsx`**: Dashboard displaying user's posted listings, interested buyers list with email contacts, chat trigger, and mark resolved / delete actions.
4. **`Favorites.jsx`**: Wishlist page displaying saved listings.
5. **`NotFound.jsx`**: Dedicated custom 404 error page.
6. **`Login.jsx` & `Register.jsx`**: Clean authentication forms with validation, phone input, loading indicators, and feedback messages.

---

## 🌍 5. Design & Currency Specifications
* **Theme Colors:** Warm Terracotta (`#C85A32`), Earthy Primary (`#2C221E`), Light Surface (`#FAF7F2`), Warm Border (`#E5DEC9`), Accent Amber (`#E0A96D`).
* **Typography & Icons:** Google Fonts (`Plus Jakarta Sans`) and Material Symbols Outlined icons.
* **Currency Standard:** All prices, filters, and offers use **Pakistani Rupees (`Rs.`)**.

---
*Report generated automatically for Campus Marketplace project.*
