---
name: O Abstrato Doido legacy database schema
description: Compatibility note for the artwork database when applying future schema changes.
---

O schema da base de desenvolvimento pode ficar atrás do schema Drizzle/API e conter colunas legadas que não aparecem no código atual. Alterações em obras devem ser aditivas e preservar colunas antigas; confirmar a tabela real antes de reiniciar o API.

**Why:** O API pode compilar corretamente e ainda devolver 500 quando uma coluna declarada no código não existe na base conectada pela workflow.

Drizzle `push` também pode encontrar diferenças fora da tabela em mudança e pedir para truncar dados para criar uma restrição única. Não usar `push-force` nem aceitar truncamentos nesse caso; abortar e aplicar apenas a alteração aditiva autorizada.

**Why:** Uma sincronização global pode propor apagar dados de outra tabela, sem relação com a mudança pedida.

**How to apply:** Antes de mudanças em `obras`, comparar `information_schema.columns` com `lib/db/src/schema/obras.ts`; preferir `ADD COLUMN IF NOT EXISTS` e manter dados/colunas legadas. Se `push` sugerir uma ação destrutiva, parar e limitar a mudança ao SQL aditivo necessário no banco de desenvolvimento.