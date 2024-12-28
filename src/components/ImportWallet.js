import React, { useState } from 'react';
import { importWallet, getBalance } from '../utils/solana';

const ImportWallet = () => {
  const [secretKey, setSecretKey] = useState('');
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);

  const handleImportWallet = async () => {
    const walletPublicKey = importWallet(JSON.parse(secretKey));
    setPublicKey(walletPublicKey);
    const walletBalance = await getBalance(walletPublicKey);
    setBalance(walletBalance);
  };

  return (
    <div>
      <h2>Import Wallet</h2>
      <textarea
        placeholder="Enter your secret key (array format)"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
      />
      <button onClick={handleImportWallet}>Import</button>
      {publicKey && (
        <div>
          <p><strong>Public Key:</strong> {publicKey}</p>
          <p><strong>Balance:</strong> {balance} SOL</p>
        </div>
      )}
    </div>
  );
};

export default ImportWallet;