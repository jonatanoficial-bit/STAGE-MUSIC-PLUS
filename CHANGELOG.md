# Changelog

## 2.0.0 — 2026-09-10

Parte 2 do **Stage Music**, preparada para o projeto Firebase `stage-music-96cc1`.

- Identidade oficial Stage Music Plus em PNG transparente na navegação e no acesso.
- Tema claro como padrão; o usuário pode alternar para escuro e a escolha é preservada.
- Login exclusivamente com Google, com mensagens claras para domínios e pop-ups.
- Sala Live Firebase, mensagens por área, presença e voz protegidos por regras.
- Convites de equipe com link de duração limitada e papel de membro sem escalonamento de privilégios.
- Editor de cifras focado em colagem: reconhecimento de título, artista, tom, BPM, compasso, capo e seções; prévia segura, avisos para linhas ambíguas, texto original, fonte e créditos.
- Botão para publicar uma cifra e iniciar imediatamente a próxima.
- Regras Firestore e Storage exigem provedor Google; conta `jonatanoficial@gmail.com` configurada como ADM MASTER por custom claim.
- Backup local do catálogo legado criado antes de qualquer migração; a origem `globalSongs` não é apagada.
- Testes para importação, conteúdo HTML inerte, login Google e convites de equipe.

## 1.0.0 — 2026-09-09

Entrega funcional inicial do **Stage Music**. O instante exato do build está em `BUILD.json` e no nome do ZIP.

- Interface em português, identidade escura/clara, modo palco e controles responsivos.
- Biblioteca original de demonstração, favoritos, editor de cifras e metadados.
- Parser com revisão de linhas, transposição de acordes e inversões, capo e piano básico.
- Repertórios editáveis, reordenação, blocos não musicais, tons por item e exportação.
- Sala Live, QR, fila sincronizada, mudanças de tom, comandos, texto e voz por área.
- Equipes e permissões, anotações privadas/de área/equipe/direção.
- Adaptadores local e Firebase, Google Auth, regras Firestore/Storage, configuração App Check.
- Scripts Admin SDK e funções de auditoria preparados para implantação.
- Avatar Vale, tutorial com opção de pular, revisita e estado por usuário no navegador.
- PWA básica, cache da interface e status de conexão.
- Testes de música, fluxo de interface simulado e regras em emuladores.
- Documentação, publicação GitHub Pages/Firebase, ZIP integral e SHA-256.

Limites e funcionalidades avançadas pendentes: `docs/ESCOPO.md`. Esta entrega não provisiona Firebase nem declara validação de produção com contas/dispositivos reais.
