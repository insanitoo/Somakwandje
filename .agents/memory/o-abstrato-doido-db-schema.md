---
name: O Abstrato Doido legacy database schema
description: Compatibility note for the artwork database when applying future schema changes.
---

O schema da base de desenvolvimento pode ficar atrás do schema Drizzle/API e conter colunas legadas que não aparecem no código atual. Alterações em obras devem ser aditivas e preservar colunas antigas; confirmar a tabela real antes de reiniciar o API.

**Why:** O API pode compilar corretamente e ainda devolver 500 quando uma coluna declarada no código não existe na base conectada pela workflow.

**How to apply:** Antes de mudanças em `obras`, comparar `information_schema.columns` com `lib/db/src/schema/obras.ts`; preferir `ADD COLUMN IF NOT EXISTS` e manter dados/colunas legadas.