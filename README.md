# Stage Music

**Versão 1.0.0 — entrega funcional inicial.** Aplicativo web de cifras, repertórios e direção musical ao vivo, em português, com HTML, CSS e JavaScript modular.

O ZIP contém o projeto inteiro desta versão: fontes, aplicativo estático em `dist/`, regras Firebase, funções administrativas, testes, documentação, arquivos de publicação e scripts de build/release. O escopo amplo do PDF de referência e os limites desta versão estão descritos em [docs/ESCOPO.md](docs/ESCOPO.md). Não se trata de uma declaração de conclusão de todas as funcionalidades futuras do documento.

## Abrir imediatamente

1. Extraia todo o ZIP em uma pasta.
2. Tenha **Node.js 24.15 ou superior** instalado.
3. No Windows, execute `INICIAR-WINDOWS.cmd`. Em qualquer sistema, abra um terminal nesta pasta e execute:

   ```sh
   node scripts/serve.mjs
   ```

4. Abra **http://127.0.0.1:4173**.

A demonstração abre sem conta Firebase e sem instalar bibliotecas. Não abra `index.html` por duplo clique: módulos JavaScript precisam de servidor HTTP. As ferramentas de teste e de ZIP só são necessárias para desenvolver e gerar outra entrega.

O modo de demonstração utiliza músicas fictícias originais, quatro itens de repertório e perfis simulados. Nenhum desses perfis concede acesso ao Firebase. Favoritos, repertórios e anotações são gravados no navegador. Não use a demonstração para dados confidenciais: quem acessa o mesmo perfil de navegador pode acessar o armazenamento local.

## Experimentar a Sala Live local

1. Abra o repertório de demonstração e clique **Iniciar Sala Live**.
2. Clique **Convidar**, copie o link e abra-o em outra aba do mesmo navegador e da mesma origem.
3. Na segunda aba, abra **Configurações**, escolha o perfil Banda, Vocal, Projeção, Iluminação, Áudio ou Produção. Volte ao link da sala.
4. Na aba Direção, avance a música ou altere o tom. A outra aba acompanha a mudança.
5. Use Comunicação para texto/voz e os comandos rápidos para avisos. A gravação exige permissão do microfone e dura no máximo 30 segundos.

**A demo não sincroniza entre computadores, celulares, navegadores diferentes ou janelas anônimas.** Para isso, ative o Firebase abaixo. O indicador da interface distingue a demonstração, a conexão Firebase e a falta de conexão.

## Publicar no GitHub

O ZIP é um pacote de código: **extraia e envie seus arquivos ao repositório**, não apenas o arquivo `.zip`.

### Opção simples: GitHub Pages pela branch

1. Crie um repositório, preferencialmente chamado `stage-music`.
2. Envie o conteúdo extraído à raiz, incluindo `index.html`, `js`, `css`, `assets`, `vendor`, `.nojekyll` e demais arquivos.
3. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
4. Aguarde a publicação e abra o endereço apresentado pelo GitHub.

Os links usam `#/rota`. Isso permite acesso direto a músicas e salas em hospedagem estática e em repositórios com subpasta.

### Opção com build: GitHub Actions

1. Envie também a pasta `.github/workflows`.
2. Em **Settings → Pages**, escolha **GitHub Actions**.
3. Em **Actions**, execute manualmente **Publicar Stage Music no GitHub Pages**.
4. O fluxo gera `dist/` e publica apenas os arquivos do aplicativo.

O fluxo separado `ci.yml` executa os testes e as regras em emuladores. Nenhum dos arquivos publica automaticamente em Firebase nem inclui credenciais administrativas.

## Ativar Firebase para uso entre dispositivos

### 1. Criar projeto e app Web

No console Firebase, crie seu projeto e registre um aplicativo Web. Copie o objeto `firebaseConfig` para **`js/config.js`**, preenchendo `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` e `appId`.

Esses campos identificam publicamente o aplicativo. **Nunca coloque uma chave de conta de serviço, JSON do Admin SDK, senha ou segredo administrativo nesse arquivo ou no GitHub.** As permissões são impostas pelas regras, não pelo sigilo do `firebaseConfig`.

Mantenha `useEmulators = false` ao publicar. Para voltar à demonstração, deixe a configuração Web vazia e gere o build novamente. Dados de demo não são enviados automaticamente para o Firebase.

### 2. Authentication

- Ative o provedor **Google** em Authentication → Sign-in method.
- Em Authorized domains, adicione o domínio real de publicação e `localhost` se for testar localmente.
- O primeiro login cria/atualiza `users/{uid}`.

### 3. Firestore e Storage

- Crie o banco **Cloud Firestore**, inicialmente em modo de produção/restritivo.
- Ative **Storage** se quiser mensagens de voz. O projeto pode exigir faturamento para determinados serviços; verifique no console do seu projeto.
- Instale as ferramentas do projeto:

  ```sh
  corepack enable
  pnpm install --frozen-lockfile
  pnpm exec firebase login
  ```

- Publique as regras e índices, substituindo `SEU_PROJECT_ID`:

  ```sh
  pnpm exec firebase deploy --project SEU_PROJECT_ID --only firestore:rules,firestore:indexes,storage
  ```

- Aguarde a construção dos índices. Para Storage, autorize a integração de Security Rules com Firestore quando o console/CLI solicitar.
- Mensagens de voz são lidas com o SDK autenticado (`getBlob`); não geramos links permanentes com token. Configure CORS no bucket para os domínios reais de frontend, conforme [docs/SEGURANCA.md](docs/SEGURANCA.md).

### 4. App Check

Registre o aplicativo em **App Check**, com reCAPTCHA Enterprise. Coloque a chave pública em `appCheckSiteKey`, em `js/config.js`. Registre os domínios corretos. Valide o funcionamento e então ative enforcement para os serviços compatíveis usados pelo seu projeto. A mera presença do campo no código não ativa enforcement no console.

### 5. Primeiro ADM MASTER

A função não é obtida pelo cadastro de usuário nem por edição de perfil. Um administrador do projeto deve executar o script de servidor:

```sh
cd functions
pnpm install
cd ..
```

Em um terminal administrativo, configure `GOOGLE_APPLICATION_CREDENTIALS` apontando para um arquivo protegido **fora do repositório**, ou use Application Default Credentials autorizadas. Depois:

```sh
node functions/tools/master.mjs UID_DO_USUARIO grant
```

O script preserva outras custom claims, grava auditoria e revoga tokens de atualização. Saia e entre novamente no aplicativo. Para remover o acesso, use `revoke`.

Para inserir apenas as quatro cifras fictícias originais incluídas neste projeto, opcionalmente execute:

```sh
node functions/tools/seed.mjs --confirm-seed
```

O seed preserva documentos já existentes. Também é possível usar **Administração → Nova cifra** com uma conta ADM MASTER.

### 6. Equipe e funções

- Crie uma equipe em **Minha equipe**.
- Cada pessoa entra com Google e copia seu UID em Minha equipe.
- O proprietário adiciona esse UID, nome, função e área.
- Entregue ao membro o código da equipe ou o link da Sala Live. Ele precisa já ter membership ativo.
- Proprietário e administradores gerenciam membros. Diretor, administrador e proprietário controlam a sala. Membros acompanham sua área.
- O convite de sala é restrito à equipe; o QR Code não concede acesso nem contém segredos.

### 7. Auditoria por Cloud Functions

As funções em `functions/index.js` registram alterações de cifras, membership e status de sala em `auditLogs`. Instale as dependências de `functions/` e publique:

```sh
pnpm exec firebase deploy --project SEU_PROJECT_ID --only functions
```

As funções usam a região `southamerica-east1`; ajuste se necessário antes de publicar. A captura exata do autor de alterações de membership é uma melhoria pendente; o registro não atribui autor desconhecido a uma pessoa. O frontend não tem permissão de criar ou editar `auditLogs`.

### 8. Publicar frontend configurado

Após editar `js/config.js`, gere novamente o aplicativo e atualize a hospedagem:

```sh
pnpm run build
```

Para Firebase Hosting:

```sh
pnpm exec firebase deploy --project SEU_PROJECT_ID --only hosting
```

Para GitHub Pages, envie os arquivos atualizados ou execute o workflow Pages. O modo demo só desaparece quando um `firebaseConfig` válido está presente; login e colaboração também exigem a configuração dos serviços e regras acima.

## Testar e gerar novas versões

```sh
pnpm test             # 68 casos musicais/Live + teste de fluxo em DOM simulado
pnpm run check        # sintaxe, imports, JSON e arquivos locais
pnpm run test:security # Firestore/Storage local; exige Java 21 e ferramentas instaladas
pnpm run build        # gera dist/ e metadados do build
pnpm run release      # build + ZIP integral + SHA-256 em releases/
```

Para uma nova versão, altere `version` em `package.json` antes de gerar o release. O script registra UTC em `builtAt` e data/hora de São Paulo no rótulo e nome:

`Stage-Music_v1.0.0_AAAA-MM-DD_HH-mm-ss_BRT.zip`

`BUILD.json`, `js/build-info.js`, Configurações e o rodapé mostram o build. Cada pacote contém a versão completa, nunca apenas um patch. `node_modules`, `.env`, credenciais e a pasta de releases são excluídos. Não edite `dist/` manualmente: altere as fontes e rode o build.

## Documentação incluída

- [Escopo implementado e pendências](docs/ESCOPO.md)
- [Arquitetura e modelo de dados](docs/ARQUITETURA.md)
- [Segurança e configuração](docs/SEGURANCA.md)
- [Validação e checklist de produção](docs/VALIDACAO.md)
- [Changelog](CHANGELOG.md)
- [Bibliotecas e créditos](THIRD_PARTY_NOTICES.md)

## Referências de configuração

- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Configuração alternativa via CDN](https://firebase.google.com/docs/web/alt-setup)
- [Testes de Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Condições e transações em regras](https://firebase.google.com/docs/firestore/security/rules-conditions)
