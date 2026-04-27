# Aria English Platform

Plataforma de ensino de inglês com IA — Aria Coach.

## Configuração rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar em desenvolvimento
```bash
npm run dev
```
Abre automaticamente em http://localhost:5173

### 3. Build para produção
```bash
npm run build
```

---

## Estrutura do projeto

```
aria-english/
├── src/
│   ├── App.jsx        ← TODO o código está aqui (componente único)
│   └── main.jsx       ← Entry point React
├── index.html         ← HTML base
├── vite.config.js     ← Config do Vite
└── package.json       ← Dependências
```

---

## Onde editar as coisas principais (tudo em src/App.jsx)

| O que mudar | Onde está em App.jsx |
|---|---|
| 🔗 URL do webhook Make.com | `const MAKE_WEBHOOK_URL = "..."` — linha ~41 |
| 🏆 Prêmio do mês | `const PRIZE = { ... }` — linha ~67 |
| 📚 Conteúdo das aulas | `const LEARN_MODULES = [...]` — linha ~88 |
| 👩‍🏫 Professores p/ agendamento | `const FALLBACK_TEACHERS = [...]` |
| ⏰ Horários disponíveis | `const FALLBACK_SLOTS = [...]` |
| 🎓 Níveis da Aria (A1–C2) | `const LEVELS = [...]` |
| 📅 Dias para unlock de aula | `const DAYS_TO_UNLOCK = 7` |

---

## Deploy no Lovable

1. Suba este projeto no GitHub
2. Importe no [lovable.dev](https://lovable.dev) via GitHub
3. Lovable faz deploy automático em `seuapp.lovable.app`

## Deploy no Vercel

```bash
npm install -g vercel
vercel
```

---

## Tecnologias
- React 18
- Vite 5
- CSS-in-JS (inline styles)
- Make.com webhook (backend/IA)
- ElevenLabs API (voz humana — opcional)
- Web Speech API (fallback de voz)
