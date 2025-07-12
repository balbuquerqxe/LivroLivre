// Importa toda a biblioteca Stellar de forma clássica
const StellarSdk = require('stellar-sdk');
require('dotenv').config();

// Conecta com a testnet da Stellar
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Chaves do emissor do token
const issuingKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET);
const issuingPublicKey = issuingKeypair.publicKey();

// Define o ativo/tóken que será enviado
const asset = new StellarSdk.Asset('BOOK', issuingPublicKey);

// Função que envia o token para o usuário!
async function sendBookToken(receiverPublicKey) {
  try {
    // Carrega a conta do emissor e prepara a transação
    const account = await server.loadAccount(issuingKeypair.publicKey());

    // Obt;ém a taxa de transação base
    const fee = await server.fetchBaseFee();

    // Cria a transação para enviar o token, definindo a conta, a taxa e a rede que pertence
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      // Adiciona a operação de pagamento!!
      .addOperation(StellarSdk.Operation.payment({
        destination: receiverPublicKey,
        asset: asset,
        amount: '1'
      }))
      .setTimeout(30) // Tempo limite de 30 segundos para confirmação
      .build();

    // Assina a transação com a chave secreta do emissor
    transaction.sign(issuingKeypair);

    // Envia a transação para o servidor da Stellar Testnet!
    const result = await server.submitTransaction(transaction);

    // Exibe o resultado da transação
    console.log('Token enviado com sucesso:', result.hash);

    // Retorna o resultado da transação
    return result;
  } catch (error) { // Captura e exibe erros que possam ocorrer durante o processo
    console.error('Erro ao enviar token:', error);
    throw error;
  }
}

// Função para gerar chaves Stellar para os usuários
function gerarChavesStellar() {

  // Gera um par de chaves aleatórias
  const par = StellarSdk.Keypair.random();

  // Retorna a chave pública e a chave secreta
  return {
    publicKey: par.publicKey(),
    secret: par.secret(),
  };
}
