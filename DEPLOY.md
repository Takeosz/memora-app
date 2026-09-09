# Deploy do Memora

## 1) Backend no Render

Crie um Web Service no Render apontando para este repositório.

### Variáveis de ambiente

- PORT=10000
- NODE_ENV=production
- JWT_SECRET=uma-string-forte-e-aleatoria
- FRONTEND_ORIGIN=https://seu-frontend.vercel.app
- ALLOWED_ORIGINS=https://seu-frontend.vercel.app

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
- O CORS agora aceita a origem do frontend e outras origens listadas

## 2) Frontend no Vercel

Crie um projeto Vercel conectando este repositório.

### Variáveis de ambiente

- VITE_API_URL=https://seu-backend.onrender.com/api

### Build command

```bash
npm run build
```

### Output directory

```bash
dist
```

## 3) Validação após deploy

1. Acesse o frontend
2. Faça cadastro/login
3. Crie um projeto
4. Crie uma memória
5. Faça upload de imagem
6. Salve e recorte se necessário
7. Verifique se as imagens aparecem no card e no preview

## 4) Checklist final

- JWT configurado
- FRONTEND_ORIGIN apontando para o domínio do Vercel
- VITE_API_URL apontando para o domínio do Render
- Uploads funcionando em produção
- CORS liberado corretamente
- Login e autenticação funcionando
