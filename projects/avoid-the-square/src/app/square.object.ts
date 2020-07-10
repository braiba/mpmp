import {Cell} from './cell.object';
import {TeamEnum} from './team.enum';

export class Square {
    protected _polyPoints: string = null;

    constructor(
        public cell1: Cell,
        public cell2: Cell,
        public cell3: Cell,
        public cell4: Cell,
        public team: TeamEnum,
        public isComplete = false,
    ) {}

    public get polyPoints(): string {
        if (this._polyPoints === null) {
            this._polyPoints = this.generatePolyPoints();
        }
        return this._polyPoints;
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
