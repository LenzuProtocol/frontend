# Lenzu Protocol - Frontend

A modern decentralized finance platform built with Next.js 15, enabling autonomous liquidity management on Somnia blockchain. The application features comprehensive Web3 integration, real-time price data, testnet faucets, and seamless interaction with AI-powered autonomous agents.

## 🌟 Features

### Core Functionality
- **Autonomous Liquidity Management**: AI-powered agents manage DeFi positions automatically
- **Real-time Price Oracle**: Live price feeds from CoinGecko integrated with backend services
- **Testnet Faucet**: Mint USDC and WETH tokens for Somnia testnet development
- **Wallet Integration**: Seamless connection with multiple wallets via RainbowKit and wagmi
- **Smart Contract Interaction**: Direct integration with Lenzu Protocol contracts on Somnia blockchain
- **Portfolio Dashboard**: Real-time portfolio tracking and performance analytics

### User Interface
- **Responsive Design**: Optimized for desktop and mobile devices using Tailwind CSS v4
- **Dark/Light Mode**: Theme switching with system preference detection
- **Real-time Updates**: Live balance updates and price refreshes with optimized caching
- **Interactive Components**: Modern UI built with Radix UI primitives and custom components
- **Smooth Animations**: Enhanced UX with Framer Motion animations

### Additional Features
- **Agent Integration**: Connect with autonomous agents for automated portfolio management
- **Price Display Components**: Reusable components showing real-time token prices
- **Transaction Management**: Comprehensive transaction handling with gas optimization
- **Performance Analytics**: Detailed statistics and portfolio performance tracking
- **Error Handling**: Robust error recovery and user feedback systems

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router and server-side rendering
- **React 19**: Latest React version with enhanced concurrent features
- **TypeScript**: Full type safety throughout the application

### Web3 Integration
- **wagmi 2.17.5**: React hooks for Ethereum interactions
- **RainbowKit 2.2.8**: Wallet connection interface
- **viem 2.38.0**: TypeScript library for Ethereum interactions
- **Smart Contracts**: Lenzu Protocol contracts on Somnia testnet

### UI/UX
- **Tailwind CSS 4.1.14**: Next-generation utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Modern icon library
- **Sonner**: Toast notifications

### State Management & Data
- **TanStack Query 5.90.2**: Server state management and caching
- **Zustand 5.0.8**: Client-side state management
- **React Hook Form 7.64.0**: Form handling with validation
- **Zod 4.1.12**: Schema validation

### Development Tools
- **ESLint 9.37.0**: Code linting and formatting
- **Prettier 3.6.2**: Code formatting
- **TypeScript 5.9.3**: Static type checking
- **pnpm 10.18.1**: Fast package manager

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- pnpm package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Wallet Connect
   NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
   
   # API Endpoints
   BACKEND_URL=http://localhost:8001
   AGENT_URL=http://localhost:8000
   
   # Environment
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── prices/        # Price data endpoints
│   │   └── yields/        # Yield calculation endpoints
│   ├── dashboard/         # Portfolio dashboard
│   │   └── page.tsx      # Main dashboard page
│   ├── faucet/           # Testnet token faucet
│   │   ├── _components/   # Faucet-specific components
│   │   │   └── faucet.tsx # Main faucet component
│   │   └── page.tsx      # Faucet page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── layout/           # Layout components
│   │   └── navbar.tsx    # Navigation bar
│   ├── providers/        # Context providers
│   │   └── Web3Provider.tsx # Web3 wallet provider
│   ├── price-display.tsx # Price display components
│   └── wallet/           # Wallet connection components
├── hooks/                 # Custom React hooks
│   ├── query/            # Data fetching hooks
│   │   └── use-usdc-balance.ts
│   ├── use-lenzu.ts      # Lenzu protocol hooks
│   └── use-prices.ts     # Price data hooks
├── lib/                   # Utility functions and configurations
│   ├── abis/             # Smart contract ABIs
│   │   ├── agent-manager.abi.ts
│   │   └── erc20.abi.ts
│   ├── helper/           # Utility functions
│   │   └── number.ts     # Number formatting utilities
│   ├── addresses.ts      # Contract addresses
│   ├── api-client.ts     # API client configuration
│   ├── utils.ts          # General utilities
│   └── wagmi.ts          # Web3 configuration
├── services/             # API services
│   ├── lenzu-api.ts      # Lenzu backend API
│   └── price-api.ts      # Price oracle API
├── data/                 # Static data
│   └── network.data.ts   # Network configurations
├── config/               # Application configuration
│   └── site.ts           # Site metadata
├── public/               # Static assets
│   └── images/           # Image assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Key Components

### Dashboard Page
- Real-time portfolio overview
- Balance tracking for USDC and WETH
- Performance analytics integration
- Agent management interface

### Faucet Page
- **Fixed Amount Minting**: 10,000 USDC and 10 WETH per claim
- **Cooldown Management**: 1-hour cooldown between claims
- **Real-time Pricing**: Shows USD value of tokens being claimed
- **Balance Display**: Current wallet balances with refresh indicators
- **Transaction Handling**: Proper Web3 transaction flow with confirmations

### Price Display Components
- Real-time price updates from CoinGecko
- Fallback pricing for offline scenarios
- Loading states with smooth transitions
- Formatted price display with change indicators

### Wallet Integration
- Multi-wallet support via RainbowKit
- Somnia testnet configuration
- Transaction status tracking
- Balance monitoring with auto-refresh

## 🌐 Smart Contract Integration

The application integrates with Lenzu Protocol contracts deployed on Somnia testnet:

### Contract Addresses (Somnia Testnet)
- **WETH**: `0x578b2807ea81C429505F1be4743Aec422758A461`
- **USDC**: `0xEf2F49a4fC829B3cB1d80b0f9FDc0fb0D149e7B0`
- **Tokos Lending**: `0xBACBf125969023F26415A8b914d05f421B423009`
- **Agent Manager**: `0x63FAb7efA8cda0adc2C78776488cC77279184E83`

### Smart Contract Features
- **ERC20 Tokens**: Mock USDC and WETH with faucet functionality
- **Faucet Integration**: Direct contract calls for token minting
- **Balance Queries**: Real-time balance fetching
- **Transaction Management**: Proper gas estimation and error handling

## 📊 API Integration

### Price Oracle API
- **Real-time Prices**: Fetches current token prices from backend
- **Historical Data**: Price history for charting and analytics
- **Caching Strategy**: Optimized data fetching with react-query
- **Error Handling**: Fallback mechanisms for price data

### Lenzu Backend API
- **User Management**: User registration and configuration
- **Agent Operations**: Start/stop autonomous agents
- **Statistics**: Portfolio performance and analytics
- **Transaction History**: Complete transaction audit trail

## 🎨 Development Scripts

- `pnpm dev`: Start development server with Turbopack
- `pnpm build`: Create production build
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint with auto-fix
- `pnpm build:netlify`: Build for Netlify deployment

## 🌐 Network Support

### Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://testnet.somnia.network
- **Explorer**: https://explorer.somnia.network
- **Faucet**: Built-in testnet token faucet

### Wallet Configuration
Automatically configures supported wallets for Somnia testnet including:
- MetaMask
- WalletConnect compatible wallets
- Rainbow Wallet
- Coinbase Wallet

## ⚡ Performance Optimizations

### React Query Configuration
- **Reduced Retries**: Minimized retry attempts for faster error handling
- **Smart Caching**: Optimized cache times for different data types
- **Background Updates**: Intelligent background data refetching
- **Loading States**: Smooth loading transitions without flickering

### Bundle Optimization
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Eliminate unused code from bundles
- **Image Optimization**: Next.js automatic image optimization
- **CSS Optimization**: Tailwind CSS purging and minification

### User Experience
- **Skeleton Loading**: Immediate visual feedback
- **Optimistic Updates**: UI updates before transaction confirmation
- **Error Boundaries**: Graceful error handling
- **Loading Indicators**: Subtle progress indicators

## 🔒 Security Features

- **Environment Variables**: Secure API key management
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Built-in Next.js security features
- **Input Validation**: Zod schema validation throughout
- **Secure Cookies**: Proper cookie handling for authentication

## 🧪 Testing & Quality

### Code Quality
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Full type coverage
- **Import Sorting**: Organized imports

### Performance Monitoring
- **Web Vitals**: Core Web Vitals tracking
- **Bundle Analysis**: Bundle size monitoring
- **Lighthouse**: Performance auditing

## 🚀 Deployment

### Netlify Configuration
```bash
# Build command
pnpm build:netlify

# Output directory
.next
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_WC_PROJECT_ID=production_wallet_connect_id
BACKEND_URL=https://api.lenzu.fun
AGENT_URL=https://agent.lenzu.fun
NEXT_PUBLIC_APP_URL=https://lenzu.fun
NODE_ENV=production
```

## 🔧 Troubleshooting

### Common Issues

**"Failed to connect wallet"**
- Ensure Somnia testnet is added to your wallet
- Check that the correct network is selected

**"Price data not loading"**
- Verify backend/agent services are running
- Check network connectivity to price APIs

**"Faucet transaction failed"**
- Ensure sufficient ETH for gas fees
- Check if cooldown period has passed
- Verify contract addresses are correct

**"Balance not updating after faucet claim"**
- Wait for transaction confirmation (1-2 blocks)
- Check if balance refresh has triggered
- Manually refresh the page if needed

### Development Issues

**"Module not found"**
- Run `pnpm install` to ensure all dependencies are installed
- Clear Next.js cache: `rm -rf .next`

**"Type errors"**
- Ensure TypeScript version compatibility
- Check import paths and type definitions

## 📚 API Documentation

### Price API Endpoints
- `GET /api/prices/{symbol}` - Get current token price
- `GET /api/prices` - Get all current prices
- `POST /api/prices/calculate-portfolio` - Calculate portfolio value

### Authentication API
- `POST /api/auth/connect` - Connect wallet
- `GET /api/auth/status` - Get connection status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style and patterns
4. Add proper TypeScript types
5. Test thoroughly before submitting
6. Submit a pull request with detailed description

## 📄 License

MIT License - Built for the Somnia blockchain ecosystem.
