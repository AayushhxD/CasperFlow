# CasperFlow All-in-One Smart Contract

Single-file DeFi smart contract for Casper blockchain combining:

- ✅ ERC20 Token functionality
- ✅ Staking system
- ✅ Leveraged trading positions
- ✅ Vault deposits/withdrawals

## Build

```bash
cd contracts/casperflow
chmod +x build.sh
./build.sh
```

Output: `wasm/casperflow.wasm`

## Deploy

```bash
export SECRET_KEY="$HOME/casper-keys/secret_key.pem"

chmod +x deploy.sh
./deploy.sh testnet
```

## Features

### Token

- `name()` - Get token name
- `symbol()` - Get token symbol
- `decimals()` - Get decimals
- `total_supply()` - Get total supply
- `balance_of(owner)` - Get balance
- `transfer(recipient, amount)` - Transfer tokens
- `approve(spender, amount)` - Approve spending
- `allowance(owner, spender)` - Get allowance

### Staking

- `stake(amount)` - Stake tokens
- `unstake(amount)` - Unstake tokens
- `get_stake(owner)` - Get staked amount

### Trading

- `open_position(amount, leverage)` - Open leveraged position
- `close_position(position_id)` - Close position

### Vault

- `vault_deposit(amount)` - Deposit to vault
- `vault_withdraw(amount)` - Withdraw from vault

## Contract Size

~150KB optimized WASM
