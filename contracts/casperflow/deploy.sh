#!/bin/bash
set -e

NETWORK="${1:-testnet}"
SECRET_KEY="${SECRET_KEY:-$HOME/casper-keys/secret_key.pem}"
CHAIN_NAME="casper-test"
NODE_ADDRESS="http://3.14.161.135:7777"

if [ "$NETWORK" = "mainnet" ]; then
    CHAIN_NAME="casper"
    NODE_ADDRESS="http://65.21.235.219:7777"
fi

CONTRACT_NAME="casperflow"
TOKEN_NAME="CasperFlow Token"
TOKEN_SYMBOL="CFLOW"
TOTAL_SUPPLY="1000000000000000000"

echo "🚀 Deploying CasperFlow to $NETWORK"
echo "   Chain: $CHAIN_NAME"
echo "   Node: $NODE_ADDRESS"
echo ""

# Use put-transaction session (new caspe
if casper-client put-transaction session --help &>/dev/null; then
    echo "Using put-transaction session..."
    casper-client put-transaction session \
        --node-address "$NODE_ADDRESS" \
        --chain-name "$CHAIN_NAME" \
        --secret-key "$SECRET_KEY" \
        --payment-amount 250000000000 \
        --standard-payment true \
        --gas-price-tolerance 5 \
        --wasm-path "wasm/casperflow.wasm" \
        --session-arg "contract_name:string='$CONTRACT_NAME'" \
        --session-arg "token_name:string='$TOKEN_NAME'" \
        --session-arg "token_symbol:string='$TOKEN_SYMBOL'" \
        --session-arg "total_supply:u256='$TOTAL_SUPPLY'"
else
    echo "Using put-deploy (legacy)..."
    casper-client put-deploy \
        --node-address "$NODE_ADDRESS" \
        --chain-name "$CHAIN_NAME" \
        --secret-key "$SECRET_KEY" \
        --payment-amount 250000000000 \
        --session-path "wasm/casperflow.wasm" \
        --session-arg "contract_name:string='$CONTRACT_NAME'" \
        --session-arg "token_name:string='$TOKEN_NAME'" \
        --session-arg "token_symbol:string='$TOKEN_SYMBOL'" \
        --session-arg "total_supply:u256='$TOTAL_SUPPLY'"
fi

echo ""
echo "✅ Deploy submitted successfully!"
