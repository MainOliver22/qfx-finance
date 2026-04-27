
import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, bsc, polygon],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'QFX Finance' }),
    // WalletConnect requires a projectId from cloud.walletconnect.com
    // walletConnect({ projectId: 'YOUR_PROJECT_ID' }), 
  ],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
});
