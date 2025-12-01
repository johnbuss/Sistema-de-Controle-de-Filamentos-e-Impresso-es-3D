# 3DSync Next - Sistema de Controle de Filamentos e Impressões 3D

Sistema moderno de controle de filamentos, impressões 3D e integração com Mercado Livre, construído com Next.js, TypeScript, Tailwind CSS e Firebase.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Firebase/Firestore** - Banco de dados em tempo real
- **Mercado Livre API** - Integração para sincronização de pedidos

## 📦 Funcionalidades

- ✅ Cadastro de filamentos (cor, material, marca, preço/kg, estoque)
- ✅ Cadastro de produtos 3D (SKU, nome, cor padrão, custo)
- ✅ Registro de vendas (manual e via integração ML)
- ✅ Fila de impressão com priorização
- ✅ Registro de impressões (tempo, gramas, custo de energia)
- ✅ Relatórios e KPIs em tempo real
- ✅ Sincronização automática com Mercado Livre

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd 3dsync-next
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Config (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id

# Firebase Admin (Backend - API Routes)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Mercado Livre OAuth
ML_ACCESS_TOKEN=seu-access-token
ML_CLIENT_ID=seu-client-id
ML_CLIENT_SECRET=seu-client-secret
ML_REDIRECT_URI=http://localhost:3000/api/ml-callback

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
3dsync-next/
├── app/
│   ├── api/
│   │   └── ml-sync/          # API route para sincronização ML
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Página principal
│   └── globals.css            # Estilos globais
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Cabeçalho
│   │   └── Sidebar.tsx        # Menu lateral
│   ├── sections/
│   │   └── FilamentosSection.tsx  # Seção de filamentos
│   └── ui/
│       ├── Button.tsx         # Componente de botão
│       └── Card.tsx           # Componente de card
├── lib/
│   ├── firebase.ts            # Configuração Firebase (client)
│   ├── firebase-admin.ts      # Configuração Firebase Admin
│   └── firestore-service.ts   # Serviços do Firestore
├── types/
│   └── index.ts               # Definições de tipos TypeScript
└── .env.local                 # Variáveis de ambiente (não versionado)
```

## 🔄 Integração com Mercado Livre

### Obtendo Access Token

1. Acesse o [Portal de Desenvolvedores do Mercado Livre](https://developers.mercadolivre.com.br/)
2. Crie uma aplicação
3. Configure o redirect URI para: `http://localhost:3000/api/ml-callback`
4. Obtenha o Client ID e Client Secret
5. Use o fluxo OAuth para obter o access token

### Sincronização de Pedidos

A sincronização busca pedidos dos últimos 30 dias automaticamente. Para sincronizar manualmente:

1. Clique no botão "Sincronizar Mercado Livre" no header
2. O sistema irá buscar os pedidos e salvá-los no Firestore
3. Pedidos editados manualmente não serão sobrescritos (proteção de 1 hora)

## 🔥 Firebase

### Coleções do Firestore

- **filaments**: Filamentos cadastrados
- **products**: Produtos 3D
- **orders**: Pedidos/Vendas
- **prints**: Registro de impressões

### Regras de Segurança Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Ajuste conforme necessário
    }
  }
}
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras opções

- **Netlify**: Suporte para Next.js
- **Firebase Hosting**: Requer configuração adicional

## 📝 Próximas Funcionalidades

- [ ] Seção completa de Produtos
- [ ] Seção completa de Vendas
- [ ] Fila de impressão interativa
- [ ] Registro detalhado de impressões
- [ ] Dashboard de analytics
- [ ] Notificações push
- [ ] Export de relatórios (PDF/Excel)
- [ ] Multi-usuários com autenticação

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

MIT

## 👨‍💻 Autor

Sistema desenvolvido para controle de operações 3D da Langeloh.
