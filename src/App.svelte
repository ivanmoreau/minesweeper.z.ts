<script lang="ts">
  import { Future } from 'bird-future';
  import { Init } from './Shared';
  import { drawNumber, drawBomb, drawUndiscovered, Color, drawFlag } from './lib/drawing';

  import Start from './Start.svelte';
  import Game from './Game.svelte';
  import { GameServiceClient } from './GameServiceClient';
    import type { Score } from './models/Score';

  let gameServiceClient = new GameServiceClient('/api.php');

  function map<A, B>(iterable: Iterable<A>): (fn: (a: A) => B) => B[] {
    return (fn: (a: A) => B) => {
      const result: B[] = [];
      for (const a of iterable) {
        result.push(fn(a));
      }
      return result;
    }
  }

  function filter<A>(iterable: Iterable<A>): (fn: (a: A) => boolean) => A[] {
    return (fn: (a: A) => boolean) => {
      const result: A[] = [];
      for (const a of iterable) {
        if (fn(a)) {
          result.push(a);
        }
      }
      return result;
    }
  }

  function each<A>(iterable: Iterable<A>): (fn: (a: A) => void) => void {
    return (fn: (a: A) => void) => {
      for (const a of iterable) {
        fn(a);
      }
    }
  }

  function *withIx<A>(iterable: Iterable<A>): IterableIterator<[number, A]> {
    var ix = 0;
    for (const a of iterable) {
      yield [ix, a];
      ix++;
    }
  }

  type NonMine = {
    tag: 'NonMine';
    neighbors: number;
    discovered: boolean;
    flagged: boolean;
  }

  type Mine = {
    tag: 'Mine';
    isMine: true;
    discovered: boolean;
    flagged: boolean;
  }

  type Field = NonMine | Mine;

  /// If expression with lazy evaluation
  /// @param cond The condition
  /// @returns A function that takes two thunks.
  function ifexp<A>(cond: boolean): (first: () => A, second: () => A) => A {
    return (first: () => A, second: () => A) => {
      if (cond) {
        return first();
      } else {
        return second();
      }
    }
  }

  /// Check the neighbors of a field
  /// @param fields The field array
  /// @param ix The index of the field
  function checkNeighbors(fields: Field[], ix: number): number {
    let fieldSize = Math.sqrt(fields.length);
    let neighborsCanditateIxsLeft = ifexp<number[]>(ix % fieldSize != 0)(() => [
      ix - fieldSize - 1,
      ix - 1,
      ix + fieldSize - 1
    ], () => [])
    let neighborsCanditateIxsRight = ifexp<number[]>(ix % fieldSize != fieldSize - 1)(() => [
      ix - fieldSize + 1,
      ix + 1,
      ix + fieldSize + 1
    ], () => [])
    let neighborsCanditateIxs = filter([
      ix - fieldSize,
      ix + fieldSize,
    ].concat(neighborsCanditateIxsLeft).concat(neighborsCanditateIxsRight))((y) => y >= 0 && y < fields.length);
    let neighbors = filter(neighborsCanditateIxs)((ix) => fields[ix].tag === 'Mine').length;
    return neighbors;
  }

  /// Get the auto-discoverable neighbors of a field
  /// That is, the neighbors that are not disovered yet.
  /// If there is a mine in the neighbors, return null.
  function getAutoDiscoverableNeighbors(fields: Field[], ix: number): number[] | null {
    let fieldSize = Math.sqrt(fields.length);
    let neighborsCanditateIxsLeft = ifexp<number[]>(ix % fieldSize != 0)(() => [
      ix - fieldSize - 1,
      ix - 1,
      ix + fieldSize - 1
    ], () => [])
    let neighborsCanditateIxsRight = ifexp<number[]>(ix % fieldSize != fieldSize - 1)(() => [
      ix - fieldSize + 1,
      ix + 1,
      ix + fieldSize + 1
    ], () => [])
    let neighborsCanditateIxs = filter([
      ix - fieldSize,
      ix + fieldSize,
    ].concat(neighborsCanditateIxsLeft).concat(neighborsCanditateIxsRight))((y) => y >= 0 && y < fields.length);
    var hasBomb = false;
    let neighbors = filter(neighborsCanditateIxs)((ix: number) => {
      if (fields[ix].tag === 'NonMine') {
        return true;
      } else {
        hasBomb = true;
        return false;
      }
    })
    if (hasBomb) {
      return null;
    } else {
      return neighbors;
    }
  }

  /// Discover a field
  /// Return the auto-discovered fields
  /// If there is a mine adjacent to the field, return null, as
  /// we can only auto-discover fields that are entirely surrounded by
  /// discovered non-mines.
  function discoverField(fields: Field[], ixInit: number): number[] | null {
    let fieldSize = Math.sqrt(fields.length);
    let discovered: number[] = [];
    let toDiscover: number[] = [ixInit];
    while (toDiscover.length > 0) {
      let ix = toDiscover.pop() as number;
      let neighbors = getAutoDiscoverableNeighbors(fields, ix);
      discovered.push(ix);
      if (neighbors === null) {
        continue;
      }
      toDiscover = toDiscover.concat(filter(neighbors)((ix) => fields[ix].tag != 'Mine' && discovered.indexOf(ix) === -1));
    }
    return discovered;
  }

  function generateField(size: number): Field[] {
    // Pseudo-cryptographically generate values
    var arrInit: Uint8Array = new Uint8Array(size * size);
    console.log(`Generating ${size * size} random values`);
    crypto.getRandomValues(arrInit);
    // Calculate mines
    var mines = map<number, Field>(arrInit)((x) => {
      if (x < 255 * (init.minesPercentage / 100)) {
        return { tag: 'Mine', isMine: true, discovered: false, flagged: false };
      } else {
        return { tag: 'NonMine', neighbors: 0, discovered: false, flagged: false };
      }
    });
    // Calculate neighbors
    for (let i = 0; i < mines.length; i++) {
      if (mines[i].tag === 'NonMine') {
        (mines[i] as NonMine).neighbors = checkNeighbors(mines, i);
      }
    }
    return mines;
  }

  function drawField(field: Field[]): Promise<void> {
    return new Promise((resolve, reject) => {
      let canvasElem: HTMLCanvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D = canvasElem.getContext('2d') as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
      let resizeFactor = canvasElem.width / (init.size * 40);
      for (let i = 0; i < field.length; i++) {
        let xCoord = (i % init.size) * 40 * resizeFactor;
        let yCoord = Math.floor(i / init.size) * 40 * resizeFactor;

        if (field[i].flagged === true) {
          drawFlag(ctx, xCoord, yCoord, new Color(255, 255, 255, 255), resizeFactor);
          continue;
        }
        if (field[i].discovered === false) {
          drawUndiscovered(ctx, xCoord, yCoord, new Color(255, 255, 255, 255), resizeFactor);
          continue;
        }
        if (field[i].tag === 'Mine') {
          drawBomb(ctx, xCoord, yCoord, new Color(255, 255, 255, 255), resizeFactor);
        } else {
          let NonMine = field[i] as NonMine;
          if (NonMine.neighbors == 0) {
            console.log(`Skipping ${i} because it has no neighbors`);
            continue;
          }
          drawNumber(ctx, xCoord,yCoord, NonMine.neighbors, new Color(255, 0, 0, 255), resizeFactor);
        }
      }
      resolve();
    });
  }

  var field: Field[] = [];
  var gameEnded = false
  var startTime = 0;
  var scoresPromise: Promise<Score[]> = gameServiceClient.getBestScores();

  var setFlagMode = new class {
    private flagMode = false;
    getBoolean() {
      return this.flagMode;
    }
    setBoolean(value: boolean) {
      console.log(`Setting flag mode to ${value}`);
      this.flagMode = value;
    }
  }

  function getMatrixField(field: Field[]): Field[][] {
    let fieldSize = Math.sqrt(field.length);
    let matrix: Field[][] = [];
    for (let i = 0; i < fieldSize; i++) {
      matrix.push(field.slice(i * fieldSize, (i + 1) * fieldSize));
    }
    return matrix;
  }
  
  function tryDiscover(ix: number) {
    if (gameEnded) {
      alert("You have already lost! Try again with Play.")
      return 1
    }
    console.log(`Trying to discover ${ix}`);
    console.log(`Flag mode: ${setFlagMode}`);
    if (setFlagMode.getBoolean()) {
      field[ix].flagged = !field[ix].flagged;
      drawField(field);
      return 1
    }
    let discoveredField = discoverField(field, ix);
    if (discoveredField != null) {
      each(discoveredField)((ix) => {
        field[ix].discovered = true;
      });
    }
    field[ix].discovered = true;
    if (field[ix].tag === 'Mine') {
      gameEnded = true
      alert('You lost!');
    }
    drawField(field);
  }

  function play() {
    console.log('Play!');
    console.log(`Size: ${init.size}`);
    console.log(`Mines percentage: ${init.minesPercentage}`);
    console.log(`Flags color: ${init.flagsColor}`);
    console.log(`Mines color: ${init.minesColor}`);
    console.log(`Name: ${init.name}`);
    startTime = Math.floor(Date.now() / 1000);
    gameEnded = false
    field = generateField(init.size);
    drawField(field);
  }

  async function click(event: MouseEvent) {
    if (gameEnded) {
      alert("You have already lost/win! Try again with Play.")
      return 1
    }
    // If all non-mines are discovered, you win
    let undiscoveredNonMines = filter(withIx(field))(([ix, field]) => field.tag === 'NonMine' && field.discovered === false);
    if (undiscoveredNonMines.length === 0) {
      gameEnded = true
      let finalTime = Math.floor(Date.now() / 1000) - startTime;
      await gameServiceClient.updateScore(init.name, finalTime, init.size, init.minesPercentage);
      scoresPromise = gameServiceClient.getBestScores();
      alert('You win!');
      return 1
    }

    let canvasElem: HTMLCanvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D = canvasElem.getContext('2d') as CanvasRenderingContext2D;
    let rect: DOMRect = canvasElem.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let resizeFactor = canvasElem.width / (init.size * 40);
    let ix = Math.floor(x / (40 * resizeFactor)) + Math.floor(y / (40 * resizeFactor)) * init.size;
    console.log(`Clicked on ix: ${ix} x: (${x}, y: ${y})`);
    tryDiscover(ix);

    if (undiscoveredNonMines.length === 0) {
      gameEnded = true
      let finalTime =  Math.floor(Date.now() / 1000) - startTime;
      await gameServiceClient.updateScore(init.name, finalTime, init.size, init.minesPercentage);
      scoresPromise = gameServiceClient.getBestScores();
      alert('You win!');
      return 1
    }
  }


  async function setGamePage() {
    isGamePage = true;
    await gameServiceClient.createUser(init.name);
  }


  var isGameStarted = false;

  var isGamePage = false;

  let init: Init = {
    name: '',
    size: 20,
    minesPercentage: 10,
    flagsColor: '#000000',
    minesColor: '#000000'
  };
</script>


{#if isGamePage}
  <Game play={play} click={click} gameServiceClient={gameServiceClient} mode_set_flag={setFlagMode} scoresPromise={scoresPromise}/>
{:else}
  <Start init={init} play={setGamePage} />
{/if}


<style>

</style>
