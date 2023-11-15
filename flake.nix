{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ self, nixpkgs, flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = nixpkgs.lib.systems.flakeExposed;
      perSystem = { pkgs, lib, config, system, ... }: {
        devShells.default =
          pkgs.mkShell {
            buildInputs = [ 
              pkgs.nodejs_20
              pkgs.nodePackages.npm
              pkgs.dbmate
              pkgs.mariadb_105
              pkgs.php
            ];
          };
      };
    };
}
