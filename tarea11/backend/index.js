import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import FaucetABI from "./FaucetTokenABI.json" assert { type: "json" };

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

const { PRIVATE_KEY, JWT_SECRET, RPC_URL, CONTRACT_ADDRESS, PORT = 4000 } = process.env;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, FaucetABI, wallet);

const nonces = {};

app.get("/api/siwe/nonce", (req, res) => {
  const nonce = Math.random().toString(36).substring(2);
  nonces[nonce] = true;
  res.json({ nonce });
});

app.post("/api/siwe/verify", async (req, res) => {
  try {
    const { message, signature } = req.body;
    const siweMessage = new SiweMessage(message);
    const { address, nonce } = await siweMessage.verify({ signature });

    if (!nonces[nonce]) return res.status(400).json({ error: "Nonce inválido" });

    delete nonces[nonce];
    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, address });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error verificando firma" });
  }
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Falta token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

app.get("/api/status", authMiddleware, async (req, res) => {
  try {
    const address = req.user.address;
    const balance = await contract.balanceOf(address);
    const hasClaimed = await contract.hasAddressClaimed(address);
    const users = await contract.getFaucetUsers();

    res.json({
      address,
      balance: ethers.formatUnits(balance, 18),
      hasClaimed,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo estado" });
  }
});

app.post("/api/claim", authMiddleware, async (req, res) => {
  try {
    const address = req.user.address;
    const tx = await contract.claimTokens();
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al reclamar tokens" });
  }
});

app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
