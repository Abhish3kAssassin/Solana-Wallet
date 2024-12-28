import { Keypair, Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl } from '@solana/web3.js';

export const createWallet = () => {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();
  const secretKey = Array.from(keypair.secretKey);
  return { publicKey, secretKey };
};

export const importWallet = (secretKey) => {
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  return keypair.publicKey.toString();
};

export const getBalance = async (publicKey, network = 'devnet') => {
  const connection = new Connection(clusterApiUrl(network), 'confirmed');
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / 1e9; // Convert lamports to SOL
};

export const sendTransaction = async (fromKeypair, toPublicKey, amount, network = 'devnet') => {
  const connection = new Connection(clusterApiUrl(network), 'confirmed');
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new PublicKey(toPublicKey),
      lamports: amount * 1e9, // Convert SOL to lamports
    })
  );
  const signature = await connection.sendTransaction(transaction, [fromKeypair]);
  await connection.confirmTransaction(signature);
  return signature;
};