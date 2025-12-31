# Celtis POS UI

A frontend-only Point of Sale interface built with Vue.js, focusing on user flow, UX clarity, and product thinking.

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build for Production

```bash
# Type-check and build
npm run build

# Preview production build
npm run preview
```

## 📋 Features

### Core Screens

- **Sell**: Active sale interface with product search, cart management, and payment processing
- **Parked Sales**: View and manage draft sales that can be resumed later
- **History**: Browse completed sales with detailed receipt views

### Key Functionality

- **Product Search**: Real-time filtering with keyboard navigation (arrow keys)
- **Cart Management**: Add products, adjust quantities, remove items
- **Product Modifiers**: Support for add-ons/modifiers (e.g., coffee extras)
- **Draft Sales**: Park active sales and resume them later
- **Payment Processing**: Cash and card payment methods
- **Sales History**: View past transactions with detailed receipts
- **Internationalization**: English and Arabic support with RTL layout
- **Persistence**: All data saved to localStorage (survives page refresh)

### UX 

- **Keyboard Navigation**: Arrow keys for product selection, Enter to add, Esc to reset
- **Toast Notifications**: Feedback for actions (park, resume, pay)
- **Custom Confirmations**: Styled modal dialogs instead of browser alerts
- **Unsaved Changes Guard**: Warns when navigating away from active sale
- **Responsive Design**: Works on desktop and tablet sizes

## 🛠️ Tech Stack

- **Vue 3** (Composition API with `<script setup>`)
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for build tooling

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Card, Badge, Kbd)
│   ├── AddonsModal.vue # Product modifier selection
│   ├── ConfirmationModal.vue # Custom confirmation dialogs
│   └── ToastHost.vue   # Toast notification container
├── views/              # Main screen components
│   ├── SellView.vue    # Active sale interface
│   ├── ParkedView.vue  # Draft sales management
│   └── HistoryView.vue # Sales history
├── stores/              # Pinia stores
│   ├── pos.ts          # Main POS state and business logic
│   ├── confirmation.ts # Confirmation dialog state
│   └── toast.ts        # Toast notification state
├── pos/                 # POS domain logic
│   ├── types.ts        # TypeScript type definitions
│   ├── catalog.ts      # Mock product catalog
│   ├── money.ts        # Money formatting utilities
│   └── storage.ts      # localStorage persistence
└── i18n/               # Internationalization
    ├── index.ts        # i18n setup and locale management
    ├── messages.ts     # Translation strings
    └── useI18n.ts      # i18n composable
```

## 💭 Approach & Decisions

### Product Thinking

- **Sale States**: Clear separation between Draft (active/parked) and Paid (history) states
- **Data Model**: Simple but complete type system for Sales, Products, LineItems, and Payments
- **Ergonomics**: Keyboard shortcuts and navigation optimized for cashier speed
- **Resilience**: Handles page refresh, accidental navigation, and interrupted flows via localStorage

### UI/UX Decisions

- **Visual Hierarchy**: Gradient headers, card-based layouts, and clear typography for readability
- **Color Coding**: Indigo for Sell, Amber for Parked, Emerald for History
- **Calm Interface**: Subtle shadows, rounded corners, and smooth transitions
- **Information Density**: Balanced spacing and sizing for all-day use
- **Feedback**: Toast notifications and custom modals for clear user feedback

### Technical Decisions

- **Vue 3 Composition API**: Modern, type-friendly, and easier to reason about
- **Pinia over Vuex**: Simpler API, better TypeScript support, no mutations needed
- **TypeScript**: Type safety for data models and store logic
- **Tailwind CSS**: Rapid styling with utility classes, consistent design system
- **localStorage**: Simple persistence without backend complexity bcouse its only a frontend demo

### Internationalization

- **Bilingual Support**: English and Arabic with full RTL support
- **Locale Persistence**: User's language preference saved to localStorage
- **RTL Layout**: Automatic direction switching for Arabic interface



## 🔑 Keyboard Shortcuts

- **`/`**: Focus search input
- **Arrow Up/Down**: Navigate product list
- **Enter**: Add first matching product (when search is focused)
- **Esc**: Clear search and return focus

## 📦 Data Persistence

All data is stored in browser localStorage under the key `celtis_pos_state`:

- Active sale (current draft)
- Parked/draft sales
- Sales history (last 50)
- User's language preference

Data persists across page refreshes and browser sessions.


## 📄 License

This is a demonstration project for the Celtis Australis frontend engineer position.
