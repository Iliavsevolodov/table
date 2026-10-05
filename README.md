# MULTIKIDS

MULTIKIDS — mobile-first игровое EdTech-приложение для детей 8–10 лет, где таблица умножения и обратное деление изучаются внутри приключения, а не через бесконечный лист одинаковых примеров.

## Что уже реализовано в foundation MVP

- игровой onboarding: имя героя, выбор персонажа и питомца;
- короткая игровая диагностика перед первым приключением;
- интерактивная карта мира с первым регионом **«Долина двойки»**;
- три разные игровые механики: выбор дороги, битва с монстром, строительство моста;
- полноценный цикл `игра → задача → действие → награда → прогресс → карта`;
- XP, уровни, монеты, combo и сундук за завершение сессии;
- мягкая реакция на ошибки без сообщений «ты проиграл»;
- отдельный `learning-engine` с mastery, скоростью ответа, подсказками, интервальным повторением и адаптивным выбором следующего факта;
- отдельный `game-engine` для игровых наград и прогрессии;
- математические семьи `a×b`, `b×a`, `ab÷a`, `ab÷b`;
- родительский gate удержанием кнопки 3 секунды;
- родительский кабинет с реальными данными локального прогресса и списком слабых фактов;
- Supabase SSR-клиенты и родительская email/password-аутентификация;
- PostgreSQL/Supabase schema с RLS, индексами и seed ×1–×10 + деление;
- PWA manifest, offline shell, health endpoint и CI workflow;
- unit tests критической логики learning engine.

> Локальный игровой прогресс используется как offline-first вертикальный срез. После подключения Supabase те же модели будут синхронизироваться с `child_fact_mastery`, `question_attempts` и `learning_sessions`.

## Стек

- Next.js 16.3.8 / React 19.3 / TypeScript
- Tailwind CSS 4
- Motion for React
- Supabase Auth + PostgreSQL + RLS
- Vitest

## Быстрый старт

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте `http://localhost:3000`.

Для игрового demo Supabase не требуется. Для родительской авторизации заполните:

```env
NEXT_PUBLIC_APP_NAME=MULTIKIDS
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

## Supabase

Первая миграция находится в:

`supabase/migrations/20261005180000_initial_multikids.sql`

Она создаёт:

- parent/child profiles;
- avatars, avatar items, pets и child pets;
- worlds, regions, levels;
- fact families и learning facts;
- child fact mastery;
- sessions и question attempts;
- currencies, rewards, inventory;
- achievements и daily missions;
- streaks и game progress;
- buildings и child world buildings;
- subscriptions, parent reports, settings;
- privacy-minded analytics events.

`auth.users` используется как canonical users table. Отдельные email-аккаунты для детей не создаются.

После подключения проекта примените миграцию стандартным Supabase CLI workflow и обязательно прогоните database advisors.

## Архитектура

```text
src/
  app/                  Next.js routes
  components/
    game/               карта, onboarding, HUD, mini-games
    parent/             родительская аналитика
    auth/               auth UI
    ui/                 переиспользуемые игровые primitive-компоненты
  lib/
    learning-engine/    образовательная логика без React
    game-engine/        XP, монеты, progression
    math/               факты и математические семьи
    supabase/           browser/server/proxy clients
    analytics/          typed events
  tests/                unit tests learning engine
supabase/migrations/    database schema + seed + RLS
```

### Learning engine

`learning-engine` специально не зависит от React. Он получает математические факты и mastery-состояние и отвечает за:

1. оценку нового ответа;
2. изменение mastery с учётом скорости и подсказок;
3. расчёт следующего интервала повторения;
4. выбор следующего вопроса из weak / due / new / confidence buckets;
5. защиту от чрезмерного повторения недавно показанных фактов.

Mastery 6 нельзя получить одним правильным ответом: требуются высокий score, серия, несколько успешных reviews и быстрый ответ без подсказки.

### Game engine

`game-engine` не решает, чему учить. Он получает уже оценённое действие и отвечает за XP, coins, combo и level up. Это позволяет добавлять новые игры без копирования образовательной логики.

## Проверки

```bash
npm run typecheck
npm test
npm run build
```

CI запускает эти проверки для pull request и `main`.

## Следующие product-инкременты

1. синхронизация offline progress с Supabase после логина родителя;
2. полный diagnostic engine на 15–25 адаптивных вопросов;
3. обучение нового факта через группы предметов, решётки и числовую линию;
4. hint engine и снижение mastery gain при помощи;
5. регионы ×3…×9, боссы и «Земля мастеров»;
6. питомцы, инвентарь, собственный город и daily missions;
7. premium entitlements только в родительской зоне;
8. диплом и финальный «Турнир мастеров»;
9. Playwright e2e и visual regression;
10. iOS/Android-клиенты поверх общего API/backend.
