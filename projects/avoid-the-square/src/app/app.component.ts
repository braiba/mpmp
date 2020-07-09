import {Component, OnInit} from '@angular/core';

import {Cell} from './cell.object';
import {CellStateEnum} from './cell-state.enum';
import {environment} from '../environments/environment';
import {Square} from './square.object';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    readonly CellStateEnum: typeof CellStateEnum = CellStateEnum;
    readonly GapSize = environment.gapSize;
    readonly CellSize = environment.cellSize;

    model: {
        cells: Cell[];
        gridSize: number;
    } = {
        cells: [],
        gridSize: 5,
    };

    state: {
        cellMap: Cell[][];
        gridSize: number;
        squares: Square[],
    } = {
        cellMap: [],
        gridSize: 5,
        squares: [],
    };

    ngOnInit() {
        this.buildGrid();
    }

    buildGrid() {
        this.state.gridSize = this.model.gridSize;
        this.state.squares = [];

        this.model.cells = [];
        this.state.cellMap = [];
        for (let x = 0; x < this.model.gridSize; x++) {
            const col: Cell[] = [];
            for (let y = 0; y < this.model.gridSize; y++) {
                const cell = new Cell(x, y, CellStateEnum.Empty);
                this.model.cells.push(cell);
                col.push(cell);
            }

            this.state.cellMap.push(col);
        }
    }

    clickCell(cell: Cell) {
        if (cell.state === CellStateEnum.Forbidden) {
            return;
        }

        if (cell.state === CellStateEnum.Empty) {
            cell.state = CellStateEnum.TeamA;
        } else if (cell.state === CellStateEnum.TeamA) {
            cell.state = CellStateEnum.TeamB;
        } else {
            cell.state = CellStateEnum.Empty;
        }

        this.detectSquares();
    }

    protected recalculateGrid() {
        this.buildGrid();
    }

    protected detectSquares() {
        this.state.squares = [];

        for (let a = 1; a < this.state.gridSize; a++) {
            for (let b = 0; b < this.state.gridSize - a; b++) {
                this.detectSquareType(a, b);
            }
        }
    }

    protected detectSquareType(offsetA: number, offsetB) {
        const footprintSize = offsetA + offsetB;
        for (let x = 0; x < this.state.gridSize - footprintSize; x++) {
            for (let y = 0; y < this.state.gridSize - footprintSize; y++) {
                const square = this.isSquare(x + offsetB, y, offsetA, offsetB);
                if (square) {
                    this.state.squares.push(square);
                }
            }
        }
    }

    protected isSquare(x: number, y: number, offsetA: number, offsetB): Square {
        const cellState = this.state.cellMap[x][y].state;
        if (cellState === CellStateEnum.Empty) {
            return null;
        }

        if (
            this.state.cellMap[x + offsetA][y + offsetB].state !== cellState
            || this.state.cellMap[x + offsetA - offsetB][y + offsetA + offsetB].state !== cellState
            || this.state.cellMap[x - offsetB][y + offsetA].state !== cellState
        ) {
            return null;
        }

        return new Square(
            this.state.cellMap[x][y],
            this.state.cellMap[x + offsetA][y + offsetB],
            this.state.cellMap[x + offsetA - offsetB][y + offsetA + offsetB],
            this.state.cellMap[x - offsetB][y + offsetA],
        );
    }
}
