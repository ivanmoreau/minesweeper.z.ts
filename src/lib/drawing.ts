
export class Color {
    constructor(public r: number, public g: number, public b: number, public a: number) {}
    toString(): string {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    withOpacity(a: number): Color {
      return new Color(this.r, this.g, this.b, a);
    }
  }
      
  function executeCommand(ctx: CanvasRenderingContext2D, command: string, x: number, y: number, x1: number, y1: number, scale: number = 1.0) {
    switch (command) {
      case "move":
        ctx.moveTo(x + x1 * scale, y + y1 * scale);
        break;
      case "line":
        ctx.lineTo(x + x1 * scale, y + y1 * scale);
        break;
      default:
        throw new Error(`Unknown command ${command}`);
    }
  }

export function drawBox(ctx : CanvasRenderingContext2D, x: number, y: number, color: Color, scale: number = 1.0) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + 39 * scale, y);
    ctx.lineTo(x + 39 * scale, y + 39 * scale);
    ctx.lineTo(x, y + 39 * scale);
    ctx.lineTo(x, y);
  }

  // 40 x 40 px for each field (as 10 x 10 fields in 400 x 400 px), scale 1 as default.
  export function drawNumber(ctx: CanvasRenderingContext2D, x: number, y: number, number: number, color: Color, scale: number = 1.0) {
    let one = [
      { command: "move", x: 20, y: 5},
      { command: "line", x: 20, y: 35},
    ]
    let two = [
      { command: "move", x: 5, y: 5},
      { command: "line", x: 35, y: 5},
      { command: "line", x: 35, y: 20},
      { command: "line", x: 5, y: 20},
      { command: "line", x: 5, y: 35},
      { command: "line", x: 35, y: 35},
    ]
    let three = [
      { command: "move", x: 5, y: 5},
      { command: "line", x: 35, y: 5},
      { command: "line", x: 35, y: 20},
      { command: "line", x: 20, y: 20},
      { command: "line", x: 35, y: 20},
      { command: "line", x: 35, y: 35},
      { command: "line", x: 5, y: 35},
    ]
    let four = [
      { command: "move", x: 5, y: 5},
      { command: "line", x: 5, y: 20},
      { command: "line", x: 35, y: 20},
      { command: "move", x: 35, y: 5},
      { command: "line", x: 35, y: 35},
    ]
    let five = [
      { command: "move", x: 35, y: 5},
      { command: "line", x: 5, y: 5},
      { command: "line", x: 5, y: 20},
      { command: "line", x: 35, y: 20},
      { command: "line", x: 35, y: 35},
      { command: "line", x: 5, y: 35},
    ]
    let six = [
      { command: "move", x: 35, y: 5},
      { command: "line", x: 5, y: 5},
      { command: "line", x: 5, y: 35},
      { command: "line", x: 35, y: 35},
      { command: "line", x: 35, y: 20},
      { command: "line", x: 5, y: 20},
    ]
    let seven = [
      { command: "move", x: 5, y: 5},
      { command: "line", x: 35, y: 5},
      { command: "line", x: 5, y: 35},
    ]
    let eight = [
      { command: "move", x: 5, y: 5},
      { command: "line", x: 35, y: 5},
      { command: "line", x: 35, y: 35},
      { command: "line", x: 5, y: 35},
      { command: "line", x: 5, y: 5},
      { command: "move", x: 5, y: 20},
      { command: "line", x: 35, y: 20},
    ]
    let collection = [one, two, three, four, five, six, seven, eight];


    let oldFillStyle = ctx.strokeStyle;
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    for (const command of collection[number - 1]) {
      executeCommand(ctx, command.command, x, y, command.x, command.y, scale);
    }
    drawBox(ctx, x, y, color, scale);
    ctx.stroke();
    ctx.strokeStyle = oldFillStyle;
  }

  export function drawBomb(ctx: CanvasRenderingContext2D, x: number, y: number, color: Color, scale: number = 1.0) {
    let bomb = [
      { command: "move", x: 20, y: 5},
      { command: "line", x: 20, y: 35},
      { command: "move", x: 5, y: 20},
      { command: "line", x: 35, y: 20},
      { command: "move", x: 5, y: 5},
      { command: "line", x: 35, y: 35},
      { command: "move", x: 35, y: 5},
      { command: "line", x: 5, y: 35},
    ]
    let oldFillStyle = ctx.strokeStyle;
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    for (const command of bomb) {
      executeCommand(ctx, command.command, x, y, command.x, command.y, scale);
    }
    drawBox(ctx, x, y, color, scale);
    ctx.stroke();
    ctx.strokeStyle = oldFillStyle;
  }

  export function drawUndiscovered(ctx: CanvasRenderingContext2D, x: number, y: number, color: Color, scale: number = 1.0) {
    let oldFillStyle = ctx.strokeStyle;
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    drawBox(ctx, x, y, color, scale);
    ctx.stroke();
    ctx.strokeStyle = oldFillStyle;
  }