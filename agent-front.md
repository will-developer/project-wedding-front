# Guia de implementação e revisão do frontend

Revisado em **26/11/2026** a partir do frontend e do backend locais. Leia junto com `AGENTS.md` antes de cada entrega. Este guia orienta decisões; confirme os contratos no código quando a API mudar. Instruções atuais do usuário têm prioridade.

## 1. Escopo e ponto de partida

- A base atual é React 19, TypeScript 6, Vite 8 e Axios. A interface ainda é scaffolding de hello-world.
- Router, TanStack Query, React Hook Form, Zod e ferramentas de teste **não estão instalados**. São opções futuras, não requisitos já atendidos.
- Desenvolver por fluxo utilizável e commits pequenos. Explicar o comportamento, os arquivos envolvidos e como verificar cada entrega.
- Backend decide autenticação, autorização, prazo, preço, estoque e vínculo da pessoa com a família. O front apresenta dados e envia intenções.
- Implementar agora acesso, convite, RSVP, catálogo e painel admin sobre os contratos existentes.
- Gateway fica para depois de finalizar o front. R2/upload foi desfeito; `imageUrl` HTTPS é opcional por enquanto.
- Não criar checkout, reserva, pagamento, upload ou ajuste de quantidade sem contrato backend. Não simular sucesso dessas ações.
- Não editar README, instalar dependências, fazer stage/commit/push ou alterar histórico sem autorização aplicável à tarefa.

## 2. Organização suficiente para crescer

### Estrutura adotada neste projeto

Organizar por funcionalidade (feature), mantendo juntos os arquivos que mudam pelo mesmo motivo. Esta é uma decisão do projeto, não uma estrutura obrigatória do React. A árvore abaixo é a referência para evolução; criar somente os arquivos necessários à entrega atual.

```text
src/
  main.tsx                     # entrada: monta React e importa CSS global
  App.tsx                      # composição principal, sem regras de formulário
  app/
    routes.tsx                 # composição das rotas, quando houver router
    providers.tsx              # composição dos providers realmente utilizados
    layouts/                   # estrutura visual das áreas guest/admin
  features/
    session/
      GuestLoginPage.tsx
      GuestLoginForm.tsx
      TurnstileChallenge.tsx
      useGuestLogin.ts
      session.api.ts
      session.types.ts
    invitation/
      InvitationPage.tsx
      GuestList.tsx
      GuestRsvpRow.tsx
      useInvitation.ts
      invitation.api.ts
      invitation.types.ts
    event/                     # edição e apresentação de evento
    invite-groups/             # cadastro/listagem administrativa de famílias
    gifts/                     # catálogo guest e manutenção admin
  components/
    ui/                        # controles visuais compartilhados e sem domínio
  lib/
    api.ts                     # Axios, cookies e CSRF comuns
  styles/
    tokens.css                 # cores, espaçamento, tipografia quando definidos
    global.css                 # base global; pode começar no index.css existente
```

- Começar com arquivos diretamente na feature. Criar `components/`, `hooks/` ou `api/` internos somente quando o volume justificar; não gerar pastas vazias.
- Página, formulário, hook e arquivo API não são quatro arquivos obrigatórios por tela. Uma entrega pequena pode começar com página + API + tipos e ganhar extrações com responsabilidade clara.
- `session` concentra acesso e ciclo de sessão ADMIN/GUEST; `invitation` concentra consulta do convite e RSVP. Não misturar cadastro admin de famílias com resposta do convidado só porque ambos exibem pessoas.
- `gifts` pode ter páginas distintas ADMIN/GUEST e funções específicas por contrato. Compartilhar uma apresentação de presente quando ela realmente servir aos dois fluxos; não unificar formulários e permissões por dezenas de flags.
- Manter testes e estilos específicos perto do código: `GuestLoginForm.test.tsx`, `GuestLoginForm.module.css`. Usar CSS Modules para estilos locais quando surgirem; CSS global fica restrito à base e aos tokens. Não instalar CSS-in-JS para começar.
- Componentes em PascalCase; hooks em `useNome.ts`; arquivos API/tipos com nome da feature. Usar inglês nos identificadores e português nos textos da interface.

### Responsabilidade de cada parte

| Parte | Deve fazer | Deve evitar |
|---|---|---|
| Página | Compor a tela, integrar dados/ações e decidir estados de carregamento, vazio e erro | Acumular todo JSX, transporte, normalização e regras de cada input |
| Formulário | Possuir o rascunho, validar entrada e emitir submit tipado; apresentar erros de campos | Conhecer Axios, cookie, URL do backend ou navegar por conta própria sem motivo |
| Componente de domínio | Apresentar uma unidade coerente como pessoa, local ou presente; emitir ações por callbacks | Ser promovido a componente global enquanto só serve à sua feature |
| Componente UI | Oferecer aparência/interação acessível e props sem regra do casamento | Consultar sessão/API ou decidir quem pode confirmar presença |
| Hook de feature | Coordenar um comportamento com estado/efeitos, requisições, cancelamento e resultado da operação | Virar um arquivo que contém toda a lógica da tela sem limites, ou repetir estado já possuído pelo formulário |
| Função API | Executar uma operação com o cliente compartilhado e devolver resposta tipada | Usar hooks, abrir toast, alterar estado React ou redirecionar |
| Função pura | Transformar/validar dados sem efeitos, como montar payload de recepção | Ser chamada `use...` sem usar hooks; depender do DOM ou de uma sessão oculta |
| Tipos | Representar contrato HTTP ou props/rascunho com nomes distintos | Tratar response como formulário e enviar todos seus campos ao backend |

O formulário pode receber `onSubmit`, `pending` e erros do hook consumido pela página. Ele mantém os inputs; o hook mantém o andamento da operação. Não copiar o mesmo rascunho para os dois. Se um fluxo simples ficar mais claro com a operação na página, manter assim até haver motivo para um hook.

### Exemplo de separação: confirmar presença

1. `invitation.api.ts`: `updateGuestRsvp(guestId, { attending })` chama o PUT existente e devolve `GuestResponse`. Não conhece texto de botão nem componente.
2. `useInvitation.ts`, quando necessário: possui o convite e o andamento por pessoa; chama a API e substitui somente a pessoa retornada. Não mantém uma segunda cópia da lista em outro hook/context.
3. `InvitationPage.tsx`: apresenta o contexto do evento e compõe `GuestList` com dados e callbacks.
4. `GuestRsvpRow.tsx`: recebe pessoa, estado pendente e callback `onRespond(attending)`. Renderiza nome/status/controles acessíveis; não acessa Axios nem recebe o setter interno da lista.

Esse fluxo separa transporte, coordenação e apresentação. Não é necessário criar um `RsvpRepository`, uma classe service ou um mapper genérico no browser.

### Quando extrair ou compartilhar

- Extrair componente quando houver uma unidade visual com responsabilidade própria, comportamento/foco independente ou repetição real. Quantidade de linhas é sinal para revisar, não uma regra de corte.
- Manter trechos curtos de JSX juntos quando a extração só acrescentar nomes e repasse de props. Não criar componente para cada `div`.
- Hooks compartilham lógica com estado; cada chamada tem seu próprio estado. Para compartilhar a mesma instância de dados, elevar o dono ao ancestral comum, usar Context com escopo definido ou cache de servidor quando adotado.
- Usar funções puras para lógica que não precisa do ciclo React. Não criar `useFormatPrice` para apenas chamar `Intl.NumberFormat`.
- Props descrevem intenções e dados mínimos: `onRespond`, `onSubmit`, `pending`, `error`. Evitar passar o objeto inteiro da aplicação ou setters genéricos a toda a árvore.
- Preferir composição com `children`/elementos para variações de layout. Evitar componentes “universais” com flags como `isAdmin`, `isGuest`, `isEdit`, `isLogin` que mudam sua finalidade inteira.
- Compartilhar no escopo mais próximo: primeiro componente local, depois feature; mover para `components/ui` quando for independente de domínio e houver uso concreto. Duas telas parecidas podem ter regras diferentes.
- Não definir componentes dentro da função de outro componente: a identidade muda nos renders e pode reiniciar estado/foco. Declarar no módulo ou em arquivo próprio.

### Dependências entre arquivos

- Direção padrão: `app` compõe features; features usam `lib` e UI compartilhada. `lib` e UI não importam features nem `app`.
- Uma feature não importa arquivos internos de outra para alcançar estado/efeitos escondidos. A composição entre fluxos ocorre na página/app; quando surgir dependência legítima, expor uma função/tipo com dono claro.
- Não criar um `shared/` ou `utils.ts` genérico para despejar tudo. Nomear utilitários pelo assunto e mantê-los locais até existir compartilhamento real.
- Tipos de props exclusivos ficam junto ao componente; DTOs usados nas chamadas ficam em `*.types.ts` da feature. Preferir `import type` para tipos.
- Não criar `index.ts` em cada pasta. Uma API pública de feature pode ganhar um barrel pequeno quando houver consumidores reais, sem reexportar seus detalhes internos nem criar ciclos.
- Não espalhar a mesma regra de normalização/payload pelos componentes. Dar a ela um único dono e testes quando houver comportamento relevante.
- `App.tsx` deixa de conter o hello-world conforme os fluxos forem implementados; não migrar o projeto inteiro nem instalar ferramentas para antecipar essa árvore.

### Estado e ferramentas

- Usar `app/` para composição/rotas/provedores e `features/` para os fluxos que existirem: sessão, convite, evento, famílias e presentes.
- Cada feature pode começar com página, funções API e tipos. Criar pastas quando houver conteúdo; evitar camadas repository/service/DI copiadas do Java.
- Todas as chamadas ao nosso backend passam por `src/lib/api.ts`. Funções por operação montam payloads e retornam dados; não abrem modal nem navegam.
- Componentes cuidam da interação/apresentação. Extrair hook ou componente quando houver responsabilidade clara ou repetição real.
- Inputs e filtros ficam perto do uso. Context pode compartilhar sessão e ações de autenticação, sem virar depósito de toda a aplicação.
- Modelar estados mutuamente exclusivos com unions discriminadas. Distinguir sessão carregando, anônima, ADMIN, GUEST e falha de restauração.
- Derivar contagens, listas filtradas e local da recepção a partir dos dados originais. Não duplicar valores calculáveis em estado.
- Introduzir roteamento quando as páginas precisarem de URL própria; React Router Declarative é uma opção inicial adequada. Não misturar carregamentos duplicados entre router e hooks.
- Considerar TanStack Query quando leituras compartilhadas/invalidações repetidas justificarem. Não construir cache artesanal amplo para evitar uma dependência útil.
- Se usar Query: revisar retries/refetch, limpar cache privado ao trocar sessão e incluir identificadores disponíveis nas keys. Não inventar `groupId` no DTO guest.
- Formulários pequenos podem usar React/HTML. Avaliar RHF para convidados dinâmicos; Zod quando validação runtime/reuso de schemas justificar, sem instalar por hábito.
- TypeScript 6 já habilita `strict` por padrão. Tipagem estática/Axios `<Tipo>` não validam JSON em runtime.

As escolhas de nomes/pastas acima são convenções locais. Os fundamentos são decomposição por responsabilidade, fluxo explícito de props, estado mínimo com dono definido e hooks para comportamentos React. Referências: [Thinking in React](https://react.dev/learn/thinking-in-react), [custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks), [estrutura do estado](https://react.dev/learn/choosing-the-state-structure) e [estado compartilhado](https://react.dev/learn/sharing-state-between-components).

## 3. Contratos HTTP atuais

Todas as mutações abaixo exigem CSRF, inclusive login e logout. ADMIN e GUEST são roles distintas. `E`, `P` e `G` representam UUIDs de evento, pessoa e presente.

| Acesso | Método e rota | Entrada / resultado esperado |
|---|---|---|
| Público | GET `/api/auth/csrf` | 200 `{headerName,token}`; não comprova login |
| Público | POST `/api/auth/login` | form-urlencoded `username,password`; 204 sem corpo, sessão ADMIN |
| ADMIN | GET `/api/auth/me` | 200 `{login,role:"ADMIN"}` |
| Sessão atual | POST `/api/auth/logout` | 204 sem corpo; encerra sessão compartilhada |
| Público | POST `/api/guest/login` | JSON `{code,turnstileToken?}`; 204 sem corpo, sessão GUEST |
| GUEST | GET `/api/guest/invitation` | `{event,groupName,guests}` |
| GUEST | PUT `/api/guest/guests/{P}/rsvp` | `{attending:boolean}`; retorna uma pessoa |
| GUEST | GET `/api/guest/gifts` | presentes ativos, inclusive esgotados; sem `eventId` |
| ADMIN | GET `/api/admin/events` | array vazio ou com um evento |
| ADMIN | POST `/api/admin/events?receptionAtCeremonyLocation={boolean}` | evento completo; 201 |
| ADMIN | PUT `/api/admin/events/{E}?receptionAtCeremonyLocation={boolean}` | evento completo; 200 |
| ADMIN | GET `/api/admin/events/{E}/invite-groups` | famílias cadastradas |
| ADMIN | POST `/api/admin/events/{E}/invite-groups` | `{groupName,notes?,guests:[{name,isChild}]}`; 201 |
| ADMIN | GET `/api/admin/events/{E}/gifts` | todos os presentes, ativos e inativos |
| ADMIN | POST `/api/admin/events/{E}/gifts` | `{name,description?,imageUrl?,price,totalQuantity}`; 201 |
| ADMIN | PUT `/api/admin/events/{E}/gifts/{G}` | `{name,description?,imageUrl?,price}`; 200 |
| ADMIN | PATCH `/api/admin/events/{E}/gifts/{G}/active?active={boolean}` | sem body; estado explícito; 200 |

Não existem atualmente `/api/guest/me`, identidade genérica, edição/exclusão de famílias/pessoas, compra, upload ou edição de quantidade de presentes.

### Tipos de transporte e payloads

- Declarar request/response específicos por operação; não criar uma interface universal cheia de opcionais nem reutilizar DTO admin no guest.
- `GuestResponse`: `id,name,isChild,rsvpStatus,respondedAt`; `respondedAt` é `string | null`.
- `RsvpStatus`: `'pending' | 'confirmed' | 'declined' | 'expired'`, preservando os nomes da API.
- `GuestInvitationResponse`: `event,groupName,guests`; não contém código do convite, notas ou identificador de grupo.
- Evento guest: `title,eventDate,ceremonyLocation,receptionLocation,ceremonyMapsUrl,receptionMapsUrl,rsvpDeadline`; admin acrescenta `id,createdAt`.
- Família admin: `id,eventId,groupName,inviteCode,notes,createdAt,guests`.
- Presente guest: `id,name,description,imageUrl,price,availableQuantity`; admin acrescenta `eventId,totalQuantity,active`.
- Tratar recepção, descrição, imagem, notas e `respondedAt` conforme nullability do DTO. Não substituir null por informação inventada.
- Montar uma lista explícita de campos no submit. Nunca enviar `{...response}` em PUT com ID, estoque, timestamps e campos não editáveis.
- PUT de evento/presente é atualização completa dos campos editáveis; omitir opcionais pode limpá-los. Não tratá-lo como PATCH parcial.
- Sucesso 204 não tem JSON para desserializar.

## 4. Sessão, CSRF e privacidade

- Autenticação usa cookie `SESSION` HttpOnly. Não ler/manipular o cookie por JavaScript nem substituí-lo por token em localStorage.
- Cookie identifica a sessão; CSRF protege a mutação. Ter cookie não dispensa o header CSRF em POST/PUT/PATCH/DELETE.
- Manter `withCredentials:true`. Não desativar CSRF ou liberar CORS geral para contornar 403.
- Login troca o contexto e renova a sessão/CSRF. No mesmo navegador, login ADMIN e GUEST substituem o papel anterior.
- Aguardar login/logout antes de carregar dados dependentes ou enviar outras mutações; impedir transições de autenticação concorrentes.
- Para restaurar a área ADMIN, usar `/api/auth/me`; para GUEST, `/api/guest/invitation`. `/csrf` é público e não restaura identidade.
- Não existe endpoint único de identidade. Uma landing que precise descobrir qualquer role exige sequência controlada ou mudança futura de contrato.
- 401 em leitura protegida indica ausência/invalidação de autenticação; falha de rede/503 não significa “deslogado”.
- 403 pode ser role incorreta, CSRF ou desafio. Não limpar sessão/redirecionar para login em todo 403.
- Guards de rota melhoram UX; autorização continua no backend. Não buscar dados ADMIN para depois escondê-los com CSS.
- Em logout/troca de família/role, cancelar leituras antigas e limpar dados privados/cache antes de mostrar a nova área.
- Não persistir código, senha, SESSION, token Turnstile, lista familiar ou role como verdade de autenticação em storage/URL/logs/analytics.
- Sessão GUEST expira por inatividade em 30 minutos; cookie com duração maior não prolonga a sessão no servidor.

### Interceptor atual: manter limites explícitos

- `api.ts` faz GET CSRF antes de cada mutação e usa `headerName/token` retornados. É uma escolha simples atual, não exigência de token novo por endpoint.
- Há custo de um GET adicional. Não adicionar outro GET CSRF em cada componente, duplicando o interceptor.
- Possível corrida inicial: mutações anônimas concorrentes podem obter sessões diferentes antes de existir cookie comum. Não foi reproduzida nesta pesquisa.
- Prevenir duplo envio e coordenar bootstrap/autenticação. Cache/single-flight de CSRF só entra com motivo e teste de rotação/corrida.
- Não repetir login, POST ou escrita automaticamente em interceptor. Timeout pode ocorrer depois de a API salvar; consultar estado quando necessário.

## 5. Login e Turnstile progressivo

- Um input textual com label “Código do convite” e ajuda “6 letras ou números”. Preservar colagem, seleção e zeros iniciais.
- No submit, normalizar com trim e maiúsculas; validar `A-Z0-9` com seis caracteres. Não remover espaços internos silenciosamente.
- Evitar `type=number`, seis inputs com avanço automático, teclado só numérico e bloqueio de colar.
- Não aplicar `maxLength=6` que trunque código colado com espaços externos antes de normalizar. Validar o valor normalizado.
- Usar `<form onSubmit>`; Enter e botão seguem o mesmo handler. Enquanto pendente, guard no handler e botão impedem novo envio.
- O backend exige Turnstile após três códigos inválidos na janela, por origem/IP, não por formulário/família/cookie.
- Outra família na mesma rede pode receber desafio na primeira tentativa. Descrever a verificação sem acusar a pessoa.
- Renderizar por `turnstileRequired` da resposta e usar `siteKey/action` recebidos; não decidir por contador local de cliques.
- Carregar widget condicionalmente pela integração oficial; cuidar de render/reset/remove e cleanup no React/StrictMode.
- Secret key e Siteverify ficam no backend. Site key é pública. Token fica somente em memória.
- Token expira em cinco minutos e destina-se a uso único: descartar após tentativa que o enviou, mesmo se o código estava errado; resetar para nova tentativa.
- Em expiração/erro/timeout do widget, limpar token e permitir resolver novamente, preservando o código digitado.
- Limite atual: dez tentativas totais em quinze minutos por origem; sucesso não zera contadores. Não prometer proteção absoluta contra ataque distribuído.

### Interpretar status junto com contexto e body

| Resposta | Conduta da interface |
|---|---|
| Login 401 `INVALID_INVITATION_CODE` | código não aceito; mostrar desafio se `turnstileRequired=true` |
| Login 403 `TURNSTILE_REQUIRED` | obter nova verificação; pode ser token ausente, recusado, expirado ou contexto incorreto |
| Login 429 `TOO_MANY_ATTEMPTS` | informar limite e aguardar; sem repetição automática |
| Login 400 `INVALID_LOGIN_PAYLOAD` | verificar payload/integração; mensagem segura, sem culpar credencial |
| Login 503 `LOGIN_UNAVAILABLE` / `TURNSTILE_UNAVAILABLE` | indisponibilidade; preservar input e oferecer nova tentativa manual |
| MVC 400 com `errors` | mapear campos conhecidos, inclusive `guests[0].name`; fallback geral para o restante |
| Protegido 401 | encerrar apresentação de dados privados e oferecer novo acesso |
| 403 sem body | distinguir role/CSRF na integração; sem logout global ou retry cego |
| 404 / 409 | mensagem de recurso/regra conforme operação; RSVP 409 requer atualizar convite/prazo |
| Rede, 5xx ou formato inesperado | erro recuperável seguro; não converter em lista vazia nem renderizar HTML recebido |

- Login usa JSON próprio `{code,turnstileRequired,siteKey?,action?}`; MVC usa ProblemDetail `{status,title,detail,instance,errors?}`; filtros podem retornar corpo vazio.
- Não comparar texto inglês de `detail` para decidir regra de negócio. Ter fallback para código/formato desconhecido.
- Preferência de William (26/11/2026): apresentar falhas de operação em toasts com mensagens em português, mapeadas por código HTTP/domínio e contexto da operação. Não exibir `detail` técnico bruto nem usar tradução automática em runtime. Erros ligados a campos mantêm identificação acessível no campo; evitar notificações duplicadas para a mesma falha.
- A função API apenas rejeita/retorna o resultado; a camada de interação decide a notificação. Não disparar toast global para todo 403, cancelamento ou requisição de fundo. Um desafio Turnstile precisa continuar disponível na página, não apenas ser mencionado em toast.
- `Retry-After` atual é **900 segundos fixos**, não restante calculado; CORS não o expõe ao JS cross-origin. Tratá-lo como opcional e não mostrar contagem regressiva precisa ou hardcode de desbloqueio.

## 6. Formulários de evento e famílias

- Evento: título obrigatório até 160; cerimônia até 200; URL Maps HTTPS obrigatória até 2048; data/hora do evento e data limite obrigatórias.
- Checkbox nativo controla `receptionAtCeremonyLocation` obrigatório na query, tanto no POST quanto no PUT.
- Se true, enviar recepção e URL null/omitidas; se false, exigir os dois campos (local até 200, URL HTTPS até 2048).
- Não enviar URL inválida em campo oculto: validação DTO ocorre antes do serviço. Pode preservar rascunho local no toggle, mas limpar payload quando true.
- Na leitura, recepção null usa local e mapa da cerimônia. Não duplicar valores persistidos por conveniência visual.
- Famílias: `groupName` e nome de cada pessoa obrigatórios até 160; ao menos uma pessoa; `isChild` boolean obrigatório; notas opcionais.
- Cada pessoa tem seu controle de criança; contagens derivam da lista. Não inferir idade pelo nome nem exigir CPF/email/endereço inexistentes no contrato.
- Admin cadastra a família; convidado só responde pessoas já vinculadas. Adicionar/remover linhas é edição de rascunho, não endpoint de exclusão.
- Erros de listas precisam apontar a pessoa/campo certo; após remover linha, manter foco previsível e keys estáveis no rascunho.

## 7. RSVP por pessoa e prazo no servidor

- Mostrar quatro estados: aguardando resposta, confirmado, recusado e prazo encerrado sem resposta.
- `expired` é derivado pelo backend para `pending` após o prazo; não grava resposta nem muda `respondedAt:null`.
- `attending` é boolean obrigatório. Não usar ausência/null como recusa ou fabricar timestamp no navegador.
- Cada PUT responde uma pessoa. Bloquear/indicar pending por pessoa e aplicar o `GuestResponse` devolvido após sucesso.
- Não anunciar “família confirmada” após atualizar só uma pessoa; não simular transação em lote inexistente.
- Preferir atualização após sucesso inicialmente. Erro preserva último estado confirmado; timeout ambíguo pede reconsulta.
- Repetir a mesma resposta preserva timestamp no backend; mudar resposta atualiza-o enquanto o prazo estiver aberto.
- Prazo inclui todo o dia `rsvpDeadline` em `America/Sao_Paulo`. Depois dele, qualquer PUT RSVP retorna 409.
- Relógio local pode orientar mensagem/controle, mas servidor decide; tratar 409 e recarregar convite mesmo se o botão parecia disponível.
- Pessoa fora da família recebe 404. Nunca oferecer acesso a pessoa arbitrária por ID vindo de URL sem validação backend.

## 8. Datas, preço e catálogo

- `rsvpDeadline` é `YYYY-MM-DD` sem horário: manter string de data no input/transporte e formatar componentes para exibir, sem UTC→Brasília.
- `eventDate`, `createdAt` e `respondedAt` são instantes ISO. Exibir com locale `pt-BR` e fuso explícito `America/Sao_Paulo` quando representar horário do evento.
- `datetime-local` não contém fuso: não converter com `new Date(valor)` supondo que o computador do admin está em Brasília. Definir conversão explícita e testar outro fuso na entrega de edição.
- Preço: formato BRL com `Intl.NumberFormat`; API exige mínimo 0.01, até oito dígitos inteiros e duas casas decimais.
- Draft numérico pode ser string para representar vazio/parcial. Validar valor inteiro/decimal completo, sem `parseFloat` que aceita lixo após prefixo.
- Backend é autoridade de preço/estoque. Se cálculo auxiliar surgir, usar centavos inteiros validados ou solução decimal justificada.
- Criação de presente exige `totalQuantity` inteiro >= 1; edição não aceita quantidade. Não mostrar controle de ajuste ainda.
- `active=false` e `availableQuantity=0` são dimensões diferentes. Ativar não repõe estoque.
- Catálogo guest recebe só ativos, inclusive esgotados. Mostrar “Esgotado” explicitamente; falha de API não é catálogo vazio.
- Imagem é URL HTTPS direta opcional; resultado do Google Images não garante asset utilizável ou durável. Sem upload nesta fase.
- Reservar área/aspect-ratio, fallback local estável para null/erro e alt contextual. Evitar loop no `onError` e variantes `srcset` inexistentes.
- Lazy-load em imagens fora da viewport; não aplicar lazy à imagem principal candidata a LCP nem prioridade alta a todos os cards.
- Renderizar textos como texto. Evitar `dangerouslySetInnerHTML`; links externos devem usar protocolos previstos e abertura segura quando em nova aba.

## 9. Estados visíveis, acessibilidade e desempenho

- Para cada leitura: carregando, dados, vazio, falha e ausência de sessão quando aplicável. Não mostrar vazio antes de concluir GET.
- Mutação nasce do handler do usuário, nunca de render/Effect de montagem. Manter StrictMode; leituras precisam de cancelamento/cleanup e proteção contra resposta antiga.
- Axios aceita `AbortController.signal`; distinguir cancelamento de erro. Abortar request não desfaz gravação que o servidor já iniciou.
- Falha no catálogo não precisa apagar convite carregado; erro de formulário preserva rascunho em memória sem persistência privada automática.
- Usar HTML semântico, labels associados, botões/links nativos, idioma pt-BR, hierarquia de títulos e foco visível.
- Erro de campo: `aria-invalid` e `aria-describedby`; resultado assíncrono em região estável `aria-live="polite"`. Evitar anúncios duplicados.
- Operar por teclado/Enter/Espaço e touch, sem armadilha de foco. Controles RSVP têm nome acessível com a pessoa correspondente.
- Referência WCAG 2.2 AA: contraste 4.5:1 para texto comum; reflow a 320 CSS px; alvos 24 × 24 ou exceções/espaçamento do critério. Preferir 44 px nas ações principais como conforto, sem chamar isso obrigação AA universal.
- Testar zoom 200%, nomes longos e teclado virtual. Não depender só de cor para estado/erro. Respeitar `prefers-reduced-motion` em movimento ornamental.
- Escolher direção visual quando construir a interface. Não instalar biblioteca visual, animação ou memoização preventiva sem necessidade/medição.

## 10. Publicação e lacunas de integração

- Dev atual: `http://localhost:5175`, porta fixa (`strictPort:true`); backend local previsto `http://localhost:8080` e CORS exato.
- `VITE_API_URL` e todas `VITE_*` são públicas, embutidas no build. Não colocar secret key Turnstile, credenciais AWS ou qualquer segredo.
- Workers atual serve `dist/` com fallback SPA; **não implementa proxy da API**. Produção main ainda não está configurada.
- Localhost em portas diferentes é cross-origin; Workers/Lambda em sites distintos têm restrições adicionais de cookie. Postman/local não comprovam login publicado.
- `withCredentials` + CORS não superam cookie `SameSite=Lax` em fetch cross-site. Não recomendar `SameSite=None` como garantia contra bloqueio de terceiros.
- Antes de homologar login, decidir mesma origem via proxy `/api/*` ou domínio próprio com front/API same-site, avaliando cookies, HTTPS, CORS e custo.
- Se houver proxy futuro: preservar métodos/corpos/status/cookies, impedir cache de conteúdo privado e validar origem/IP confiável. Não confiar cegamente em `X-Forwarded-For`.
- Diagnosticar URL resolvida, preflight, Set-Cookie/cookie enviado, body/status e resposta HTML do fallback. Não mascarar erro de rota como sucesso.
- Lacunas backend separadas: expor/calcular Retry-After; validar IP real por trás da infraestrutura; eventual identidade genérica ou `canRespond` se UX exigir.

## 11. Verificação proporcional e entregas

- Lint/build são baseline para código, não prova de autenticação, acessibilidade ou integração. Documentação isolada não exige rodá-los de novo.
- Ao criar formulário real, avaliar Vitest + Testing Library/user-event: colagem/zero inicial, Enter, duplo envio, erro por campo e estados assíncronos.
- Testes devem observar role/label/texto e resultado do usuário; evitar snapshots enormes e testes que copiam a implementação.
- Turnstile: desafio vindo da API, expiração, token descartado após envio e indisponibilidade. Mock determinístico não prova configuração real.
- RSVP: pessoa correta, atualização individual, 409, null/expired e falha sem falso sucesso; admin: flag/payload completo e erros por índice.
- Ao existir navegação real, avaliar smoke Playwright com contextos isolados ADMIN/GUEST; não instalar toda stack de testes de uma vez.
- Antes de homologar: navegador real com API real, login/rotação de CSRF, logout, role oposta com 403, sessão expirada, hard refresh de rota, mobile/teclado e Turnstile com hostname/action corretos.
- Não validar rate limit com flood em ambiente público; usar dados e ambiente de teste controlados. Não usar credenciais pessoais em fixtures/prints.
- Sequência sugerida: login com feedback → Turnstile → convite → RSVP → admin por fluxo → catálogo. Tipos/testes acompanham a necessidade de cada entrega; ajustar sequência com o usuário.
- Cada entrega informa arquivos, responsabilidade, motivo, verificação executada e limite conhecido. Mapear arquivos por commit antes de pedir que o usuário comite.

### Checklist antes de concluir uma entrega

- [ ] Contrato/role/campos/status conferidos no backend atual; nenhum endpoint ou dado pessoal inventado.
- [ ] Arquivos na feature correta; página, formulário, hook e transporte têm responsabilidades claras, sem extrações ou camadas sem necessidade.
- [ ] Estado tem um único dono; props expressam dados/intenções; componentes compartilhados não dependem de sessão ou domínio escondidos.
- [ ] Estados de loading/erro/vazio/pending e acessibilidade dos controles cobertos.
- [ ] Sessão, CSRF, troca de identidade, privacidade e retries respeitados.
- [ ] Payload contém só campos editáveis; datas/nulos/preços tratados explicitamente.
- [ ] Verificação proporcional executada e relatada sem confundir mock/build com integração real.
- [ ] Diff pequeno e coerente, sem README, segredo, dependência ou mudança de escopo não solicitada.
- [ ] Atualizar este guia quando contrato/decisão mudar; distinguir implementação existente de proposta.

## 12. Mobile first e referências antes de cada tela

### Como vamos trabalhar juntos

- Mobile first é o método adotado: começar pela tarefa/conteúdo na largura pequena e ampliar composição quando houver espaço útil. Não desenhar desktop primeiro para depois espremer.
- Antes de cada tela nova ou mudança visual relevante, pesquisar duas ou três referências atuais e apresentar links com o que observar, aproveitar, adaptar e descartar.
- Escolher referências complementares: comportamento de produto, direção visual e componente técnico quando necessário. Não entregar uma lista enorme sem orientação.
- Discutir a direção com William antes de desenvolver uma tela cuja aparência ainda não foi definida. Não assumir paleta, fonte, fotos ou tema de casamento genérico.
- Se a direção já foi escolhida, seguir o combinado e a linguagem existente. Essa colaboração não exige aprovação para cada padding ou ajuste reversível.
- Esboçar primeiro a ordem do conteúdo em cerca de 360–390 CSS px, com dados e estados reais; indicar como a composição se amplia no desktop.
- Representar loading, vazio, erro, pending, desafio e prazo encerrado conforme o fluxo. Uma referência só do estado de sucesso é insuficiente.
- Combinar poucos tokens de cor, tipo, espaçamento, borda e foco; reaproveitá-los entre telas. Guest e admin podem ter densidades diferentes sem parecer produtos desconectados.
- Implementar um recorte utilizável por entrega, explicar arquivos e responsabilidades e revisar visual/interação antes de ampliar o escopo.
- Registrar junto da entrega: tela, data, links, aspecto escolhido, adaptações ao contrato e ao mobile, testes feitos e pendências. Atualizar referências que deixarem de funcionar.

### Fontes com funções diferentes

| Necessidade | Onde começar | Limite importante |
|---|---|---|
| Direção visual de casamento | [Joy Designs](https://withjoy.com/designs/), [Zola Designs](https://www.zola.com/wedding-planning/website/designs), [Wix Wedding Invitation](https://www.wix.com/website-template/view/html/2284), [W&R preview](https://wandr.framer.ai/) | Produtos/templates não são componentes React livres para importar; comparar a versão mobile na entrega. |
| Padrões de telas e fluxos | [Mobbin](https://mobbin.com/), [Landbook](https://land-book.com/), [Dribbble](https://dribbble.com/tags/wedding-website), [Behance](https://www.behance.net/) | Há limites de conta/plano; imagens isoladas não provam funcionamento. Não depender de recurso pago para cumprir o processo. |
| Comportamento sem aparência pronta | [Radix](https://www.radix-ui.com/primitives/docs/overview/introduction), [React Aria](https://react-aria.adobe.com/getting-started) | Precisam de composição e CSS; adotar uma base para a necessidade concreta, não ambas por hábito. |
| Componentes e blocos estilizados | [Mantine UI](https://ui.mantine.dev/), [MUI templates](https://mui.com/material-ui/getting-started/templates/) | Exemplos dependem da biblioteca/tema; distinguir opções gratuitas de premium. |
| Código editável | [shadcn](https://ui.shadcn.com/docs) | Instalação/configuração e dependências do item importam; não adotar Tailwind implicitamente por gostar de uma demo. |

- A base atual continua CSS próprio e controles nativos. Mobile first não exige Tailwind nem biblioteca UI. Se houver ganho concreto, comparar um componente real e explicar o custo antes de mudar a stack.
- Radix/React Aria ajudam em interação complexa; Mantine é opção para visual pronto, especialmente admin; shadcn é opção se Tailwind e manutenção de código forem escolhas deliberadas.
- Não misturar vários sistemas de formulário, modal e toast sem motivo. Eleger um dono por categoria e manter aparência/semântica coerentes.
- Verificar licença do código concreto, dependências e versão compatível antes de reutilizar. Core gratuito não implica que todos os templates, fontes ou fotos da demo sejam livres.
- Inspiração permite estudar hierarquia, ritmo e interação; não autoriza copiar marca, textos, imagens ou código sem permissão correspondente.
- A pesquisa inicial consultou documentação/páginas públicas, sem auditoria visual interativa das demos. Só declarar mobile/teclado/contraste verificados depois de realmente testar.

### CSS e composição progressivos

- Estilo base resolve uma coluna estreita. Usar `@media (min-width: ...)` para mudanças reais de composição, escolhendo o ponto pelo conteúdo, não por marca de aparelho.
- Flexbox para distribuição em uma direção; Grid para grades/composição. Usar container queries quando o mesmo componente precisar responder ao seu espaço, sem aplicá-las em tudo.
- Container fluido com largura máxima legível, campos que cabem na coluna e imagens limitadas ao espaço disponível. Não usar alturas fixas para prender texto ou formulário.
- Preferir `rem` para tipo/espaçamento e unidades fluidas no layout. `clamp()` pode ajudar, mas não substituir legibilidade e teste de zoom.
- Cuidar dos mínimos automáticos de flex/grid; `min-inline-size: 0` e quebra de palavras podem resolver conteúdo longo. Não esconder overflow do body para mascarar erro.
- Não duplicar a árvore React inteira para mobile e desktop. Adaptar o layout preservando o dono do estado, ordem significativa e foco.
- Catálogo não precisa ter duas colunas no celular por convenção; decidir pelo espaço que nome, preço, imagem e esgotado exigem.
- Formulários admin começam em uma coluna; agrupar campos relacionados e ampliar quando labels, ajuda e erros continuarem próximos do input.
- Tabelas exigem decisão por tarefa: lista resumida quando servir; região de rolagem deliberada/acessível quando duas dimensões forem necessárias. Não eliminar dados críticos só para caber.
- Preferir scroll natural. `min-height: 100svh` pode ser útil; `dvh` acompanha mudanças do browser. Nenhuma unidade garante resolver teclado virtual em todos os aparelhos.
- Barras sticky/fixas precisam reservar espaço e respeitar safe area quando pertinente; verificar campo, erro e foco com teclado aberto. Não adotá-las automaticamente.
- Não depender de hover para revelar ação. Preservar foco visível, toque, teclado, zoom e redução de movimento.

### Aplicação aos nossos fluxos

- Login guest: uma coluna, código alfanumérico colável, CTA e feedback claros. Consultar [Mantine Authentication](https://ui.mantine.dev/category/authentication/) e [MUI Sign-in](https://mui.com/material-ui/getting-started/templates/sign-in/) como estrutura, sem copiar email/senha/social para guest.
- Turnstile: `flexible` tem mínimo de 300 px; a 320 CSS px com padding lateral de 16 px sobram 288 px. Ajustar composição ou usar `compact` conforme API oficial; não cortar nem escalar o iframe.
- Convite: usar referências de casamento para hierarquia de data/local/Maps e acesso ao RSVP, sem criar FAQs, hotéis ou histórias como campos obrigatórios inexistentes.
- RSVP: observar [Joy RSVP](https://withjoy.com/online-rsvp/) para agrupamento, mantendo nosso contrato por pessoa e pending individual. Empilhar controles quando nome longo e botões não couberem confortavelmente.
- Catálogo: observar [Joy Shop](https://withjoy.com/shop) e cards da base escolhida para imagem/nome/preço/disponibilidade. Sem carrinho, compra, reserva ou upload simulados.
- Admin famílias: observar [Joy Guest List](https://withjoy.com/guest-list/), [MUI CRUD](https://mui.com/material-ui/getting-started/templates/crud-dashboard/) e [Mantine Tables](https://ui.mantine.dev/category/tables/); adaptar ao nosso cadastro/listagem, sem ações extras da demo.
- Admin evento/presentes: priorizar agrupamento, obrigatoriedade condicional, revisão e rascunho preservado. Componentes não devem acrescentar quantidade editável ou upload sem endpoint.

### Revisão visual e de interação por entrega

- [ ] Comparação de referências feita e direção registrada ou previamente definida respeitada.
- [ ] Tarefa completa em largura estreita; revisar 320 CSS px, faixa de trabalho 360–390, intermediários e desktop. Os números não são breakpoints obrigatórios.
- [ ] Desktop tem composição deliberada; não apenas uma coluna mobile esticada nem campos excessivamente largos.
- [ ] Sem overflow acidental ou perda de ação/dados; verificar nomes longos, erros e imagem ausente.
- [ ] Labels, foco, Enter/Espaço, toque e estados não dependem só de cor ou hover.
- [ ] Zoom 200% e reflow equivalente a 320 CSS px revisados; controles frequentes confortáveis. 44 px é recomendação de conforto, 24 × 24 é referência AA com condições/exceções.
- [ ] Teclado aberto, orientação e último campo/erro acessíveis; barra fixa não encobre conteúdo/foco.
- [ ] Loading/erro/vazio/pending e rede lenta mostram comportamento honesto; não só screenshot do sucesso.
- [ ] Emulação complementada por aparelho real quando disponível; relatar quais browsers/dispositivos foram de fato usados. DevTools não certifica comportamento de hardware/teclado.
- [ ] Dependências/licenças verificadas se houver reutilização de código ou assets; nenhuma adoção de stack implícita.

Referências técnicas: [web.dev responsivo](https://web.dev/articles/responsive-web-design-basics), [MDN media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using), [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [tamanho de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Turnstile sizes](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/), [limites do Device Mode](https://developer.chrome.com/docs/devtools/device-mode).

## 13. Skills locais como apoio ao desenvolvimento

- Disponíveis na raiz do workspace em `.agents/skills`: `design-taste-frontend`, `transitions-dev` e `transitions-polish`.
- Origem, versões e limites estão em [SKILLS-FRONT.md](C:/Users/willi/Documents/project-wedding/SKILLS-FRONT.md). A instalação não adiciona código ou dependências à aplicação.
- Usar Taste para referências/direção quando pertinente e Transitions para movimento específico e revisão. Preservar as decisões de William, esta arquitetura, mobile first, dados reais da API e acessibilidade; não impor landing comercial, seções com altura fixa, fotos ou animações a cada tela.
- React Bits é fonte de componentes, não uma skill instalada. Avaliar o item e suas dependências na entrega correspondente, incluindo alternativas CSS simples e custo no celular.
- Não executar scripts, copiar todos os assets para `public` ou declarar inspeção visual concluída apenas porque a skill está instalada.

## Fontes para revisar decisões

- Contratos locais: controllers/DTOs de `event`, `guest` e `gift`; `SecurityConfig`, `GuestLoginFilter`, `TurnstileVerifier`, `GuestService` e `ApiExceptionHandler` no backend.
- [React: estrutura de estado](https://react.dev/learn/choosing-the-state-structure), [Effects](https://react.dev/learn/you-might-not-need-an-effect), [StrictMode](https://react.dev/reference/react/StrictMode), [TypeScript 6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html).
- [Spring CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [MDN cookies/credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Expose-Headers).
- [Turnstile widget](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/), [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Workers com assets/API](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).
- [React Router modes](https://reactrouter.com/start/modes), [Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [RHF](https://react-hook-form.com/get-started), [Zod](https://zod.dev/basics), [Axios cancellation](https://axios-http.com/docs/cancellation).
- [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [imagens](https://web.dev/learn/images/performance-issues), [Testing Library](https://testing-library.com/docs/guiding-principles/), [Playwright](https://playwright.dev/docs/best-practices).
