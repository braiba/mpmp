import {Cell} from './cell.object';
import {CellStateEnum} from './cell-state.enum';

export class Square {
    protected _polyPoints: string = null;

    constructor(
        public cell1: Cell,
        public cell2: Cell,
        public cell3: Cell,
        public cell4: Cell,
    ) {}

    public get polyPoints(): string {
        if (this._polyPoints === null) {
            this._polyPoints = this.generatePolyPoints();
        }
        return this._polyPoints;
    }

    public get state(): CellStateEnum {
        return this.cell1.state;
    }

    protected generatePolyPoints() {
        return [
            this.cell1.polyPoints,
            this.cell2.polyPoints,
            this.cell3.polyPoints,
            this.cell4.polyPoints,
            this.cell1.polyPoints,
        ].join(' ');
    }
}
