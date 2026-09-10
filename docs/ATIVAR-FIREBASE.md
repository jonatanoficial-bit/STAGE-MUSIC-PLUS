# Ativar Firebase — Stage Music 2.0

O código já aponta para o projeto Firebase **stage-music-96cc1**. Google é o único provedor de login e `jonatanoficial@gmail.com` é o ADM MASTER do catálogo.

## Publicar

Em um terminal com a conta proprietária autenticada no Firebase CLI, na raiz do projeto, execute:

```sh
firebase deploy --only firestore:rules,firestore:indexes,storage,hosting
```

O Hosting esperado é `https://stage-music-96cc1.web.app`.

## Validar depois de publicar

1. Abra o endereço do Hosting e entre com Google.
2. Crie uma equipe e confirme que aparece **Convidar por link**.
3. Abra o convite em outra conta Google. Ela deve entrar como membro da área escolhida.
4. Monte um repertório, inicie uma Sala Live e confirme a troca de música e tom nos dois aparelhos.
5. Entre com `jonatanoficial@gmail.com`, abra **Administração** e publique uma cifra colada no editor.

## Catálogo legado

Antes de alterar a biblioteca, a entrega mantém uma cópia local do catálogo anterior `globalSongs` fora do pacote de distribuição. A origem não deve ser apagada. Migre as 47 cifras para a coleção `songs` somente por um processo administrativo autenticado, confirmando primeiro a quantidade e os campos em uma cópia de segurança.

## Segurança aplicada

- Firestore e Storage aceitam somente tokens emitidos pelo Google.
- Usuários comuns leem cifras publicadas e não escrevem no catálogo.
- ADM MASTER é uma custom claim, não um campo editável pelo navegador.
- Convites não atribuem funções administrativas e vencem em sete dias.
- Ações da Sala Live exigem vínculo ativo com a equipe e respeitam a área do participante.
