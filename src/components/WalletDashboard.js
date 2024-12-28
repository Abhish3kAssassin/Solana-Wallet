import React, { useState } from 'react';
import { Connection, clusterApiUrl, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const WalletDashboard = ({ publicKey, secretKey }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [balance, setBalance] = useState(null);

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Fetch Balance
  const handleGetBalance = async () => {
    try {
      const walletBalance = await connection.getBalance(new PublicKey(publicKey));
      setBalance(walletBalance / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      setStatus(`Failed to fetch balance: ${error.message}`);
    }
  };

  // Send Transaction
  const handleSendTransaction = async () => {
    try {
      if (!recipient || !amount) {
        setStatus('Please provide a valid recipient and amount.');
        return;
      }

      const recipientPublicKey = new PublicKey(recipient);
      const lamports = parseFloat(amount) * 1e9; // Convert SOL to lamports

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: recipientPublicKey,
          lamports,
        })
      );

      const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
      const signature = await connection.sendTransaction(transaction, [fromKeypair]);
      await connection.confirmTransaction(signature, 'confirmed');

      setStatus(`Transaction Successful! Signature: ${signature}`);
      handleGetBalance(); // Refresh balance after transaction
    } catch (error) {
      console.error('Error sending transaction:', error);
      setStatus(`Transaction Failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Wallet Dashboard</h2>
      <p><strong>Public Key:</strong> {publicKey}</p>
      <button onClick={handleGetBalance}>Get Balance</button>
      {balance !== null && <p><strong>Balance:</strong> {balance} SOL</p>}
      <div>
        <h3>Send Transaction</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount in SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSendTransaction}>Send</button>
      </div>
      {status && <p>{status}</p>}
    </div>
  );
};

export default WalletDashboard;