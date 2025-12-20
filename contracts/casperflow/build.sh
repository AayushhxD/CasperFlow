#!/bin/bash
set -e

echo "🔨 Building CasperFlow Smart Contract..."

export PATH="$HOME/.cargo/bin:/usr/local/opt/rustup/bin:$PATH"

cargo build --release --target wasm32-unknown-unknown

mkdir -p wasm
cp target/wasm32-unknown-unknown/release/casperflow.wasm wasm/

echo "✅ Build complete: wasm/casperflow.wasm"
ls -lh wasm/casperflow.wasm
