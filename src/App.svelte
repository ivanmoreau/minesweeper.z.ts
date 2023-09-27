<script lang="ts">
  import { Future } from 'bird-future';
  import { drawNumber, drawBomb, drawUndiscovered, Color } from './lib/drawing';

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
  }

  type Mine = {
    tag: 'Mine';
    isMine: true;
    discovered: boolean;
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
    crypto.getRandomValues(arrInit);
    // Calculate mines
    var mines = map<number, Field>(arrInit)((x) => {
      if (x < 32) {
        return { tag: 'Mine', isMine: true, discovered: false };
      } else {
        return { tag: 'NonMine', neighbors: 0, discovered: false };
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
      let canvasElem: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D = canvasElem.getContext('2d') as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
      for (let i = 0; i < field.length; i++) {
        let xCoord = (i % size) * 40;
        let yCoord = Math.floor(i / size) * 40;

        if (field[i].discovered === false) {
          drawUndiscovered(ctx, xCoord, yCoord, new Color(255, 255, 255, 255), 1.0);
          continue;
        }
        if (field[i].tag === 'Mine') {
          drawBomb(ctx, xCoord, yCoord, new Color(255, 255, 255, 255), 1.0);
        } else {
          let NonMine = field[i] as NonMine;
          if (NonMine.neighbors == 0) {
            console.log(`Skipping ${i} because it has no neighbors`);
            continue;
          }
          drawNumber(ctx, xCoord,yCoord, NonMine.neighbors, new Color(255, 0, 0, 255), 1.0);
        }
      }
      resolve();
    });
  }

  var field: Field[] = [];
  var size = 10;
  var gameEnded = false

  function play() {
    gameEnded = false
    field = generateField(size);
    drawField(field);
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


  var isGameStarted = false;
</script>

<main>
  <h1>Minesweeper</h1>


  {#if isGameStarted}
    <div class="card">
      <canvas id="canvas" width="400" height="400"></canvas>
    </div>
    <div id="card">
      <button on:click={() => play()}>Play</button>
    </div>
    <div class="card">
    {#each getMatrixField(field) as row, i}
      <div class="row">
        {#each row as field, j}
          <div class="field">
            {#if field.discovered}
              {#if field.tag === 'Mine'}
                <button on:click={() => tryDiscover(i * size + j)} class="mine">💣</button>
              {:else}
                <button on:click={() => tryDiscover(i * size + j)} class="non-mine">{field.neighbors}</button>
              {/if}
            {:else}
              <button on:click={() => tryDiscover(i * size + j)} class="undiscovered">?</button>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
    </div>
  {:else}
    <div class="card">
      <button on:click={() => isGameStarted = true}>Start Game</button>
    </div>
  {/if}


</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }

  .row {
    display: flex;
    flex-direction: row;
  }
</style>
