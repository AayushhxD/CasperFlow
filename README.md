<div align="center">

# 🌊 CasperFlow

### All-in-One DeFi Platform on Casper Blockchain

[![Live Demo](https://img.shields.io/badge/🌐_Live-casperflow.vercel.app-blue? style=for-the-badge)](https://casperflow.vercel.app/)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next. js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Casper](https://img.shields.io/badge/Casper-FF0000?style=for-the-badge&logo=casper&logoColor=white)](https://casper.network/)

*Stake, Trade, and Earn - All in One Place* 🚀

[✨ Features](#-features) •
[🎯 Quick Start](#-quick-start) •
[📦 Smart Contract](#-smart-contract) •
[🛠️ Tech Stack](#%EF%B8%8F-tech-stack) •
[📚 Documentation](#-documentation)

</div>

---

## 🌟 Overview

**CasperFlow** is a comprehensive DeFi platform built on the Casper blockchain, combining multiple financial primitives into a single, unified smart contract. Experience seamless token management, staking rewards, leveraged trading, and secure vault deposits - all with enterprise-grade security and efficiency.

### ✨ Features

<table>
<tr>
<td width="50%">

#### 🪙 **ERC20 Token**
- Full-featured token implementation
- Transfer, approve, and allowance operations
- Optimized for gas efficiency
- Standard compliant interface

</td>
<td width="50%">

#### 💎 **Staking System**
- Lock tokens to earn rewards
- Flexible stake/unstake mechanism
- Real-time balance tracking
- Compound interest support

</td>
</tr>
<tr>
<td width="50%">

#### 📈 **Leveraged Trading**
- Open positions with leverage
- Risk-managed trading system
- Position tracking and management
- Automated liquidation protection

</td>
<td width="50%">

#### 🔒 **Secure Vault**
- Safe deposit and withdrawal
- Yield generation
- Multi-signature support
- Emergency withdrawal mechanism

</td>
</tr>
</table>

---

## 🎯 Quick Start

### Prerequisites

```bash
Node.js 18+ | npm/yarn/pnpm | Rust 1.70+ | Casper CLI
```

### 🖥️ Frontend Setup

```bash
# Clone the repository
git clone https://github.com/AayushhxD/CasperFlow.git
cd CasperFlow

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
```

🌐 Open [http://localhost:3000](http://localhost:3000) and start exploring!

### ⛓️ Smart Contract Setup

```bash
# Navigate to contract directory
cd contracts/casperflow

# Make build script executable
chmod +x build.sh

# Build the contract
./build.sh
```

**Output:** `wasm/casperflow.wasm` (~150KB optimized)

### 🚀 Deploy to Testnet

```bash
# Set your secret key path
export SECRET_KEY="$HOME/casper-keys/secret_key.pem"

# Make deploy script executable
chmod +x deploy.sh

# Deploy to testnet
./deploy.sh testnet
```

---

## 📦 Smart Contract

The CasperFlow smart contract is a single-file, all-in-one DeFi solution optimized for the Casper blockchain. 

### 🔧 Contract Functions

<details>
<summary><b>📝 Token Operations</b></summary>

```rust
// View functions
name() -> String
symbol() -> String
decimals() -> u8
total_supply() -> U256
balance_of(owner:  Key) -> U256
allowance(owner: Key, spender: Key) -> U256

// State-changing functions
transfer(recipient: Key, amount: U256) -> Result<()>
approve(spender: Key, amount: U256) -> Result<()>
```
</details>

<details>
<summary><b>💰 Staking System</b></summary>

```rust
stake(amount: U256) -> Result<()>
unstake(amount: U256) -> Result<()>
get_stake(owner:  Key) -> U256
```
</details>

<details>
<summary><b>📊 Trading Positions</b></summary>

```rust
open_position(amount:  U256, leverage: u8) -> Result<PositionId>
close_position(position_id: PositionId) -> Result<()>
get_position(position_id: PositionId) -> Position
```
</details>

<details>
<summary><b>🏦 Vault Operations</b></summary>

```rust
vault_deposit(amount: U256) -> Result<()>
vault_withdraw(amount: U256) -> Result<()>
get_vault_balance(owner: Key) -> U256
```
</details>

### 📊 Contract Specifications

| Property | Value |
|----------|-------|
| **Size** | ~150KB (optimized WASM) |
| **Language** | Rust |
| **Blockchain** | Casper Network |
| **Standard** | CEP-18 (ERC20 equivalent) |
| **Gas Optimization** | ✅ Highly optimized |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16. 0 (React 19)
- **Styling:** TailwindCSS + Radix UI
- **Animations:** Framer Motion
- **Charts:** Lightweight Charts
- **Forms:** React Hook Form + Zod
- **Type Safety:** TypeScript

### Smart Contract
- **Language:** Rust
- **Platform:** Casper Network
- **Testing:** Casper Test Framework
- **Build:** WASM Target

### Infrastructure
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics
- **Theme:** next-themes (Dark/Light mode)

---

## 📚 Documentation

### 📖 Project Structure

```
CasperFlow/
├── 📱 app/                    # Next.js app directory
├── 🎨 components/             # React components
│   ├── ui/                   # Reusable UI components
│   └── ...                    # Feature components
├── ⛓️ contracts/
│   └── casperflow/           # Smart contract
│       ├── src/              # Contract source
│       ├── build.sh          # Build script
│       ├── deploy.sh         # Deployment script
│       └── README.md         # Contract docs
├── 🎨 public/                # Static assets
├── 🔧 lib/                   # Utilities & helpers
└── 📝 README.md              # You are here! 
```

### 🧪 Testing

```bash
# Run frontend tests
npm run test

# Lint code
npm run lint

# Security audit
npm run security:audit
npm run security:fix
```

### 🔐 Security

- Regular dependency audits
- Smart contract security best practices
- Input validation and sanitization
- Rate limiting and DDoS protection

---

## 🎨 Screenshots

<div align="center">

*Coming Soon - UI Screenshots*

</div>

---

## 🗺️ Roadmap

- [x] Core smart contract implementation
- [x] Frontend UI/UX
- [x] Staking mechanism
- [x] Leveraged trading
- [x] Vault system
- [ ] Advanced trading features
- [ ] Governance token
- [ ] Mobile app
- [ ] Multi-chain support
- [ ] DAO implementation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

<div align="center">

**Built with ❤️ by [@AayushhxD](https://github.com/AayushhxD)**

[![GitHub](https://img.shields.io/badge/GitHub-AayushhxD-181717?style=for-the-badge&logo=github)](https://github.com/AayushhxD)

</div>

---

## 🌐 Links

- **Live App:** [casperflow.vercel.app](https://casperflow.vercel.app/)
- **Repository:** [github.com/AayushhxD/CasperFlow](https://github.com/AayushhxD/CasperFlow)
- **Casper Network:** [casper.network](https://casper.network/)
- **Documentation:** [View Contract README](contracts/casperflow/README.md)

---

<div align="center">

### ⭐ Star us on GitHub — it motivates us a lot!

**Made with 🌊 on the Casper Blockchain**

</div>
