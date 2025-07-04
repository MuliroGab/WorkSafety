# Safety First - Sistema de Gestão de Segurança no Trabalho

## Visão Geral

Este é um sistema abrangente de gestão de segurança no trabalho, construído com uma arquitetura moderna full-stack. O aplicativo oferece ferramentas para treinamentos de segurança, avaliações de risco, gerenciamento de documentos, relatórios de incidentes e resposta a emergências. Possui um frontend em React com componentes do shadcn/ui, backend em Express.js e banco de dados MongoDB com Mongoose ODM.



## Arquitetura do Sistema

### Arquitetura do Frontend
- **Framework**: React 18 com TypeScript
- **Biblioteca de UI**: componentes shadcn/ui baseados em Radix UI
- **Estilização**: Tailwind CSS com paleta de cores personalizada com tema de segurança
- **Gerenciamento de Estado**: TanStack Query para estado do servidor
- **Roteamento**:Wouter para roteamento leve no cliente
- **Formulários**: React Hook Form com validação via Zod
- **Ferramenta de Build**: Vite com otimizações para desenvolvimento
  
### Arquitetura do Backend
- **Framework**: Express.js com TypeScript
- **Banco de Dados**: MongoDB com Mongoose ODM (com fallback em memória)
- **ODM**: Mongoose para operações com documentos MongoDB
- **Autenticação**: Autenticação baseada em sessão com hash de senha usando bcrypt
- **Armazenamento de Sessões**: Sessões armazenadas no MongoDB com fallback em memória usando connect-mongo
- **Uploads de Arquivos**:  Middleware Multer para upload de documentos
- **API**: API RESTful com tratamento abrangente de erros

### Schema do Banco de Dados (MongoDB Collections)
- **Usuários**: Autenticação e gerenciamento de usuários 
- **Cursos de Treinamento**: Conteúdo e metadados dos cursos 
- **Progresso do Usuário nos Cursos**: Acompanhamento da conclusão dos treinamentos
- **Avaliações de Risco**: Listas de verificação de inspeções de segurança
- **Documentos de Segurança**: Armazenamento e categorização de documentos
- **Incidentes de Segurança**: Registro e acompanhamento de incidentes
- **Notificações**: Alertas em tempo real e mensagens
- **Sessões**: Gerenciamento seguro de sessões via connect-mongo ou fallback em memória

## Componentes Principais

### Sistema de Autenticação
- Autenticação baseada em sessão com cookies seguros
- Hash de senha com bcrypt
- Controle de acesso por função (administrador/funcionário)
- Rotas protegidas com middleware
  
### Gestão de Treinamentos
- Cursos interativos com acompanhamento de progresso
- Classificação de cursos obrigatórios e opcionais
- Atualizações em tempo real
- Certificados de conclusão

### Ferramentas de Avaliação de Risco
- Checklists interativos para inspeções
- Classificação do nível de risco (baixo/médio/alto)
- Acompanhamento de status (pendente/em progresso/concluído)
- Visualização do progresso

### Gerenciamento de Documentos
- Upload de arquivos com validação de tipo (PDF, DOC, imagens)
- Categorização de documentos (Procedimentos de Emergência, Equipamentos de Segurança, Conformidade)
- Funções de busca e filtro
- Armazenamento seguro de arquivos

### Resposta a Emergências
- Sistema de alertas de emergência com notificações em tempo real
- Registro e acompanhamento de incidentes
- Tratamento de notificações críticas
- Integração com contatos de emergência

### Painel e Análises
- Métricas de segurança em tempo real
- Acompanhamento de atividades e relatórios
- Gestão de notificações
- Visualização de progresso

## Fluxo de Dados

1. **Fluxo de Autenticação**: Login do usuário → Criação de sessão → Acesso às rotas protegidas
2. **Fluxo de Treinamento**: Seleção do curso → Acompanhamento de progresso → Registro de conclusão
3. **Fluxo de Avaliação**: Carregamento do checklist → Conclusão dos itens → Atualização do progresso
4. **Fluxo de Documentos**: Upload de arquivo → Validação → Armazenamento → Recuperação
5. **Fluxo de Emergência**: Disparo de alerta → Notificação → Acompanhamento da resposta

## Dependências Externas

### Dependências Principais
- **@neondatabase/serverless:**: Conectividade com banco PostgreSQL
- **drizzle-orm**: Operações de banco de dados com segurança de tipos
- **@tanstack/react-query**: Gerenciamento de estado do servidor
- **@radix-ui/***: Componentes de UI acessíveis
- **bcryptjs**: Hash de senha
- **express-session**: Gerenciamento de sessões
- **multer**: Manipulação de upload de arquivos
- **nanoid**: Geração de IDs únicos
  
### Ferramentas de Desenvolvimento
- **vite**: Ferramenta de build e servidor de desenvolvimento
- **typescript**: Tipagem estática
- **tailwindcss**:  CSS utilitário
- **@replit/vite-plugin-***: Integração com Replit

## Estratégia de Implantação

### Ambiente de Desenvolvimento
- Servidor de desenvolvimento Vite com HMR
- Compilação TypeScript com modo estrito
- Migrações automáticas com Drizzle Kit
- Overlay de erros em tempo real para depuração

### Build de Produção
- Build otimizado do Vite para produção
- ESBuild para empacotamento do lado do servidor
- Servir arquivos estáticos com Express
- Configuração baseada em ambiente

### Considerações de Segurança
- Aplicação de HTTPS em produção
- Cookies de sessão seguros
- Validação de arquivos enviados
- Prevenção de injeção SQL via ORM
- Proteção contra XSS usando React
