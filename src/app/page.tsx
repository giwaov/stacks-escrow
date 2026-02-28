"use client";
import { useState, useEffect } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { openContractCall } from "@stacks/connect";
import { standardPrincipalCV, uintCV, PostConditionMode } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });
const CONTRACT_ADDRESS = "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY";
const CONTRACT_NAME = "escrow";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("");
  const [escrowId, setEscrowId] = useState("");

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setAddress(userSession.loadUserData().profile.stxAddress.mainnet);
    }
  }, []);

  const connect = () => {
    showConnect({
      appDetails: { name: "Stacks Escrow", icon: "/icon.png" },
      onFinish: () => setAddress(userSession.loadUserData().profile.stxAddress.mainnet),
      userSession,
    });
  };

  const createEscrow = async () => {
    if (!seller || !amount) return;
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "create-escrow",
      functionArgs: [standardPrincipalCV(seller), uintCV(parseInt(amount) * 1000000)],
      network: STACKS_MAINNET,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => alert(`Escrow created! TX: ${data.txId}`),
    });
  };

  const release = async () => {
    if (!escrowId) return;
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "release",
      functionArgs: [uintCV(parseInt(escrowId))],
      network: STACKS_MAINNET,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => alert(`Released! TX: ${data.txId}`),
    });
  };

  const refund = async () => {
    if (!escrowId) return;
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "refund",
      functionArgs: [uintCV(parseInt(escrowId))],
      network: STACKS_MAINNET,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => alert(`Refunded! TX: ${data.txId}`),
    });
  };

  return (
    <main style={{ padding: 40, fontFamily: "system-ui", maxWidth: 600, margin: "0 auto" }}>
      <h1>🔒 Stacks Escrow</h1>
      <p>Secure P2P trades on Stacks Mainnet</p>

      {!address ? (
        <button onClick={connect} style={{ padding: "12px 24px", fontSize: 16, cursor: "pointer" }}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {address.slice(0, 8)}...{address.slice(-4)}</p>

          <div style={{ marginTop: 30, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
            <h3>Create Escrow</h3>
            <input type="text" placeholder="Seller address (SP...)" value={seller} onChange={(e) => setSeller(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
            <input type="number" placeholder="Amount (STX)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
            <button onClick={createEscrow} style={{ padding: "10px 20px" }}>Create Escrow</button>
          </div>

          <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
            <h3>Manage Escrow</h3>
            <input type="number" placeholder="Escrow ID" value={escrowId} onChange={(e) => setEscrowId(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
            <button onClick={release} style={{ padding: "10px 20px", marginRight: 10, background: "#4CAF50", color: "white", border: "none" }}>Release to Seller</button>
            <button onClick={refund} style={{ padding: "10px 20px", background: "#ff9800", color: "white", border: "none" }}>Refund Buyer</button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 40, color: "#666", fontSize: 14 }}>
        <p>Contract: {CONTRACT_ADDRESS}.{CONTRACT_NAME}</p>
        <p>Built with @stacks/connect and @stacks/transactions</p>
      </footer>
    </main>
  );
}
