# Leci Medeiros — Sistema de Agendamento

> SPA de agendamento em produção para um salão de beleza real em Ipatinga (MG), rodando diariamente no celular da proprietária. React 19 + TypeScript + Supabase, deploy na Vercel.

**Demo:** [lecimedeiros-beauty-website.vercel.app](https://lecimedeiros-beauty-website.vercel.app/)

[🇺🇸 English version below](#-english-version)

---

## O que é

Aplicação web de duas pontas para um salão de beleza com uma única profissional:

- **Fluxo do cliente:** navega entre 15 categorias de serviço (com sub-opções e variantes por comprimento de cabelo), escolhe uma data dentro de uma janela de 14 dias, escolhe um horário que respeita expediente + almoço + duração do serviço + agendamentos existentes, informa nome e telefone. Confirmação via deeplink para o WhatsApp do salão.
- **Painel admin:** a proprietária acessa pelo celular e vê o dia agrupado em *Hoje / Amanhã / Outros dias*, com ações de um toque para confirmar, cancelar, reagendar, enviar lembrete via WhatsApp ou restaurar agendamento cancelado. Slots de hoje dentro de ±15/+60 minutos ganham um anel visual de "começa em breve".

É um produto real. Minha mãe gere o salão dela neste sistema.

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | React 19 + TypeScript 5.7 | Type safety no domínio (serviços, slots, durações) onde invariantes importam |
| Bundler | Vite 6 | Loop de dev rápido, configuração mínima, TS nativo |
| Backend | Supabase (Postgres + REST) | Uma única dependência cobre auth, banco e API. O free tier cobre um salão por anos |
| Ícones / UI | lucide-react + Tailwind (CDN) | Zero overhead de design system para um app de uma página |
| Hosting | Vercel | Grátis, deploys atômicos, preview URLs automáticos |
| Estado | `useState` + `useMemo` | App pequeno demais para Redux/Zustand fazer sentido |

Sem state library, sem router, sem UI kit, sem framework de teste. Toda dependência precisou justificar seu peso.

## Decisões de arquitetura relevantes

**1. Arquitetura em arquivo único (`index.tsx`, ~850 linhas).**
Deliberada. O app tem 4 telas, uma entidade (`Appointment`) e é mantido por uma pessoa. Quebrar em 20 arquivos teria adicionado custo de navegação sem reduzir complexidade. O custo: legibilidade cai a partir de certo tamanho — e estamos nesse tamanho agora. Refatoração para `src/components/`, `src/hooks/`, `src/lib/supabase.ts` é o próximo passo.

**2. Router custom via `useState<'page'>`.**
Sem `react-router`. Trade-off aceito na época: zero histórico de browser, botão voltar quebra, URL não é compartilhável. Para um salão onde ~todo tráfego é `/` → `/agenda`, é aceitável mas não ideal. Migração para `react-router-dom` está na lista.

**3. Soft-delete com espelho em `localStorage`.**
O admin pode "remover do banco" um agendamento cancelado mas mantê-lo localmente para histórico. O cliente faz merge do resultado do banco com o `localStorage` no carregamento. Funciona porque a proprietária usa um dispositivo só. **Não** funciona em múltiplos dispositivos — limitação conhecida, não bug.

**4. Lógica de conflito de slot respeita buffer.**
`checkAvailability` arredonda o fim de cada agendamento para o próximo múltiplo de 30 minutos antes de checar conflitos. Então um corte de 50 minutos começando às 09:00 termina às 09:50 mas bloqueia até 10:00 — evitando que o próximo cliente apareça enquanto o atual ainda está sendo finalizado.

**5. Almoço e fechamento como restrições rígidas.**
Um agendamento é rejeitado se cruza a janela de almoço (11:00–13:00) ou ultrapassa as 18:00. A lógica usa aritmética em minutos (`timeToMinutes`), não objetos `Date`, para evitar bugs de timezone que horário de verão e `new Date()` injetariam.

**6. Confirmação via WhatsApp, não email.**
A proprietária não checa email. WhatsApp é onde salões brasileiros realmente operam. O botão "Confirmar no WhatsApp" gera uma URL `wa.me` com mensagem pré-preenchida incluindo nome do cliente e serviço. Pragmatismo acima de pureza.

## Banco de dados

Tabela única, fonte única da verdade.

```sql
create table agendamentos (
  id              text primary key,
  service_id      text not null,
  service_name    text not null,
  sub_option_name text,
  hair_length     text,
  date            date not null,
  time            text not null,           -- 'HH:mm'
  duration_minutes int  not null,
  client_name     text not null,
  client_phone    text not null,
  status          text not null,           -- 'pending' | 'confirmed' | 'cancelled'
  created_at      bigint not null
);
```

## Limitações conhecidas e próximos passos

Estou sendo explícito sobre isso porque fingir que não existem é pior do que reconhecer.

| # | Problema | Por que importa | Correção |
|---|---|---|---|
| 1 | **Race condition no insert de agendamento.** Validação de slot roda no client. Dois clientes simultâneos podem ambos passar na validação e ambos inserir. | Risco real em produção. Em um salão de uma cadeira, double-booking é desastre. | `UNIQUE` index parcial em `(date, time)` onde `status != 'cancelled'`, ou stored procedure com `SELECT ... FOR UPDATE`. |
| 2 | **Senha admin em `VITE_ADMIN_PASSWORD`.** Vite embute toda variável `VITE_*` no bundle público. A senha está no JS entregue. | Qualquer um abre DevTools → Sources e lê. | Migrar auth para Supabase Auth (magic link) ou para uma function server-side que valide contra um secret nunca exposto ao client. |
| 3 | **Sem testes.** | Difícil refatorar com confiança. | Vitest + React Testing Library, começando por `checkAvailability` (única função com lógica de negócio ramificada que vale testar). |
| 4 | **IDs aleatórios via `Math.random().toString(36).substr(2, 9)`.** | ~14M valores possíveis, `substr` deprecated, colisões possíveis em escala (não nesta escala). | `crypto.randomUUID()` ou deixar o Postgres gerar `uuid_generate_v4()`. |
| 5 | **Sem error boundaries, sem loading states.** | Falha no Supabase loga silenciosamente no console; usuário não vê nada. | `ErrorBoundary` no App; skeletons durante fetch inicial. |
| 6 | **Arquivo único.** | 850 linhas é o limite superior de "ainda navegável". Mais uma feature e quebra. | Quebrar em `src/components/`, extrair `useAppointments`, isolar `lib/supabase.ts`. |
| 7 | **Router custom.** | Sem histórico, sem URLs compartilháveis. | Adotar `react-router-dom v7`. |

## Rodando localmente

```bash
git clone https://github.com/cleberlucasdev/lecimedeiros-beauty-website.git
cd lecimedeiros-beauty-website
npm install
cp .env.example .env.local   # preencher VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ADMIN_PASSWORD
npm run dev
```

Build de produção:

```bash
npm run build && npm run preview
```

---

## 🇺🇸 English version

# Leci Medeiros — Booking System

> Production booking SPA shipped for a real beauty salon in Ipatinga (MG, Brazil), running daily on the owner's phone. React 19 + TypeScript + Supabase, deployed on Vercel.

**Live:** [lecimedeiros-beauty-website.vercel.app](https://lecimedeiros-beauty-website.vercel.app/)

## What it is

A two-sided web app for a single-operator beauty salon:

- **Customer flow:** browse 15 service categories (with sub-options and length variants), pick a date inside a 14-day window, pick a slot that respects business hours + lunch break + service duration + existing bookings, submit name and phone. Confirmation deeplinks to the salon's WhatsApp.
- **Admin panel:** the owner logs in on her phone and gets the day grouped into *Today / Tomorrow / Other days*, with one-tap actions to confirm, cancel, reschedule, send a WhatsApp reminder, or restore a cancelled booking. Today's slots within ±15/+60 minutes get a visual "starts soon" ring.

It is a real product. My mother runs her salon on it.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript 5.7 | Type safety on the booking domain (services, slots, durations) where invariants matter |
| Bundler | Vite 6 | Fast dev loop, minimal config, native TS |
| Backend | Supabase (Postgres + REST) | Single dependency for auth, DB, and API. Free tier covers a single-operator salon for years |
| Icons / UI | lucide-react + Tailwind (CDN) | Zero design system overhead for a one-page app |
| Hosting | Vercel | Free, atomic deploys, automatic preview URLs |
| State | `useState` + `useMemo` | App is small enough that Redux/Zustand would be overkill |

No state library, no router, no UI kit, no test runner. Every dependency had to justify its weight.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ──REST──▶│   Supabase   │ ──SQL──▶│  Postgres   │
│  (React)    │ ◀────────│  (anon key)  │ ◀───────│ agendamentos│
└─────────────┘          └──────────────┘         └─────────────┘
      │
      ├─▶ localStorage (cancelled-appointment cache)
      └─▶ wa.me deep links (confirmation + reminders)
```

### Notable design decisions

**1. Single-file architecture (`index.tsx`, ~850 lines).**
Deliberate. The app has 4 screens, one entity (`Appointment`), and is maintained by one person. Splitting into 20 files would have added navigation cost without reducing complexity. The cost: lower readability past a certain size — and we're at that size now. Refactor into `src/components/`, `src/hooks/`, `src/lib/supabase.ts` is the next step.

**2. Custom router via `useState<'page'>`.**
No `react-router`. Trade-off accepted at the time: zero browser history, broken back button, no shareable URLs. For a salon where ~all traffic is `/` → `/agenda`, this is acceptable but not ideal. Migration to `react-router-dom` is on the list.

**3. Soft-delete with `localStorage` mirror.**
The admin can "remove from database" a cancelled booking while keeping it locally for history. The client merges the DB result with `localStorage` on load. It works because the salon owner uses one device. It does **not** work for multi-device — that's a known limitation, not a bug.

**4. Slot-conflict logic respects buffers.**
`checkAvailability` rounds each booking's end time up to the next 30-minute mark before checking conflicts. So a 50-minute haircut starting at 09:00 ends at 09:50 but blocks until 10:00 — preventing the next customer from showing up while the current one is still being finished.

**5. Lunch + closing as hard constraints.**
A booking is rejected if it crosses the 11:00–13:00 lunch window or extends past 18:00. Logic uses minute-arithmetic (`timeToMinutes`), not Date objects, to avoid timezone bugs that DST and `new Date()` would inject.

**6. Confirmation via WhatsApp deep link, not email.**
The owner doesn't check email. WhatsApp is where Brazilian salons actually run. The "Confirmar no WhatsApp" button generates a `wa.me` URL with a pre-filled message including the customer's name and service. Pragmatism over purity.

## Database

Single table, single source of truth.

```sql
create table agendamentos (
  id              text primary key,
  service_id      text not null,
  service_name    text not null,
  sub_option_name text,
  hair_length     text,
  date            date not null,
  time            text not null,           -- 'HH:mm'
  duration_minutes int  not null,
  client_name     text not null,
  client_phone    text not null,
  status          text not null,           -- 'pending' | 'confirmed' | 'cancelled'
  created_at      bigint not null
);
```

## Known limitations & next steps

I'm being explicit about these because pretending they don't exist is worse than acknowledging them.

| # | Issue | Why it matters | Fix |
|---|---|---|---|
| 1 | **Race condition on booking insert.** Slot validation runs client-side. Two simultaneous customers can both pass validation and both insert. | Real risk in production. With a one-chair salon, double-booking is a disaster. | Add a Postgres `UNIQUE` partial index on `(date, time)` where `status != 'cancelled'`, or wrap the insert in a stored procedure with `SELECT ... FOR UPDATE`. |
| 2 | **Admin password in `VITE_ADMIN_PASSWORD`.** Vite inlines every `VITE_*` variable into the public bundle. The password is in the shipped JS. | Anyone who opens DevTools → Sources can read it. | Move auth to Supabase Auth (magic link to the owner's email/phone), or to a server function that validates against a secret never exposed to the client. |
| 3 | **No tests.** | Hard to refactor confidently. | Vitest + React Testing Library, starting with `checkAvailability` (the only function with branching business logic worth testing). |
| 4 | **Random IDs via `Math.random().toString(36).substr(2, 9)`.** | ~14M possible values, `substr` deprecated, collisions possible at scale (not at this scale). | `crypto.randomUUID()`, or let Postgres generate `uuid_generate_v4()`. |
| 5 | **No error boundaries, no loading states.** | A failed Supabase call silently logs to console; the user sees nothing. | Wrap App in an ErrorBoundary; render skeletons during initial fetch. |
| 6 | **Single-file architecture.** | 850 lines is the upper bound of "still navigable". One more feature and it breaks. | Split into `src/components/`, extract `useAppointments`, isolate `lib/supabase.ts`. |
| 7 | **Custom router.** | No browser history, no shareable URLs. | Adopt `react-router-dom v7`. |

## Run locally

```bash
git clone https://github.com/cleberlucasdev/lecimedeiros-beauty-website.git
cd lecimedeiros-beauty-website
npm install
cp .env.example .env.local   # fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ADMIN_PASSWORD
npm run dev
```

Build for production:

```bash
npm run build && npm run preview
```

---

**Author:** [Cléber Lucas](https://github.com/cleberlucasdev) — N1 Support → Software Engineer in transition. Ipatinga, MG.
