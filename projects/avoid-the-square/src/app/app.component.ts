import {Component, OnInit} from '@angular/core';

import {Cell} from './cell.object';
import {CellStateEnum} from './cell-state.enum';
import {environment} from '../environments/environment';
import {Square} from './square.object';
import {TeamEnum} from './team.enum';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    readonly CellStateEnum: typeof CellStateEnum = CellStateEnum;
    readonly TeamEnum: typeof TeamEnum = TeamEnum;
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
        if (cell.state === CellStateEnum.Impossible) {
            return;
        }

        switch (cell.state) {
            case CellStateEnum.Empty:
            case CellStateEnum.ForcedA: {
                cell.state = CellStateEnum.TeamA;
                break;
            }
            case CellStateEnum.TeamA:
            case CellStateEnum.ForcedB: {
                cell.state = CellStateEnum.TeamB;
                break;
            }

            case CellStateEnum.TeamB: {
                cell.state = CellStateEnum.Empty;
            }
        }

        this.detectSquares();
    }

    protected recalculateGrid() {
        this.buildGrid();
    }

    protected detectSquares() {
        this.state.squares = [];

        for (const cell of this.model.cells) {
            if (cell.state !== CellStateEnum.TeamA && cell.state !== CellStateEnum.TeamB) {
                cell.state = CellStateEnum.Empty;
            }
        }

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
        const cells = [
            this.state.cellMap[x][y],
            this.state.cellMap[x + offsetA][y + offsetB],
            this.state.cellMap[x + offsetA - offsetB][y + offsetA + offsetB],
            this.state.cellMap[x - offsetB][y + offsetA],
        ];

        const cellsByTeamMap: {[team: string]: Cell[]} = {
            '-1': [],
        };
        cellsByTeamMap[TeamEnum.TeamA] = [];
        cellsByTeamMap[TeamEnum.TeamB] = [];

        for (const cell of cells) {
            cellsByTeamMap[cell.team ?? -1].push(cell);
        }

        if (cellsByTeamMap[-1].length !== 1) {
            if (cellsByTeamMap[TeamEnum.TeamA].length !== 4 && cellsByTeamMap[TeamEnum.TeamB].length !== 4) {
                return null;
            }

            const complateSquareTeam = (cellsByTeamMap[TeamEnum.TeamA].length === 4 ? TeamEnum.TeamA : TeamEnum.TeamB);
            return new Square(cells[0], cells[1], cells[2], cells[3], complateSquareTeam, true);
        }

        if (cellsByTeamMap[TeamEnum.TeamA].length !== 3 && cellsByTeamMap[TeamEnum.TeamB].length !== 3) {
            return null;
        }

        const emptyCell = cellsByTeamMap[-1][0];
        const squareTeam = (cellsByTeamMap[TeamEnum.TeamA].length === 3 ? TeamEnum.TeamA : TeamEnum.TeamB);

        if (emptyCell.state === CellStateEnum.Empty) {
            emptyCell.state = (squareTeam === TeamEnum.TeamA ? CellStateEnum.ForcedB : CellStateEnum.ForcedA);
        } else if (emptyCell.state === CellStateEnum.ForcedA && squareTeam === TeamEnum.TeamA) {
            emptyCell.state = CellStateEnum.Impossible;
        } else if (emptyCell.state === CellStateEnum.ForcedB && squareTeam === TeamEnum.TeamB) {
            emptyCell.state = CellStateEnum.Impossible;
        }

        return new Square(cells[0], cells[1], cells[2], cells[3], squareTeam);
    }
}
