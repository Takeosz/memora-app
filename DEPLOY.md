# Deploy do Memora

## 1) Backend no Render

Crie um Web Service no Render apontando para este repositório.

### Variáveis de ambiente

- PORT=10000
- NODE_ENV=production
- JWT_SECRET=uma-string-forte-e-aleatoria
- FRONTEND_ORIGIN=https://memora-app-theta.vercel.app
- ALLOWED_ORIGINS=https://memora-app-theta.vercel.app

### Build command

```bash
npm install
```

### Start command

```bash
npm start
```

### Observações

- O backend expõe a API em /api
- Os uploads ficam em /uploads
- O CORS agora aceita domínios Vercel e outras origens configuradas
- Em produção, os cookies de sessão usam `SameSite=None` e `Secure`, então o frontend e o backend precisam estar em domínios diferentes com HTTPS

## 2) Frontend no Vercel

Crie um projeto Vercel conectando este repositório.

### Variáveis de ambiente

- VITE_API_URL=https://SEU-APP-RENDER.onrender.com/api

### Build command

```bash
npm run build
```

### Output directory

```bash
dist
```

### Importante

- O backend em Render deve responder em HTTPS
- A URL do frontend usada no `FRONTEND_ORIGIN` do Render deve corresponder ao domínio real da Vercel
- Caso use preview do Vercel, a origem do preview também funciona por causa da regra `*.vercel.app`

## 3) Validação após deploy

1. Acesse o frontend no Vercel
2. Faça cadastro/login
3. Verifique se o cookie de sessão é criado e persistido
4. Acesse o dashboard
5. Crie um projeto
6. Crie uma memória
7. Faça upload de imagem
8. Verifique se as imagens aparecem no card e no preview

## 4) Checklist final

- JWT configurado
- FRONTEND_ORIGIN apontando para o domínio do Vercel
- ALLOWED_ORIGINS incluindo o domínio do Vercel
- VITE_API_URL apontando para o domínio do Render
- Uploads funcionando em produção
- CORS liberado corretamente
- Login e autenticação funcionando
