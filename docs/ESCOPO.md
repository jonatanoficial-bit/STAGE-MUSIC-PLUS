# Escopo da versão 1.0.0

Esta é uma entrega funcional inicial, com pacote integral. O PDF fornecido é a referência de produto; suas instruções dirigidas ao Codex não substituem o pedido do usuário. O nome solicitado é **Stage Music**. Não há publicação de repositório ou contratação de serviços nesta entrega.

## Implementado

| Módulo | Entrega |
| --- | --- |
| Interface | Identidade própria escura com acento verde, tema claro, layout responsivo, controles por toque, foco visível, redução de movimento e fonte ajustável. |
| Demonstração | Quatro músicas fictícias originais, repertório editável, perfis simulados, persistência local e atualização de salas entre abas da mesma origem. |
| Autenticação | Integração Google/Firebase, criação de perfil, saída, custom claim ADM MASTER. Ativação depende do projeto Firebase do proprietário. |
| Catálogo | Busca local no lote carregado por título, artista, letra e tag; filtro de tom, BPM e favoritas; ordem recente. |
| Editor | Colar texto, detectar metadados, prévia, revisão manual do tipo de linha, desfazer última edição, rascunho, publicação, arquivamento, deduplicação por título/artista e histórico resumido. |
| Harmonia | Transposição real de fundamental e baixo, preservação de sufixos, bemóis/sustenidos, tom original, capo 0–12, sugestões de posições e teclado básico ao tocar em um acorde. |
| Leitura | Cifra/letra, modo palco, tamanho da fonte, rolagem automática ajustável e tentativa de manter a tela acordada. |
| Repertórios | Criar, editar, duplicar, exportar JSON, ordenar por botões e arraste, tom, BPM, capo sugerido, duração, opcional, transição e observações gerais. |
| Momentos | Fala, oração, vídeo, entrada, intervalo e outros blocos não musicais. Vídeo é um item de roteiro, não reprodução de mídia. |
| Sala Live | Criar a partir do repertório, link e QR local, AGORA/PRÓXIMA/DEPOIS, posição, cronômetro, iniciar/pausar/retomar/encerrar, anterior/próxima/salto, reordenação e seção destacada. |
| Tom ao vivo | ±1, ±2, seletor direto, confirmação, tom original, retorno ao tom anterior, retransposição e aviso temporário. |
| Comunicação | Comandos rápidos, comando personalizado, destino por área, prioridade e duração, histórico de texto, voz de até 30 s e reprodução autenticada. |
| Visões por área | Banda com cifra, vocal/projeção inicialmente em letra, staff com estrutura e observação técnica geral; notas privadas/da área protegidas separadamente. |
| Equipes | Criação de organização, seleção por código, adicionar/editar/remover UID, funções e área. Acesso depende de membership. |
| Anotações | Por música, privadas, de área, equipe ou direção; âncora textual de seção/linha/compasso. |
| Presença | Heartbeat a cada 25 s e estado aproximado por lastSeen; não equivale a presença imediata garantida. |
| Segurança | Regras restritivas Firestore/Storage, custom claims, controle de papel no servidor, transações/revisões Live e SDK autenticado para áudio. |
| Administração | Catálogo ADM MASTER, scripts de concessão/revogação segura e seed; funções de auditoria incluídas. |
| PWA | Manifest, ícones, cache versionado da interface, instalação pelo navegador e status de conexão. |
| Vale | Avatar original, tutorial em sete passos, pular desde o início, estado salvo por usuário no navegador, reabertura e reinício. |
| Entrega | Fontes, dist, testes, scripts, guias, workflows, versão/data/hora e hash SHA-256. |

## Limites importantes desta versão

- **Firebase não foi provisionado nesta entrega.** O pacote abre em demo. Login Google real, App Check, sincronização entre dispositivos, Storage e Cloud Functions requerem a configuração descrita no README.
- Testes em emulador não substituem validação com contas Google reais, dispositivos reais e rede de produção. Consulte o relatório de validação.
- Demo é armazenamento local, sem isolamento de segurança entre pessoas com acesso ao mesmo perfil de navegador. Não é um servidor de colaboração.
- O modo Firebase não implementa cache persistente offline do catálogo privado/repertórios após recarga. Não salva comandos Live offline. O cache PWA cobre os arquivos da interface; a operação Firebase exige conexão. A demo pode usar seus dados locais sem rede após instalação do cache.
- O catálogo carrega no máximo 500 documentos, repertórios pessoais 200 e salas 100. Busca full-text de servidor, paginação por cursor, filtros por popularidade e escala de grandes catálogos permanecem pendentes.
- Parser trabalha com acordes em linhas separadas. Não interpreta ChordPro inline, tablatura instrumental, compassos estruturados ou partituras. Linhas ambíguas de uma letra precisam de revisão manual. A letra não é reescrita.
- O teclado é uma visualização básica de notas; não é um motor completo de voicings/oitavas, digitações ou tensões implícitas.
- Não há convite público anônimo, token temporário, ingresso por e-mail nem emissão de permissões pelo QR. O administrador adiciona um UID conhecido.
- Não há painel global completo de usuários, denúncias, configurações globais ou atribuição de master pelo navegador. Os scripts de servidor cobrem concessão/revogação de master.
- Notas técnicas gerais de item são compartilhadas com a equipe. Para conteúdo restrito use Anotações → Minha área ou Privada. Não coloque informação privada na cifra, repertório ou texto geral da sala.
- O estado do tutorial é local e não sincroniza entre dispositivos. Há ajuda por tema; não há coach marks ancorados em cada controle nem assistente de IA conversacional.
- Ajustes de cor por comando, confirmação individual de recebimento, restauração de versões, status detalhado de cada item, anotações separadas por repertório e capa de música por upload não estão implementados.
- Presença não usa Realtime Database/onDisconnect. Voz não tem waveform nem transcrição; mensagens de área só aparecem aos destinatários correspondentes. A retenção/exclusão de gravações deve ser definida pelo responsável pelo projeto.
- Funções de auditoria exigem deploy separado. O log de membership não infere autor desconhecido. A atribuição verificável de ator em todas as ações administrativas requer auth-context triggers ou endpoint administrativo.
- Nenhum teste visual em navegador real ou em dispositivo físico foi executado nesta entrega. Os layouts CSS incluem faixas de celular/tablet/desktop, mas a aprovação visual final em dispositivos permanece pendente.

## Evolução sem reiniciar o projeto

1. Consolidar produção: configuração real Firebase, testes com quatro contas, UX em dispositivos, cache offline seguro e fluxo de convites.
2. Completar administração, busca/paginação, auditoria de ator, versionamento restaurável e permissões granulares de sala.
3. Refinar harmonia/piano, presença, comunicação e onboarding contextual.

Aplicativos nativos, MIDI, DAW, OSC/DMX, metrônomo, stems, backing tracks, marketplace e planos permanecem fora desta versão, conforme a seção de roadmap do documento de referência.
