# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RoundCut is a Russian steel cutting and pricing management system with a React frontend and NestJS backend. The application manages steel pricing, warehouse inventory, cutting operations, and markup calculations for steel products.

## Architecture

### Frontend (React + TypeScript)
- **Build tool**: Vite with React + TypeScript
- **State management**: Redux Toolkit with RTK Query for API calls
- **Styling**: SCSS with some Tailwind CSS, custom fonts (OpenSans, IBM Plex Mono)
- **UI components**: Material-UI, Headless UI, MDB React UI Kit
- **Key features**: Steel grade filtering, diameter selection, price calculations, warehouse management

### Backend (NestJS + TypeScript)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js (local and JWT strategies)
- **Key modules**: Users, Price Items, Warehouses, Markups, Cuts, Categories, CSV import

## Development Commands

### Frontend (from /frontend directory)
```bash
npm run dev          # Start development server
npm run build        # Build for production (tsc + vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (from /backend directory)
```bash
npm run start:dev    # Start development server with watch mode
npm run start        # Start production server
npm run build        # Build the application
npm run lint         # Run ESLint with fixes
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage
```

## Key Domain Concepts

### Core Entities
- **PriceItem**: Steel product with pricing tiers (per 1tn, 5tn, 15tn), dimensions, weight
- **Warehouse**: Storage locations with associated markups
- **Cut**: Cutting operations for steel products
- **Markup**: Pricing markup levels (level1-level8) per warehouse
- **Category**: Product categorization system

### Data Flow
1. CSV price data import through `/csv` endpoint
2. Price items filtered by steel grade and diameter
3. Markup calculations applied based on warehouse and quantity
4. Cut items generated for specific lengths and weights

## File Structure Patterns

### Frontend
- `src/components/` - React components organized by feature
- `src/features/` - Redux slices and state management
- `src/services/` - RTK Query API definitions
- `src/utils/` - Utility functions and type definitions
- `src/pages/` - Route components

### Backend
- `src/[module]/` - NestJS modules with controllers, services, entities, DTOs
- `src/auth/` - Authentication guards and strategies
- `src/utils/` - Shared utilities and types

## Database Configuration

Uses PostgreSQL with environment variables:
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `POSTGRES_DB`, `POSTGRES_SCHEMA`

## Authentication

- JWT-based authentication with Passport.js
- Local strategy for username/password login
- JWT strategy for protected routes
- Email-based user identification

## Testing

- Backend uses Jest for unit and e2e tests
- Frontend uses Vite's built-in testing capabilities
- Test files follow `*.spec.ts` convention

## Important Notes

- The application is primarily in Russian language
- Steel products use metric measurements (mm, kg, tonnes)
- Price calculations support quantity-based discounts
- Warehouse selection affects markup calculations
- CSV import functionality for bulk price updates