# Segurança e implantação

## Fronteiras de confiança

A demonstração local é identificada como tal e não fornece segurança entre pessoas que compartilham um navegador. Em produção, a autorização depende de Firebase Authentication, custom claims assinadas, membership e Security Rules. Nenhum valor de localStorage, parâmetro de URL, QR ou botão escondido concede papel administrativo ao Firebase.

- Master: `request.auth.token.masterAdmin == true`.
- Proprietário: `organizations/{org}.ownerUid`, imutável pelo cliente.
- Papel e área: documento de membership com `status == active`.
- O membro não edita seu próprio papel nem controla a sala.
- Admin de equipe não cria owner e não promove a si mesmo.
- Consultas de organizações listam apenas as próprias; equipes das quais se é membro são abertas por código e depois lembradas localmente, com autorização revalidada no servidor.
- O catálogo oficial é editável apenas pelo master. Anotações privadas só pelo autor, inclusive contra administradores de equipe.
- Sala e repertório contêm apenas conteúdo compartilhável. Notas privadas/da área são documentos separados.
- Avisos e voz de uma área não são legíveis por membros de outra área. O remetente não necessariamente recebe mensagens enviadas exclusivamente para outra área.
- Eventos Live usam revisão e transação no adaptador; timestamps críticos de atualização e eventos são do servidor.
- `auditLogs` rejeita escrita de todos os clientes, inclusive master autenticado. Escrita é feita pelo Admin SDK.

## Regras entregues

`firestore.rules` e `storage.rules` começam com acesso restrito e encerram com deny-by-default. `firestore.indexes.json` cobre as consultas compostas previstas. As regras foram exercitadas com contas simuladas de emulador; os resultados e limites da validação estão em `VALIDACAO.md`.

As operações administrativas feitas pelo Admin SDK ignoram Security Rules por definição. Proteja IAM e credenciais da conta executora. Não compartilhe JSON de conta de serviço por chat, commit ou arquivo dentro do aplicativo.

## App Check

O código inicializa reCAPTCHA Enterprise quando `appCheckSiteKey` é preenchido. Cadastre os domínios e ative enforcement no console somente após verificar as métricas. O SDK do navegador e as regras não podem ativar enforcement sozinhos.

## Storage e áudio

Áudio tem limite de 30 segundos no gravador e 2 MB no adaptador/regras. A gravação usa permissão explícita do navegador. Arquivos armazenados não recebem link público persistente no frontend; a reprodução usa a sessão autenticada e as regras por área.

Para reprodução por `getBlob` em domínio diferente do bucket, configure CORS. Exemplo `cors.json` **ajuste os dois domínios**:

```json
[
  {
    "origin": ["https://SEU_USUARIO.github.io", "https://SEU_PROJECT_ID.web.app"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Em um terminal com Google Cloud CLI autorizado:

```sh
gcloud storage buckets update gs://SEU_BUCKET --cors-file=cors.json
```

CORS não substitui as regras. Defina também retenção e limpeza de gravações no bucket. Esta versão não apaga automaticamente o histórico de voz. Limites de custo e monitoramento operacional devem ser definidos pelo responsável pelo projeto.

## Antes de um evento real

1. Publique regras e aguarde índices.
2. Ative Google e confira domínios autorizados.
3. Cadastre a equipe e teste acesso com contas distintas.
4. Configure App Check e Storage/CORS.
5. Publique Functions se precisar da auditoria por triggers.
6. Teste queda de conexão e retomada. Uma sala exibida em cache não é tratada como sincronizada.
7. Teste microfone/reprodução em iOS Safari, Android e computadores do evento.
8. Verifique acesso negado a conta de fora da equipe, a notas de outra área e à administração.

Não altere as regras para `allow read, write: if true` para contornar erros. Use os logs e o emulador para identificar a consulta/permissão faltante.

## Referências

- [Custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [App Check Web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [Download de arquivos Storage](https://firebase.google.com/docs/storage/web/download-files)
- [Security Rules e transações](https://firebase.google.com/docs/firestore/security/rules-conditions)
