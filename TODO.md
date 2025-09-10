# FX Debit Card Front-End Implementation

## Phase 1: Initial Setup and Landing Page
- [x] Add "FX Debit Card" button next to "Try Demo Checkout" on landing page (src/pages/Index.tsx)
- [x] Create FX Debit Card payment method option in PaymentMethodSelector
- [x] Update payment types to include FX Debit Card

## Phase 2: Mock API Services
- [x] Create EN stack API mock service
- [x] Create CBS integration mock service (for address)
- [x] Create Travel insurance provider API mock service
- [x] Create Payment gateway integration mock service
- [x] Create Mastercard tokenization API mock service
- [x] Create Vendor tracking API mock service
- [x] Create Notification service API mock service

## Phase 3: New Customer Journey
- [x] Create FX Debit Card selection interface component
- [x] Implement multi-card purchase flow UI
- [x] Create summary page (proposition, offers, FAQs, T&Cs)
- [x] Implement address confirmation UI (CBS integration)
- [x] Create T&Cs acceptance workflow
- [x] Build travel insurance add-on UI
  - [x] Nominee details collection
  - [x] PAN card collection/validation
- [x] Implement checkout with MPIN authentication
- [x] Create success screen with confirmation

## Phase 4: Existing Customer Upgrade
- [x] Create upgrade option display component
- [x] Implement price adjustment calculation UI
- [x] Build upgrade confirmation flow
- [x] Create card cancellation workflow
- [ ] Add upgrade communication messaging

## Phase 5: Card Management
- [x] Create card status/digital card display component
- [x] Implement activation/deactivation toggles
- [x] Add domestic vs international controls
- [x] Build use case management (E-com, ATM, POS, Contactless)
  - [x] Transaction limit management
  - [x] PIN set/change functionality
  - [x] Card blocking (temporary/permanent)
- [x] Create confirmation UI (toast/bottom sheet/popup)
- [x] Add use case enablement notifications

## Phase 6: Frameworks and Infrastructure
- [ ] Implement Error Handling Framework
- [ ] Set up RBAC & Authorization Framework
- [ ] Create Security Framework
- [ ] Build Logging & Monitoring Framework

## Phase 7: Testing and Polish
- [ ] Add unit tests for new components
- [ ] Add integration tests for mock APIs
- [ ] Ensure responsive design
- [ ] Add accessibility features
- [ ] Performance optimization
- [ ] Cross-browser testing

## Phase 8: Documentation
- [ ] Update component documentation
- [ ] Create API mock documentation
- [ ] Add user guide for FX Debit Card flows
