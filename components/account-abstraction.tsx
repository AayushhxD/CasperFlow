'use client';

import { useState } from 'react';
import { Zap, Wallet, CheckCircle, Loader, Info } from 'lucide-react';

interface GaslessOption {
  enabled: boolean;
  paymentToken: string;
  sponsorAvailable: boolean;
}

export default function AccountAbstraction() {
  const [gasless, setGasless] = useState<GaslessOption>({
    enabled: true,
    paymentToken: 'CSPR',
    sponsorAvailable: true
  });
  const [batchTransactions, setBatchTransactions] = useState<any[]>([]);
  const [isBatching, setIsBatching] = useState(false);

  const paymentTokens = [
    { symbol: 'CSPR', name: 'Casper', balance: 1000 },
    { symbol: 'USDT', name: 'Tether', balance: 500 },
    { symbol: 'USDC', name: 'USD Coin', balance: 750 },
    { symbol: 'ETH', name: 'Ethereum', balance: 0.5 }
  ];

  const addToBatch = (tx: any) => {
    setBatchTransactions([...batchTransactions, tx]);
  };

  const executeBatch = async () => {
    setIsBatching(true);
    // Simulate batch execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBatchTransactions([]);
    setIsBatching(false);
  };

  return (
    <div className="space-y-6">
      {/* Gasless Transactions */}
      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Gasless Transactions</h3>
            <p className="text-sm text-gray-400">Pay fees in any token or get sponsored</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle Gasless */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <div className="font-medium text-white">Enable Gasless Mode</div>
              <div className="text-sm text-gray-400">Pay fees in your preferred token</div>
            </div>
            <button
              onClick={() => setGasless({ ...gasless, enabled: !gasless.enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${gasless.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${gasless.enabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {gasless.enabled && (
            <>
              {/* Payment Token Selector */}
              <div className="p-4 bg-white/5 rounded-lg">
                <label className="block text-sm text-gray-400 mb-3">Pay Fees With</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setGasless({ ...gasless, paymentToken: token.symbol })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        gasless.paymentToken === token.symbol
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                        {gasless.paymentToken === token.symbol && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-2">
                        Balance: {token.balance}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sponsored Transactions */}
              {gasless.sponsorAvailable && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-400">Sponsor Available!</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Your next 5 transactions are sponsored by CasperFlow. No fees required!
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Batch Transactions */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Batch Transactions</h3>
            <p className="text-sm text-gray-400">Execute multiple actions in one transaction</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Batch Queue */}
          {batchTransactions.length > 0 ? (
            <div className="space-y-2">
              {batchTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{tx.name}</div>
                    <div className="text-sm text-gray-400">{tx.description}</div>
                  </div>
                  <button
                    onClick={() => setBatchTransactions(batchTransactions.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={executeBatch}
                disabled={isBatching}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBatching ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Executing {batchTransactions.length} Transactions...
                  </>
                ) : (
                  <>Execute Batch ({batchTransactions.length})</>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div>No transactions in batch queue</div>
              <div className="text-sm mt-1">Add transactions to execute them together</div>
            </div>
          )}

          {/* Quick Add Examples */}
          <div className="pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400 mb-3">Quick Add Examples:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addToBatch({ name: 'Stake 100 CSPR', description: 'Liquid staking' })}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors text-left"
              >
                <div className="font-medium text-white">Stake 100 CSPR</div>
                <div className="text-xs text-gray-400">+ Receive stCSPR</div>
              </button>
              <button
                onClick={() => addToBatch({ name: 'Approve & Swap', description: 'USDT → CSPR' })}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors text-left"
              >
                <div className="font-medium text-white">Approve & Swap</div>
                <div className="text-xs text-gray-400">USDT → CSPR</div>
              </button>
              <button
                onClick={() => addToBatch({ name: 'Create Limit Order', description: 'Buy @ $0.05' })}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors text-left"
              >
                <div className="font-medium text-white">Create Limit Order</div>
                <div className="text-xs text-gray-400">Buy @ $0.05</div>
              </button>
              <button
                onClick={() => addToBatch({ name: 'Set Stop Loss', description: 'Sell @ $0.045' })}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors text-left"
              >
                <div className="font-medium text-white">Set Stop Loss</div>
                <div className="text-xs text-gray-400">Sell @ $0.045</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="font-semibold text-white mb-2">💰 Save Gas Fees</div>
          <div className="text-sm text-gray-400">
            Pay fees in any token you hold, no need to keep native tokens
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="font-semibold text-white mb-2">⚡ Batch Efficiency</div>
          <div className="text-sm text-gray-400">
            Execute multiple operations in one transaction, save time and fees
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="font-semibold text-white mb-2">🎁 Sponsored Txs</div>
          <div className="text-sm text-gray-400">
            Get free sponsored transactions for new users and promotions
          </div>
        </div>
      </div>
    </div>
  );
}
