# ⚡ Monitor de Energia Inteligente

Um dashboard full-stack para monitoramento de consumo de energia residencial. A aplicação permite que os usuários cadastrem cômodos e aparelhos, calculem o consumo mensal e recebam análises e dicas de economia geradas por Inteligência Artificial (Google Gemini).

Este projeto foi desenvolvido com uma arquitetura moderna, separando o FrontEnd (React com Context API) do BackEnd (Node.js/Express) para melhor manutenibilidade e escalabilidade.

## 🚀 Funcionalidades Principais

* **Autenticação de Usuários:** Sistema completo de Cadastro e Login usando JWT (JSON Web Tokens) e `bcrypt` para segurança.
* **Dashboard Detalhado:** Visão geral do consumo total (kWh e R$), gráficos de consumo por categoria e por cômodo, e um ranking com os 5 aparelhos que mais consomem.
* **Gerenciamento CRUD:**
    * Criação, listagem e exclusão de **Cômodos**.
    * Criação, listagem, edição e exclusão de **Aparelhos** dentro de cada cômodo.
* **Página de Comparativos:** Compara o consumo do usuário com a média de outros usuários da plataforma e com a média de consumo residencial no Brasil.
* **Análise Inteligente com IA:**
    * Integração com a API do **Google Gemini**.
    * Gera uma expectativa de consumo (IA) vs. o consumo real para cada cômodo.
    * Fornece dicas de economia personalizadas para os cômodos que estão gastando acima do esperado.

## 🛠️ Tecnologias Utilizadas

### 🖥️ FrontEnd
* **React:** Biblioteca principal para a construção da interface.
* **React Context API:** Gerenciamento de estado global (autenticação e dados da aplicação).
* **TailwindCSS:** Framework de estilização utility-first.
* **Recharts:** Biblioteca para a criação dos gráficos de consumo e comparativos.
* **Lucide React:** Pacote de ícones leve e moderno.

### ⚙️ BackEnd
* **Node.js:** Ambiente de execução do servidor.
* **Express.js:** Framework para a construção da API REST.
* **MySQL:** Banco de dados relacional (utilizando `mysql2/promise`).
* **JWT (jsonwebtoken):** Para geração e verificação de tokens de autenticação.
* **bcrypt:** Para hashing seguro de senhas.
* **Google Gemini API:** Para a funcionalidade de análise inteligente.

## 🏃‍♂️ Como Rodar o Projeto

Para rodar este projeto, você precisará ter o **Node.js** e um servidor **MySQL** em execução.

### 1. Configuração do BackEnd

O BackEnd é responsável por servir a API e se comunicar com o banco de dados.

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz da pasta `backend/` com base no seu arquivo `.env.example` (se tiver um) ou copie o modelo abaixo. Você **precisa** preencher estas variáveis:

    ```.env
    # Configuração do Banco de Dados
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua_senha_do_mysql
    DB_NAME=energia_db
    
    # Chave secreta para o JWT 
    JWT_SECRET=energia_secret_2024_muito_seguro
    
    # Chave da API do Google Gemini
    GEMINI_API_KEY=SUA_CHAVE_DA_API_GEMINI_AQUI
    ```

4.  **Configure o Banco de Dados:**
    * Certifique-se de que seu servidor MySQL está rodando.
    * Crie um banco de dados com o nome que você definiu em `DB_NAME` (ex: `CREATE DATABASE energia_db;`).
    * O servidor criará as tabelas (`usuarios`, `comodos`, `aparelhos`) automaticamente na primeira vez que for iniciado (graças à função `initDatabase`).

5.  **Inicie o servidor backend:**
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3001`.

### 2. Configuração do FrontEnd

O FrontEnd é a aplicação React que o usuário acessa no navegador.

1.  **Abra um novo terminal** e navegue até a pasta do frontend:
    ```bash
    cd frontend 
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie a aplicação React:**
    ```bash
    npm start
    ```
    A aplicação será aberta automaticamente no seu navegador em `http://localhost:3000`.

Agora você pode se cadastrar, fazer login e começar a usar o sistema!

## API Endpoints

O BackEnd segue uma arquitetura RESTful. Todas as rotas são prefixadas com `/api`.

* `POST /api/auth/register` - Cria um novo usuário.
* `POST /api/auth/login` - Autentica um usuário e retorna um JWT.
* `GET /api/auth/me` - Retorna os dados do usuário logado (requer token).
* `GET /api/comodos` - Lista todos os cômodos do usuário (requer token).
* `POST /api/comodos` - Cria um novo cômodo (requer token).
* `DELETE /api/comodos/:id` - Deleta um cômodo (requer token).
* `POST /api/aparelhos` - Cria um novo aparelho (requer token).
* `PUT /api/aparelhos/:id` - Atualiza um aparelho (requer token).
* `DELETE /api/aparelhos/:id` - Deleta um aparelho (requer token).
* `GET /api/consumo` - Relatório de consumo por aparelho (requer token).
* `GET /api/relatorio/mensal` - Relatório de consumo por cômodo (requer token).
* `GET /api/estatisticas/por-categoria` - Relatório de consumo por categoria (requer token).
* `GET /api/estatisticas/media-geral` - Média de consumo de todos os usuários.
* `GET /api/estatisticas/media-brasil` - Média de consumo do Brasil (dados estáticos).
* `GET /api/ia/analise-consumo` - Gera a análise completa com IA (requer token).