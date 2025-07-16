# LivroLivre: um pouco sobre o projeto

![Logo do LivroLivre](frontend/src/assets/logoverde1.png)

---

## Contextualização

O **LivroLivre** é um projeto desenvolvido com o objetivo de facilitar a doação e a adoção de livros físicos entre pessoas, incentivando a circulação de conhecimento de forma gratuita e a democratização da leitura.

A ideia surgiu a partir de um decreto publicado no início de 2025 que restringe o uso de celulares em ambientes escolares, o que reafirmou a importância dos livros físicos como principal fonte de estudo. Como esses materiais costumam ser caros e, muitas vezes, são deixados de lado depois do uso por apenas um aluno, pensamos em uma alternativa mais sustentável e acessível: a troca de livros.

Ao longo do desenvolvimento, percebemos que a proposta ia além do contexto escolar. Muita gente fora do meio acadêmico também procura livros, seja por interesse pessoal, hobby ou necessidade. Com isso, o projeto foi ganhando uma cara mais ampla e se voltou a qualquer pessoa que queira doar ou adotar livros de forma simples, organizada e colaborativa.

Para tornar tudo isso possível, criamos uma plataforma digital!

---

## Funcionamento da plataforma

A dinâmica é simples: cada vez que uma pessoa doa um livro, ela recebe um crédito dentro do sistema. Esse crédito permite que ela adote outro livro disponível na plataforma.

Ou seja, o **LivroLivre** funciona como uma troca mediada: você doa um livro, ganha um crédito e pode usá-lo para adotar outro livro.

Para que essa lógica funcione na prática, estruturamos a plataforma em torno de alguns eixos principais:

- `Livros`: exibe todos os livros disponíveis para adoção, com possibilidade de filtro por título ou autor.
- `Cadastrar Livro`: permite que o usuário doe um livro, preenchendo informações como título, autor e adicionando uma imagem da capa.
- `Meus Livros`: reúne, em um só lugar, todos os livros que o usuário já doou ou adotou.
- `Meus Chats`: apresenta as conversas entre doadores e adotantes. Essa funcionalidade foi criada para que os envolvidos na troca combinem diretamente como será feita a entrega do livro. Uma vez resolvida a entrega, o chat pode ser encerrado.

---

## Tecnologia Stellar

Para registrar as doações e os créditos de forma transparente, decidimos usar a **rede Stellar**, uma tecnologia blockchain.

A cada doação de livro, o sistema envia um **token digital chamado `BOOK`** para a chave Stellar do doador. Esse token representa um crédito simbólico pela contribuição feita.

Toda essa operação é feita automaticamente pelo backend da plataforma, que:
1. Gera chaves públicas e secretas Stellar para os usuários;
2. Fundeia as contas com XLM na rede de testes;
3. Envia os tokens BOOK como forma de recompensa.

Essa escolha garante que os registros de contribuição não fiquem presos apenas dentro do nosso sistema: eles passam a existir também em uma rede pública e auditável, o que aumenta a confiança e a rastreabilidade do processo.

Atualmente, o LivroLivre está operando na **Testnet da Stellar**.

---


## Como usar o programa no meu dispositivo?

Como o programa é só um protótipo e não está lidando com dados reais, não tem problema utilizar as minhas senhas da plataforma Stellar que já estão configuradas no projeto. Mas, se algum dia o programa for lançado oficialmente, essas chaves precisariam ser modificadas para cada pessoa que for usar, garantindo a segurança e individualidade das contas Stellar.

Por isso, você **não precisa alterar a chave Stellar** neste momento para testar a aplicação. Basta seguir os passos abaixo para rodar o projeto localmente:

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/LivroLivre.git
cd LivroLivre
```

### 2. Instale as dependências

Você precisará instalar as bibliotecas do backend e do frontend separadamente:

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd ../frontend
npm install
```

### 3. Configure as variáveis de ambiente (não precisa!!!)

No diretório `backend`, crie um arquivo `.env` com a seguinte estrutura:

```env
STELLAR_SECRET_KEY=SUA_CHAVE_SECRETA_DA_CONTA_EMISSORA
STELLAR_PUBLIC_KEY=CHAVE_PUBLICA_DA_CONTA_EMISSORA
```

**Essas chaves já estão disponíveis no projeto e não precisam ser alteradas neste momento**, pois funcionam para testes na rede de desenvolvimento da Stellar (Testnet).

### 4. Rode o backend

```bash
cd backend
node app.js
```

### 5. Rode o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

A aplicação estará acessível em `http://localhost:5173`.

---

Agora você pode começar a usar a plataforma: doar livros, ganhar créditos e adotar novas leituras!

Aproveite!!