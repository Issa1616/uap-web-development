import React from "react";
import { Web3Button, Web3Modal } from "@web3modal/react";
import { useAccount, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";

function App() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    chainId: sepolia.id,
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🚰 Faucet DApp en Sepolia</h1>
      <Web3Button />
      {isConnected ? (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Conectado:</strong> {address}</p>
          <p><strong>Balance ETH:</strong> {balance?.formatted} {balance?.symbol}</p>
        </div>
      ) : (
        <p>No hay wallet conectada</p>
      )}
      <Web3Modal projectId="YOUR_PROJECT_ID" />
    </div>
  );
}

export default App;
