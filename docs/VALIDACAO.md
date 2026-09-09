# Relatório de validação — Stage Music 1.0.0

Data da validação: 9 de setembro de 2026. O instante exato de empacotamento está em `BUILD.json`.

## Executado com resultado aprovado

| Verificação | Resultado |
| --- | --- |
| Parser, transposição, capo, piano básico, estado Live e permissões de apresentação | **68 testes aprovados**, zero falhas. |
| Fluxo da interface em JSDOM | **1 teste de integração aprovado**, percorrendo vários fluxos; zero erros capturados no console simulado. |
| Security Rules Firestore e Storage | **14 testes em emuladores aprovados**, zero falhas. |
| Arquivos do frontend | Sintaxe JavaScript, imports locais, JSON, manifest e presença dos arquivos referenciados checados pelo script `check`. |
| Servidor local | Resposta HTTP 200 na entrada do aplicativo. Prévia local aberta no Codex. |

**Total dos testes automatizados: 83 casos aprovados.** O teste de interface é um caso com várias etapas, não um conjunto de testes visuais de navegador real.

## Cobertura de música

Acordes simples, menores, maiores, extensões, sus/add, diminutos/aumentados, alterações, inversões, transposição da fundamental/baixo e preservação de sufixos. Verificação de palavras de letra, linhas em branco, tabs, metadados, seções, override manual e capo.

A validação detectou e corrigiu o reconhecimento de alterações em bemol dentro de parênteses, como `Bm7(b5)` e `G7(b9)`.

## Cobertura do fluxo em DOM simulado

- Abrir dashboard e pular onboarding, preservando o estado.
- Abrir cifra, transpor e recalcular capo.
- Criar anotação privada e confirmar que outro perfil não a recebe.
- Bloquear escrita de catálogo pelo perfil demo não administrador.
- Criar repertório, adicionar duas músicas e reordená-las.
- Criar sala, avançar música e alterar tom com confirmação.
- Gerar QR Code e link da sala.
- Enviar mensagem de texto e encerrar sala.
- Publicar cifra pelo editor e impedir interpretação de HTML inserido na letra.
- Abrir Configurações e mostrar versão.

## Cobertura dos emuladores

- Catálogo publicado acessível e rascunhos protegidos.
- Usuário não pode conceder a si mesmo custom claim pelo perfil.
- Só master publica cifra.
- Proprietário lista suas equipes; membership controla leitura; visitante externo é negado.
- Consultas de salas e anotações de área aceitas conforme o uso do app.
- Membro não promove a si próprio; admin não cria proprietário.
- Proprietário adiciona membro, mas não troca ownership pelo cliente.
- Repertório tem criador imutável e escrita protegida.
- Notas privadas/de área/direção não vazam.
- Membro acompanha sala, mas não a controla; revisão inválida é rejeitada.
- Transação de avanço chega ao listener de outro usuário; revisão antiga é rejeitada.
- Cliente não escreve auditLogs nem cria evento Live com revisão forjada.
- Mensagem de áudio/texto direcionada é protegida.
- Upload/leitura Storage exige membership e destino autorizado.

A primeira execução encontrou um problema na regra de listagem das equipes do proprietário. A regra foi corrigida e todos os 14 testes foram executados novamente com sucesso. As mensagens PERMISSION_DENIED durante testes negativos são resultados esperados e conferidos por `assertFails`.

## Não validado nesta entrega

- Login Google com contas reais: não foi fornecido nem provisionado um projeto Firebase de produção.
- App Check/enforcement, CORS de bucket real e deploy das Cloud Functions.
- Execução real dos scripts Admin SDK em projeto remoto.
- Gravação e reprodução com microfone físico, permissões iOS/Android e restrições de autoplay.
- Testes visuais em Chrome/Safari real, celular/tablet, ampliação de texto e dispositivos físicos.
- Cenário completo com quatro contas simultâneas em produção, internet lenta e reconexão real.
- Desempenho/custo sob carga, pentest e auditoria de produção independente.
- Registro WebMCP em um navegador com suporte nativo: há detecção opcional e ferramentas para listar/criar repertórios, mas não havia contexto de validação suportado. Não é requisito para usar o app.

## Checklist de homologação do proprietário

1. Configurar Firebase seguindo o README e publicar regras/índices.
2. Criar uma equipe com diretor, banda, projeção e áudio em contas distintas.
3. Confirmar acesso negado a uma quinta conta externa.
4. Conferir AGORA/PRÓXIMA, avanço, retorno, pausa, reordenação, tom e encerramento nos quatro dispositivos.
5. Verificar isolamento das anotações e mensagens por área.
6. Testar voz, perda/retomada de rede e comportamento de tela ligada.
7. Aprovar leitura em celular/tablet e definir retenção/custos antes do evento.
