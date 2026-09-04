@echo off
REM Abre a Central de Compras.
REM
REM ATENCAO: este endereco so passa a valer DEPOIS da virada (juntar a
REM migracao-supabase na main). Ate la, quem usa o aplicativo continua no
REM endereco antigo, e as copias deste atalho que estao nas areas de trabalho
REM das pessoas NAO se atualizam sozinhas -- alguem precisa troca-las.
REM Ver docs/PENDENCIAS.md, o item do atalho.
start "" https://compras.campisi.com.br/

REM Para desenvolvimento local, execute: pnpm dev
REM e acesse http://localhost:5173
