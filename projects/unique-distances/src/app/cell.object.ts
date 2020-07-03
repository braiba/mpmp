import {Distance} from './distance.object';

export class Cell {
    constructor(
        public x: number,
        public y: number,
    ) {}

    public getDistance(c: Cell): Distance {
        return new Distance(Math.abs(c.x - this.x), Math.abs(c.y - this.y));
    }

    public getCellsByDistance(d: Distance): Cell[] {
        if (d.horizontal === d.vertical) {
            return [
                new Cell(this.x + d.horizontal, this.y + d.horizontal),
                new Cell(this.x - d.horizontal, this.y + d.horizontal),
                new Cell(this.x + d.horizontal, this.y - d.horizontal),
                new Cell(this.x - d.horizontal, this.y - d.horizontal),
            ];
        }

        return [
            new Cell(this.x + d.horizontal, this.y + d.vertical),
            new Cell(this.x - d.horizontal, this.y + d.vertical),
            new Cell(this.x + d.horizontal, this.y - d.vertical),
            new Cell(this.x - d.horizontal, this.y - d.vertical),
            new Cell(this.x + d.vertical, this.y + d.horizontal),
            new Cell(this.x - d.vertical, this.y + d.horizontal),
            new Cell(this.x + d.vertical, this.y - d.horizontal),
            new Cell(this.x - d.vertical, this.y - d.horizontal),
        ];
    }
}
