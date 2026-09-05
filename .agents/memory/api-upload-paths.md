---
name: Caminhos de uploads no API
description: Regra para servir ficheiros locais legados no servidor API.
---

Os workflows do servidor podem executar com um diretório de trabalho diferente da raiz do projeto. Rotas de ficheiros locais devem resolver o caminho a partir da localização do bundle/ficheiro do servidor, não assumir que `process.cwd()` aponta para a raiz esperada.

**Why:** Um caminho baseado em `process.cwd()` apontou para uma pasta duplicada e deixou imagens legadas a responder 404, apesar de os ficheiros existirem no projeto.

**How to apply:** Ao adicionar ou manter serving local no API, use um caminho absoluto derivado da localização do bundle e confirme o resultado através da rota pública do proxy.