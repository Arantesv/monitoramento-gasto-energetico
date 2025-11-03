# ⚡ Monitor de Energia Inteligente

## 🌐 Aplicação na Nuvem

**A aplicação está hospedada na AWS e pode ser acessada publicamente no link abaixo:**

[http://meu-monitor-energia-frontend.s3-website.us-east-2.amazonaws.com](http://meu-monitor-energia-frontend.s3-website.us-east-2.amazonaws.com)

---

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

## 🛠️ Tecnologias e Arquitetura de Nuvem

### 🖥️ FrontEnd (React)
* **React:** Biblioteca principal para a construção da interface.
* **React Context API:** Gerenciamento de estado global (autenticação e dados da aplicação).
* **TailwindCSS:** Framework de estilização utility-first.
* **Recharts:** Biblioteca para a criação dos gráficos de consumo e comparativos.
* **Lucide React:** Pacote de ícones leve e moderno.

### ⚙️ BackEnd (Node.js)
* **Node.js / Express.js:** Framework para a construção da API REST.
* **MySQL (`mysql2/promise`):** Banco de dados relacional.
* **JWT (jsonwebtoken) & bcrypt:** Para autenticação segura e hashing de senhas.
* **Google Gemini API:** Para a funcionalidade de análise inteligente.

### ☁️ Infraestrutura de Nuvem (AWS) e CI/CD
Este projeto é implantado automaticamente na AWS usando GitHub Actions, seguindo as melhores práticas de CI/CD.

* **GitHub Actions (CI/CD):** Automatiza os processos de build e deploy. Qualquer `push` para a branch `main` dispara os pipelines que atualizam o FrontEnd e o BackEnd.
* **AWS S3 (Simple Storage Service):** Hospeda o aplicativo FrontEnd (React), servindo os arquivos estáticos (HTML, CSS, JS) para o mundo.
* **AWS RDS (Relational Database Service):** Fornece um banco de dados MySQL gerenciado, seguro e escalável.
* **Docker:** O BackEnd é containerizado para garantir consistência entre o desenvolvimento e a produção.
* **Amazon ECR (Elastic Container Registry):** Armazena as imagens Docker do nosso BackEnd.
* **Amazon ECS (Elastic Container Service) com AWS Fargate:** Executa o container do BackEnd de forma *serverless*, gerenciando a execução, saúde e escalabilidade da API sem a necessidade de gerenciar servidores.

## 📖 API Endpoints

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