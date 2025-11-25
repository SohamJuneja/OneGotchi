import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EvolvagotchiGame } from './components/EvolvagotchiGame'
import '@mysten/dapp-kit/dist/index.css'
import './App.css'

// Use proxy in development, direct URL in production
const rpcUrl = import.meta.env.DEV 
  ? 'http://localhost:5173/onechain-rpc'
  : 'https://rpc-testnet.onelabs.cc:443';

// Setup OneChain Config with custom network
const { networkConfig } = createNetworkConfig({
  onechain: { 
    url: rpcUrl,
  },
})
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="onechain">
        <WalletProvider autoConnect>
          <div className="app">
            <EvolvagotchiGame />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}

export default App