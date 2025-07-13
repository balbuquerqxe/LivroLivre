// LivroLivre/backend/services/stellarService.js

const StellarSdk = require('stellar-sdk');
const axios = require('axios');

// --- LOGS DE VERIFICAÇÃO INICIAL (APENAS PARA DEBUG - Remova-os depois que tudo funcionar) ---
// console.log('[DEBUG-STELLAR] StellarSdk object:', StellarSdk);
// console.log('[DEBUG-STELLAR] StellarSdk.Network property:', StellarSdk.Network); // Este log ainda pode mostrar undefined, mas não causará crash
// --- FIM LOGS DE VERIFICAÇÃO INICIAL ---

// DEFINICAO GLOBAL DA PASSPHRASE DA REDE TESTNET
// Este é o valor constante que define a rede (Testnet)
const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

// --- CONFIGURAÇÃO DO SEU TOKEN BOOK ---
const ISSUER_PUBLIC_KEY = 'GA3SEHK7LAIRYKEHHXNTOSFXSU7BESTEXX57YRRPGM3WWLUXBA7SOKTU'; 
const BOOK_ASSET_CODE = 'BOOK'; 
const BOOK_ASSET = new StellarSdk.Asset(BOOK_ASSET_CODE, ISSUER_PUBLIC_KEY);

// =========================================================================
// 1. gerarChaveStellar
// =========================================================================
async function gerarChaveStellar() {
    // NUNCA CHAME StellarSdk.Network.useTestNetwork() AQUI.
    // A passphrase da rede é passada diretamente ao construtor do Server.
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org', {
        networkPassphrase: TESTNET_PASSPHRASE 
    }); 

    try {
        const pair = StellarSdk.Keypair.random();
        console.log('[STELLAR SERVICE] Chave Stellar gerada com sucesso.');
        return { publicKey: pair.publicKey(), secret: pair.secret() };
    } catch (error) {
        console.error('[STELLAR SERVICE ERROR] Erro ao gerar chave Stellar:', error.message || error);
        throw new Error('Falha ao gerar chave Stellar.'); 
    }
}

// =========================================================================
// 2. fundearConta
// =========================================================================
async function fundearConta(publicKey) {
    // A instância 'server' é criada por consistência, mas o Friendbot é um serviço HTTP direto.
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org', {
        networkPassphrase: TESTNET_PASSPHRASE 
    }); 

    try {
        console.log(`[STELLAR SERVICE] Tentando fundear conta ${publicKey} usando Friendbot.`);
        const response = await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`);
        console.log('[STELLAR SERVICE] Conta Stellar fundeada com sucesso.');
        return response.data;
    } catch (error) {
        console.error(`[STELLAR SERVICE ERROR] Erro ao fundear conta ${publicKey}:`, error.message || error);
        if (error.response) {
            console.error('  Detalhes da resposta do Friendbot:', error.response.data);
        }
        throw new Error(`Falha ao fundear conta Stellar: ${error.message || 'Erro desconhecido'}. Verifique logs do Friendbot.`); 
    }
}

// =========================================================================
// 3. criarTrustline
// =========================================================================
async function criarTrustline(secret) {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org', {
        networkPassphrase: TESTNET_PASSPHRASE 
    }); 

    let sourceKeypair;
    try {
        sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
    } catch (error) {
        console.error('[STELLAR SERVICE ERROR] Erro ao criar Keypair a partir do secret:', error.message || error);
        throw new Error('Secret Key inválida para criar trustline.');
    }

    try {
        const account = await server.loadAccount(sourceKeypair.publicKey());
        console.log(`[STELLAR SERVICE] Conta ${sourceKeypair.publicKey()} carregada para trustline.`);

        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: TESTNET_PASSPHRASE // << Passa a passphrase aqui também
        })
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: BOOK_ASSET, 
            limit: StellarSdk.Asset.MAX_SPONSORSHIP_AMOUNT 
        }))
        .setTimeout(30) 
        .build();

        transaction.sign(sourceKeypair);

        const result = await server.submitTransaction(transaction);
        console.log('[STELLAR SERVICE] Trustline criada com sucesso para o asset:', BOOK_ASSET_CODE);
        return result;
    } catch (error) {
        console.error(`[STELLAR SERVICE ERROR] Erro ao criar trustline para ${sourceKeypair.publicKey()}:`, error.message || error);
        if (error.response) {
            console.error('  Detalhes da resposta da Trustline:', error.response.data);
            if (error.response.data && error.response.data.extras && error.response.data.extras.result_codes) {
                console.error('  Códigos de Resultado Stellar:', error.response.data.extras.result_codes);
            }
        }
        throw new Error(`Falha ao criar trustline para ${BOOK_ASSET_CODE}: ${error.message || 'Erro desconhecido'}. Verifique logs da Stellar.`); 
    }
}

// =========================================================================
// 4. sendBookToken
// =========================================================================
async function sendBookToken(destinationPublicKey) {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org', {
        networkPassphrase: TESTNET_PASSPHRASE 
    }); 

    const issuerSecretKey = process.env.ISSUER_SECRET_KEY; 
    if (!issuerSecretKey) {
        throw new Error('Chave Secreta do Issuer não configurada no ambiente.');
    }
    const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);

    try {
        const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
        console.log(`[STELLAR SERVICE] Conta do Issuer ${issuerKeypair.publicKey()} carregada para enviar token.`);

        const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: TESTNET_PASSPHRASE // << Passa a passphrase aqui também
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: destinationPublicKey,
            asset: BOOK_ASSET, 
            amount: '1' 
        }))
        .setTimeout(30) 
        .build();

        transaction.sign(issuerKeypair);

        const result = await server.submitTransaction(transaction);
        console.log(`[STELLAR SERVICE] Token BOOK enviado com sucesso para ${destinationPublicKey}. Hash: ${result.hash}`);
        return { hash: result.hash };
    } catch (error) {
        console.error(`[STELLAR SERVICE ERROR] Erro ao enviar token BOOK para ${destinationPublicKey}:`, error.message || error);
        if (error.response) {
            console.error('  Detalhes da resposta do Stellar Submit:', error.response.data);
            if (error.response.data && error.response.data.extras && error.response.data.extras.result_codes) {
                console.error('  Códigos de Resultado Stellar:', error.response.data.extras.result_codes);
            }
        }
        throw new Error(`Falha ao enviar token BOOK: ${error.message || 'Erro desconhecido'}.`); 
    }
}

module.exports = {
    gerarChaveStellar,
    fundearConta,
    criarTrustline,
    sendBookToken
};