import React, { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://localhost:5174";

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Instala Metamask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAddress(addr);

    const nonceRes = await fetch(`${BACKEND_URL}/api/siwe/nonce`);
    const { nonce } = await nonceRes.json();

    const message = `Inicia sesión con Ethereum\n\nNonce: ${nonce}`;
    const signature = await signer.signMessage(message);

    const verifyRes = await fetch(`${BACKEND_URL}/api/siwe/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    const data = await verifyRes.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("jwt", data.token);
      fetchStatus(data.token);
    } else {
      alert("Error al autenticar");
    }
  };

  const fetchStatus = async (jwtToken = token) => {
    const res = await fetch(`${BACKEND_URL}/api/status`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const data = await res.json();
    setStatus(data);
  };

  const claimTokens = async () => {
    setLoading(true);
    const res = await fetch(`${BACKEND_URL}/api/claim`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) alert("Tokens reclamados");
    else alert("Error al reclamar");
    fetchStatus();
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      textAlign: "center" as const,
      backgroundColor: "#1e1e2f",
      color: "#f5f5f5",
      borderRadius: "15px",
      boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    button: {
      padding: "1rem 2rem",
      margin: "1rem 0",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      backgroundColor: "#ffb400",
      color: "#1e1e2f",
      fontWeight: "bold" as const,
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    buttonDisabled: {
      backgroundColor: "#aaa",
      cursor: "not-allowed",
    },
    card: {
      backgroundColor: "#2a2a3e",
      padding: "1rem",
      borderRadius: "10px",
      margin: "1rem 0",
      boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
    },
    list: {
      textAlign: "left" as const,
      paddingLeft: "1rem",
    },
    heading: {
      color: "#ffb400",
    },
  };

  return (
    <div style={styles.container}>
      {!token ? (
        <button
          onClick={connectWallet}
          style={styles.button}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ffc947")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ffb400")}
        >
          Conectar y Autenticar
        </button>
      ) : (
        <>
          <div style={styles.card}>
            <p><strong>Wallet:</strong> {address}</p>
          </div>
          {status ? (
            <>
              <div style={styles.card}>
                <p><strong>Balance:</strong> {status.balance}</p>
                <p>{status.hasClaimed ? "Ya reclamaste" : "Puedes reclamar"}</p>
                <button
                  onClick={claimTokens}
                  disabled={status.hasClaimed || loading}
                  style={{
                    ...styles.button,
                    ...(status.hasClaimed || loading ? styles.buttonDisabled : {}),
                  }}
                  onMouseOver={(e) => {
                    if (!status.hasClaimed && !loading) e.currentTarget.style.backgroundColor = "#ffc947";
                  }}
                  onMouseOut={(e) => {
                    if (!status.hasClaimed && !loading) e.currentTarget.style.backgroundColor = "#ffb400";
                  }}
                >
                  {loading ? "Procesando..." : "Reclamar Tokens"}
                </button>
              </div>
              <h3 style={styles.heading}>Usuarios que reclamaron:</h3>
              <ul style={styles.list}>
                {status.users?.map((u: string) => <li key={u}>{u}</li>)}
              </ul>
            </>
          ) : (
            <p>Cargando estado...</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
