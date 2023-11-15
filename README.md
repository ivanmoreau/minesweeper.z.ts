# Minesweeper Game

MPL-2.0. See [LICENSE](LICENSE). Iván Molina Rebolledo.

For some "Programación de Aplicaciones Web" course, autumn 2023.

# Instructions

Use Nix

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

Install the dependencies

```bash
nix profile install nixpkgs#direnv
nix profile install nixpkgs#git
```

Enable direnv

```bash
direnv allow
```

Edit the .env

```bash
cp .env-sample .env
vim .env
direnv allow
```

Setup the database

```bash
npm run new-db
```

Run the db

```bash
npm run start-db
```

Run the migrations

```bash
dbmate create
dbmate up
```

Compile the javascript

```bash
npm run build
```

Run the server with php

```bash
npm run php
```


# New migrations

```bash
dbmate new <name>
```
```