# Contribuição

1. Instale Node.js 24.15+ e pnpm 11.19.
2. Execute `pnpm install --frozen-lockfile`.
3. Execute `pnpm test` e `pnpm run check`.
4. Para regras, use Java 21 e `pnpm run test:security`.
5. Mantenha o modo demo separado de permissões de produção.
6. Não coloque credenciais administrativas no repositório.
7. Atualize versão, changelog e escopo antes de gerar `pnpm run release`.

Para revisar alterações do frontend, sirva a pasta pelo servidor local. Não edite `dist` diretamente. Testes em DOM simulado não substituem testes visuais/dispositivos.
