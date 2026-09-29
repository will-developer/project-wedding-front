# wedding-front

Frontend do site do meu casamento: o convidado digita o código do convite, vê o grupo dele,
opcionalmente escolhe presentes de uma lista (catálogo de produtos e cotas em dinheiro) e
confirma presença. Consome a API em [`wedding-api`](https://github.com/will-developer/project-wedding-back).

> Projeto pessoal em construção, documentado publicamente como parte do meu aprendizado.

## Status

🚧 Em desenvolvimento inicial. Ainda não há telas reais de convidado.

- [x] Esqueleto do projeto (Vite, React, TypeScript)
- [x] Chamada de teste à API do backend (integração local funcionando)
- [x] Deploy configurado (Cloudflare Workers via Wrangler)
- [ ] Tela de código de convite
- [ ] Catálogo de presentes e carrinho
- [ ] Confirmação de presença (RSVP)
- [ ] Painel administrativo

## Stack

- **React 19** + **TypeScript**, via **Vite**
- **Axios** para chamadas à API
- Deploy em **Cloudflare Workers** (assets estáticos via Wrangler)

## Rodando localmente

Pré-requisitos: Node.js e o backend ([`wedding-api`](https://github.com/will-developer/project-wedding-back))
rodando em `http://localhost:8080`.

```bash
npm install
cp .env.example .env
npm run dev
```

O `.env` define `VITE_API_URL`, a URL do backend que o front vai chamar.

## Ambientes

| Ambiente | Onde roda | Branch |
|---|---|---|
| Local | Máquina do desenvolvedor (`npm run dev`) | branches de trabalho |
| Homologação | Cloudflare Workers | `develop` |
| Produção | A definir | `main` |

Mais decisões e convenções em [`AGENTS.md`](AGENTS.md).

## Licença

Projeto pessoal, sem licença de reuso definida.
