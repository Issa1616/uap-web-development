import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "@wagmi/core/providers/public";

// Configuramos la cadena Sepolia con un proveedor público
const { provider, webSocketProvider } = configureChains(
  [sepolia],
  [publicProvider()]
);

// Creamos el cliente de Wagmi
const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
