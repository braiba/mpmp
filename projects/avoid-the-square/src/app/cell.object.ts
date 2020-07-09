import {CellStateEnum} from './cell-state.enum';
import {environment} from '../environments/environment';

export class Cell {
    protected _polyPoints: string = null;
    protected _xPos: number = null;
    protected _yPos: number = null;

    constructor(
        public x: number,
        public y: number,
        public state: CellStateEnum,
    ) {}

    public get xPos(): number {
        if (this._xPos === null) {
            this._xPos = environment.gapSize + this.x * (environment.gapSize + environment.cellSize) + environment.cellSize / 2;
        }
        return this._xPos;
    }

    public get yPos(): number {
        if (this._yPos === null) {
            this._yPos = environment.gapSize + this.y * (environment.gapSize + environment.cellSize) + environment.cellSize / 2;
        }
        return this._yPos;
    }

    public get polyPoints(): string {
        if (this._polyPoints === null) {
            this._polyPoints = this.generatePolyPoints();
        }
        return this._polyPoints;
    }

    protected generatePolyPoints() {
        return this.xPos + ',' + this.yPos;
    }
}
