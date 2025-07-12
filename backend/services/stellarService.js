// Importar biblioteca da Stellar
const StellarSdk = require('stellar-sdk');
const { getServer } = require('stellar-sdk');

// Carrega o arquivo .env! Tem as informações sensíveis!!
require('dotenv').config();

// Conexão com o servidor da Stellar Testnet
const { getServer } = require('stellar-sdk');
const server = getServer('TESTNET');

// Criação de um par de chaves para o emissor do token
const issuingKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET);

// Obtém a chave pública do emissor
const issuingPublicKey = issuingKeypair.publicKey();

// Criação do token que será enviado, sendo o nome do token "BOOK"
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

// Para poder ser usado em outros arquivos
module.exports = { sendBookToken };
