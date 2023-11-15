<script lang="ts">
    import type { GameServiceClient } from "./GameServiceClient";
    import type { Score } from "./models/Score";

    export let play: () => void;
    export let click: (event: MouseEvent) => void;
    export let gameServiceClient: GameServiceClient;
    export let mode_set_flag: {
        getBoolean: () => boolean;
        setBoolean: (value: boolean) => void;
    };
    let doRerender = false;
    export let scoresPromise: Promise<Score[]>;

    var inititalized = false;
    function onLoaded() {
        let p = new Promise((resolve, reject) => {
            if (!inititalized) {
                let playy = () => {
                    if (document.getElementById('game-canvas')) {
                        inititalized = true;
                        play();
                        resolve(0);
                    } else {
                        setTimeout(playy, 1000);
                    }
                }
                playy();
            }
        });
        p.then(() => {
            console.log('Game loaded!');
        });
    }

    // Refresh the page
    function newGame() {
        window.location.reload();
    }

    onLoaded();
</script>

<main>
<div id="game-zone">
    <div id="game-time"></div>
    <div id="game-content">
        <div id="game-frame">
            <canvas id="game-canvas" width="400" height="400" on:click={(event) => {click(event)}}></canvas>
        </div>
        <div id="game-controls">
            <button id="game-new" on:click={() => {newGame()}}>Nuevo</button>
            <button id="game-restart" on:click={() => {play()}}>Restart</button>
            <button id="game-set-flag" on:click={() => {
                mode_set_flag.setBoolean(!mode_set_flag.getBoolean());
                doRerender = mode_set_flag.getBoolean();
                }}>Set Flag (now: {doRerender ? 'on' : 'off'})</button>
        </div>
    </div>
    <div id="game-statistics">
        <span class="game-statistics-value" id="game-statistics-loss">Loss</span>
        <span class="game-statistics-value" id="game-statistics-win">Win</span>
        <span class="game-statistics-value" id="game-statistics-games">Games</span>
    </div>
</div>
<div id="game-info">
    <header>
    <h1 id="title">
        <span id="title-first">Busca</span>
        <span id="title-second">Minas</span>
    </h1>
    </header>
    <div id="game-top">
        <div id="game-top-title">
            <span>Top 5</span>
        </div>
        <div id="game-top-table">
            <table>
                <tr id="game-top-table-header">
                    <th>Nickname</th>
                    <th>Time</th>
                    <th>Size</th>
                    <th>Difficulty</th>
                    <th>Score</th>
                </tr>
                {#await scoresPromise then scores}
                    {#each scores as game}
                        {#await gameServiceClient.getUserName(game.user_id) then userName}
                            <tr>
                                <td>{userName}</td>
                                <td>{game.time}</td>
                                <td>{game.size}</td>
                                <td>{game.difficulty}</td>
                                <td>{game.score}</td>
                            </tr>
                        {/await}
                    {/each}
                {/await}
            </table>
        </div>
    </div>
</div>
</main>

<style>
    main {
        flex-direction: row;
    }

    button {
        font-size: 0.8em;
    }

    #game-zone {
        display: flex;
        flex-direction: column;
        flex: 1;
        margin-left: 6rem;
        margin-top: auto;
        margin-bottom: auto;
    }

    #game-content {
        display: flex;
        flex-direction: row;
        flex: 1;
    }

    #game-controls {
        display: flex;
        flex-direction: column;
        flex: 1;
        max-width: 100px;
        justify-content: flex-end;
    }

    #game-statistics {
        display: none;
    }
</style>