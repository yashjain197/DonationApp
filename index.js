var wallet;
const lamports_per_sol = solanaWeb3.LAMPORTS_PER_SOL;
function connectWallet() {
  (async () => {
    try {
      const resp = await window.solana.connect();
      wallet = resp;
    } catch (err) {}
  })();
  window.solana.on(
    "connect",
    () => (document.getElementById("status").innerText = "Connected")
  );
}

function signInTransactionAndSendMoney(destPubkeyStr, lamports) {
  (async () => {
    const network = "https://api.devnet.solana.com";
    const connection = new solanaWeb3.Connection(network);
    const transaction = new solanaWeb3.Transaction();

    try {
      destPubkeyStr = "2cgYtHGoCsLNN28dZXfCSadsG2YK4r85p4j1a5C788wf";
      lamports = 0.2 * lamports_per_sol;

      console.log("starting sendMoney");
      const destPubkey = new solanaWeb3.PublicKey(destPubkeyStr);
      const walletAccountInfo = await connection.getAccountInfo(
        wallet.publicKey
      );
      console.log("wallet data size", walletAccountInfo?.data.length);

      const receiverAccountInfo = await connection.getAccountInfo(destPubkey);
      console.log("receiver data size", receiverAccountInfo?.data.length);

      const instruction = solanaWeb3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: destPubkey,
        lamports, // about half a SOL
      });
      let trans = await setWalletTransaction(instruction, connection);

      let signature = await signAndSendTransaction(wallet, trans, connection);
      let result = await connection.confirmTransaction(
        signature,
        "singleGossip"
      );
      console.log("money sent", result);
    } catch (e) {
      console.warn("Failed", e);
    }
  })();

  async function setWalletTransaction(instruction, connection) {
    const transaction = new solanaWeb3.Transaction();
    transaction.add(instruction);
    transaction.feePayer = wallet.publicKey;
    let hash = await connection.getRecentBlockhash();
    console.log("blockhash", hash);
    transaction.recentBlockhash = hash.blockhash;
    return transaction;
  }

  async function signAndSendTransaction(wallet, transaction, connection) {
    // Sign transaction, broadcast, and confirm
    const { signature } = await window.solana.signAndSendTransaction(
      transaction
    );
    await connection.confirmTransaction(signature);

    //let signedTrans = await wallet.signTransaction(transaction);
    console.log("sign transaction");
    //let signature = await connection.sendRawTransaction(signedTrans.serialize());
    console.log("send raw transaction");
    return signature;
  }
}
