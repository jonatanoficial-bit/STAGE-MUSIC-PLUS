# Arquitetura

## Camadas

- `index.html`: entrada estática e metadados.
- `css/app.css`: tokens, layout, componentes, palco, tema claro e breakpoints.
- `js/app.js`: navegação por hash, telas, eventos de interface e ciclo de vida dos listeners.
- `js/ui.js`: escape de texto, ícones, botões, formulários, modal, toast e downloads.
- `js/core/music.js`: parser de linhas, validação de acordes, transposição, capo e notas para piano.
- `js/core/live.js`: transições puras da fila, revisão e políticas de apresentação.
- `js/core/demo.js`: conteúdo fictício original.
- `js/services/store.js`: adaptadores local/Firebase, login, CRUD, transações, presença e áudio.
- `js/config.js`: configuração pública Firebase e App Check.
- `js/build-info.js` e `BUILD.json`: versão e instante do build.
- `assets/`: identidade, ícones PWA e avatar Vale.
- `vendor/qrcode.js`: gerador QR incorporado para funcionar sem serviço externo.
- `functions/`: auditoria por triggers e ferramentas Admin SDK.
- `scripts/`: servidor, checagens, build e release integral.
- `tests/`: regras de negócio, fluxo DOM e segurança em emuladores.

## Dados

| Caminho | Uso e acesso |
| --- | --- |
| `users/{uid}` | Perfil e favoritos; leitura/escrita pelo próprio UID com campos permitidos. Não aceita campos de papel administrativo. |
| `organizations/{orgId}` | Nome e proprietário imutável; leitura por membros ativos. |
| `organizations/{orgId}/members/{uid}` | Função, área, status; administração controlada pelo proprietário/admin. |
| `songs/{songId}` | Catálogo oficial; publicadas são públicas, rascunhos/arquivadas só master. Escrita só custom claim masterAdmin. |
| `setlists/{setlistId}` | Itens, evento, tons, notas gerais; edição pelo criador, leitura pela equipe quando associada. |
| `liveRooms/{roomId}` | Snapshot dos itens/cifras compartilháveis, posição, status, avisos, tom e liveRevision; leitura de membros e controle por direção. |
| `liveRooms/{roomId}/participants/{uid}` | Nome, área, online e lastSeen. O participante só escreve a própria presença e a área atribuída. |
| `liveRooms/{roomId}/events/{eventId}` | Eventos de comandos vinculados à nova revisão da sala por transação. Não podem ser alterados. |
| `liveRooms/{roomId}/messages/{id}` | Texto/voz, remetente, destino, prioridade, criação e expiração. Leitura segue destinatários. |
| `annotations/{id}` | Autor, música, visibilidade, organização, área e âncora. Regras por documento protegem conteúdo privado. |
| `auditLogs/{id}` | Escrita exclusiva Admin SDK/Functions, leitura master. |
| Storage `voice/{room}/{area}/{uid}/{clip}` | Arquivos de até 2 MB; leitura por membership e área de destino. Não usa URLs de download permanentes. |

## Fluxo da Sala Live

1. Diretor copia o repertório para o estado independente da sala. Editar o repertório original não altera automaticamente uma sala já em execução.
2. Participante abre a rota por ID. O acesso Firestore e a seleção da organização validam membership.
3. O listener acompanha a sala e os metadados de conexão. A interface diferencia cache sem confirmação do servidor.
4. Cada comando usa transação, confere a revisão lida, incrementa liveRevision, aplica uma transição pura e registra um evento com timestamp do servidor.
5. Reordenar preserva a identidade do item atual. Sala encerrada rejeita novos comandos.
6. Listeners e heartbeat são interrompidos ao trocar de tela. Comandos Live não são colocados numa fila offline.

Na demonstração, a mesma transição opera sobre armazenamento local, com Web Locks quando disponíveis. Eventos de armazenamento atualizam outras abas. Isso não representa uma barreira de autorização de produção.

## Conteúdo e alinhamento

O parser preserva o texto-fonte e classifica linhas. Somente tokens reconhecidos em linhas classificadas como acordes são transpostos. A visualização usa fonte monoespaçada e posições em `ch`; quando um acorde cresce, os seguintes recebem espaço para não se sobrepor. A letra original mantém seu texto. O editor permite corrigir explicitamente o tipo das linhas.

Anotações privadas nunca são incorporadas ao snapshot compartilhado da sala. As observações de direção e técnicas gerais do item são compartilhadas; informações restritas devem ser salvas como anotações de área.

## Decisões desta entrega

Frontend sem framework e sem dependências de execução via npm. Firebase é importado modularmente do CDN oficial quando configurado. A demonstração não solicita SDKs externos. Não foram criados recursos hospedados, repositório remoto, contas ou credenciais em nome do usuário.
