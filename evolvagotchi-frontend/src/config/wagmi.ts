import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

// Define OneChain Testnet with verified configuration
export const onechainTestnet = defineChain({
  id: 311752642, // OneChain Testnet Chain ID
  name: 'OneChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ONE',
    symbol: 'ONE',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.oneledger.network'],
    },
    public: {
      http: ['https://testnet-rpc.oneledger.network'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'OneChain Explorer', 
      url: 'https://testnet-explorer.oneledger.network',
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [onechainTestnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [onechainTestnet.id]: http('https://testnet-rpc.oneledger.network', {
      batch: false, // Disable batching for better compatibility
      retryCount: 5,
      retryDelay: 300,
      timeout: 20000, // Increase timeout to 20 seconds
    }),
  },
  multiInjectedProviderDiscovery: false,
  ssr: true,
})