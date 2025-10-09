const API_URL = "http://localhost:5174"; 

export async function getMessage(address: string) {
  const res = await fetch(`${API_URL}/auth/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); 
}

export async function signIn(message: string, signature: string) {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); 
}

export async function claimTokens(token: string) {
  const res = await fetch(`${API_URL}/faucet/claim`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); 
}

export async function getStatus(token: string, address: string) {
  const res = await fetch(`${API_URL}/faucet/status/${address}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); 
}
