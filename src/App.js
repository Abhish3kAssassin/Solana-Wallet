import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Keypair, Connection, clusterApiUrl, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="App-header">
      <h1>Solana Wallet</h1>
      <div className="container">
        <div>
          <h2>Create a New Wallet</h2>
          <button onClick={() => navigate('/create-wallet')}>Create Wallet</button>
        </div>
        <div>
          <h2>Import Wallet</h2>
          <button onClick={() => navigate('/import-wallet')}>Import Wallet</button>
        </div>
      </div>
    </div>
  );
};

const CreateWalletPage = () => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState([]);
  const [balance, setBalance] = useState(null);

  const handleCreateWallet = async () => {
    try {
      const mnemonic = bip39.generateMnemonic(128);
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const keypair = Keypair.fromSeed(seed.slice(0, 32));

      setSeedPhrase(mnemonic);
      setPublicKey(keypair.publicKey.toBase58());
      setPrivateKey(Array.from(keypair.secretKey));

      alert('Wallet created successfully!');
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Failed to create wallet. Please try again.');
    }
  };

  const handleGetBalance = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    try {
      const balanceInLamports = await connection.getBalance(new PublicKey(publicKey));
      setBalance((balanceInLamports / 1e9).toFixed(6)); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Failed to fetch balance. Please try again.');
    }
  };

  const downloadFile = (fileName, data) => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="App-header">
      <h1>Create Wallet</h1>
      <button onClick={handleCreateWallet}>Generate Wallet</button>
      {seedPhrase && (
        <div className="seed-box">
          <p><strong>Seed Phrase:</strong> {seedPhrase}</p>
          <p><strong>Public Key:</strong> {publicKey}</p>
          <p><strong>Balance:</strong> {balance !== null ? `${balance} SOL` : 'Not fetched yet'}</p>
          <div className="buttons">
            <button onClick={handleGetBalance}>Get Balance</button>
            <button onClick={() => downloadFile('seed.json', { seedPhrase })}>
              Download Seed as JSON
            </button>
            <button onClick={() => downloadFile('keys.json', { publicKey, privateKey })}>
              Download Public and Private Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ImportWalletPage = () => {
  const [importSeed, setImportSeed] = useState('');
  const navigate = useNavigate();

  const handleImportWallet = async () => {
    try {
      if (!bip39.validateMnemonic(importSeed)) {
        alert('Invalid seed phrase. Please check and try again.');
        return;
      }

      const seed = await bip39.mnemonicToSeed(importSeed);
      const keypair = Keypair.fromSeed(seed.slice(0, 32));

      alert('Wallet imported successfully!');
      navigate('/dashboard', {
        state: {
          publicKey: keypair.publicKey.toBase58(),
          privateKey: Array.from(keypair.secretKey),
        },
      });
    } catch (error) {
      console.error('Error importing wallet:', error);
      alert('Failed to import wallet. Please try again.');
    }
  };

  return (
    <div className="App-header">
      <h1>Import Wallet</h1>
      <textarea
        placeholder="Enter your seed phrase"
        value={importSeed}
        onChange={(e) => setImportSeed(e.target.value)}
      />
      <button onClick={handleImportWallet}>Import Wallet</button>
    </div>
  );
};

const DashboardPage = () => {
  const { state } = useLocation();
  const [balance, setBalance] = useState(null);
  const [sendTo, setSendTo] = useState('');
  const [amount, setAmount] = useState('');

  const handleGetBalance = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    try {
      const balanceInLamports = await connection.getBalance(new PublicKey(state.publicKey));
      setBalance((balanceInLamports / 1e9).toFixed(6)); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Failed to fetch balance.');
    }
  };

  const handleSendSOL = async () => {
    try {
      if (!sendTo || !amount) {
        alert('Please provide a valid recipient and amount.');
        return;
      }

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(state.publicKey),
          toPubkey: new PublicKey(sendTo),
          lamports: parseFloat(amount) * 1e9, // Convert SOL to lamports
        })
      );

      const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(state.privateKey));
      const signature = await connection.sendTransaction(transaction, [senderKeypair]);
      await connection.confirmTransaction(signature, 'confirmed');

      alert(`Transaction successful! Signature: ${signature}`);
      handleGetBalance(); // Refresh balance
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p><strong>Public Key:</strong> {state.publicKey}</p>
      <p><strong>Balance:</strong> {balance !== null ? `${balance} SOL` : 'Not fetched yet'}</p>
      <button onClick={handleGetBalance}>Get Balance</button>
      <div>
        <h3>Send SOL</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSendSOL}>Send</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-wallet" element={<CreateWalletPage />} />
        <Route path="/import-wallet" element={<ImportWalletPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;