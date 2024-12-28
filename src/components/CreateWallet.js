import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { createWallet } from '../utils/solana';

const CreateWallet = () => {
  const [wallet, setWallet] = useState(null);

  const handleCreateWallet = () => {
    const newWallet = createWallet();
    setWallet(newWallet);
  };

  return (
    <div>
      <h2>Create a New Wallet</h2>
      <button onClick={handleCreateWallet}>Create Wallet</button>
      {wallet && (
        <div>
          <p><strong>Public Key:</strong> {wallet.publicKey}</p>
          <p><strong>Secret Key:</strong> {JSON.stringify(wallet.secretKey)}</p>
          <QRCode value={wallet.publicKey} />
        </div>
      )}
    </div>
  );
};

export default CreateWallet;