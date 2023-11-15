<script lang="ts">
    import { Init } from "./Shared";

    export let init: Init;
    export let play: () => void;

</script>

<main>
<header>
    <h1 id="title">
        <span id="title-first">Busca</span>
        <span id="title-second">Minas</span>
    </h1>
</header>
<div id="content">
    <div id="menu">
        <div class="menu-item">
            <input id="menu-nickname" name="menu-nickname" type="text" placeholder="Nickname" bind:value={init.name}>
        </div>
        <div class="menu-item">
            <h2>Tamaño del tablero</h2>
        </div>
        <div class="menu-item">
            <input id="menu-size-x" name="menu-size-x" type="number" placeholder="X" bind:value={init.size}>
            <input id="menu-size-y" name="menu-size-y" type="number" placeholder="Y" bind:value={init.size}>
        </div>
        <div class="menu-item">
            <h2>Porcentaje de minas</h2>
        </div>
        <div class="menu-item">
            <span class="menu-mines-percentage">10%</span>
            <input id="menu-mines-percentage-sel" name="menu-mines-percentage-sel" type="range" min="10" max="60" step="1" bind:value={init.minesPercentage}>
            <span class="menu-mines-percentage">60%</span>
        </div>
        <div class="menu-item">
            <span class="menu-colors">Colores:</span>
            <span class="menu-colors">Banderas</span>
            <input id="menu-colors-flags" name="menu-colors-flags" type="color" bind:value={init.flagsColor}>
            <span class="menu-colors">Minas</span>
            <input id="menu-colors-mines" name="menu-colors-mines" type="color" bind:value={init.minesColor}>
        </div>
        <div class="menu-item menu-left">
            <button id="menu-start" on:click={() => {play()}} >Empezar</button>
        </div>
      </div>
</div>
</main>

<style>

</style>