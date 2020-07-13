import {Component, HostListener, OnInit} from '@angular/core';

import {Cell} from './cell.object';
import {CellStateEnum} from './cell-state.enum';
import {environment} from '../environments/environment';
import {Square} from './square.object';
import {TeamEnum} from './team.enum';
import {HistoryStep} from './history-step.object';
import {CellAction} from './cell-action.object';

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
        gridSize: 10,
    };

    state: {
        cellMap: Cell[][];
        completeSquareCount: number,
        forcedSquareCount: number;
        gridSize: number;
        history: HistoryStep[],
        historyIndex: number,
        impossibleCellCount: number,
        squares: Square[],
    } = {
        cellMap: [],
        completeSquareCount: 0,
        forcedSquareCount: 0,
        gridSize: 5,
        history: [],
        historyIndex: 0,
        impossibleCellCount: 0,
        squares: [],
    };

    ngOnInit() {
        this.buildGrid();
    }

    buildGrid() {
        this.state.gridSize = this.model.gridSize;
        this.state.squares = [];

        this.state.history = [];
        this.state.historyIndex = 0;

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

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'z') {
            this.goBack();
        }
    }

    clickCell(cell: Cell) {
        if (cell.state === CellStateEnum.Impossible) {
            return;
        }

        const prevTeam = cell.team;
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
        const newTeam = cell.team;

        if (this.state.history.length > this.state.historyIndex) {
            this.state.history.splice(this.state.historyIndex);
        }
        this.state.history.push(new HistoryStep([new CellAction(cell.x, cell.y, prevTeam, newTeam)]));
        this.state.historyIndex++;

        this.detectSquares();
    }

    doAllForced() {
        const actions: CellAction[] = [];
        for (const cell of this.model.cells) {
            if (cell.state === CellStateEnum.ForcedA) {
                cell.state = CellStateEnum.TeamA;
                actions.push(new CellAction(cell.x, cell.y, null, TeamEnum.TeamA));
            } else if (cell.state === CellStateEnum.ForcedB) {
                cell.state = CellStateEnum.TeamB;
                actions.push(new CellAction(cell.x, cell.y, null, TeamEnum.TeamB));
            }
        }

        if (actions.length === 0) {
            return;
        }

        if (this.state.history.length > this.state.historyIndex) {
            this.state.history.splice(this.state.historyIndex);
        }
        this.state.history.push(new HistoryStep(actions));
        this.state.historyIndex++;

        this.detectSquares();
    }

    goBack() {
        if (this.state.historyIndex === 0) {
            return;
        }

        this.state.historyIndex--;
        const step = this.state.history[this.state.historyIndex];

        for (const action of step.actions) {
            this.state.cellMap[action.x][action.y].state = this.getTeamCellState(action.prevTeam);
        }

        this.detectSquares();
    }

    goForward() {
        if (this.state.historyIndex >= this.state.history.length) {
            return;
        }

        const step = this.state.history[this.state.historyIndex];
        this.state.historyIndex++;

        for (const action of step.actions) {
            this.state.cellMap[action.x][action.y].state = this.getTeamCellState(action.newTeam);
        }

        this.detectSquares();
    }

    protected getTeamCellState(team: TeamEnum): CellStateEnum {
        if (team === TeamEnum.TeamA) {
            return CellStateEnum.TeamA;
        }
        if (team === TeamEnum.TeamB) {
            return CellStateEnum.TeamB;
        }
        return CellStateEnum.Empty;
    }

    protected recalculateGrid() {
        this.buildGrid();
    }

    protected detectSquares() {
        this.state.squares = [];
        this.state.completeSquareCount = 0;
        this.state.forcedSquareCount = 0;
        this.state.impossibleCellCount = 0;

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

            const completeSquareTeam = (cellsByTeamMap[TeamEnum.TeamA].length === 4 ? TeamEnum.TeamA : TeamEnum.TeamB);
            this.state.completeSquareCount++;
            return new Square(cells[0], cells[1], cells[2], cells[3], completeSquareTeam, true);
        }

        if (cellsByTeamMap[TeamEnum.TeamA].length !== 3 && cellsByTeamMap[TeamEnum.TeamB].length !== 3) {
            return null;
        }

        const emptyCell = cellsByTeamMap[-1][0];
        const squareTeam = (cellsByTeamMap[TeamEnum.TeamA].length === 3 ? TeamEnum.TeamA : TeamEnum.TeamB);

        if (emptyCell.state === CellStateEnum.Empty) {
            emptyCell.state = (squareTeam === TeamEnum.TeamA ? CellStateEnum.ForcedB : CellStateEnum.ForcedA);
            this.state.forcedSquareCount++;
        } else if (
            emptyCell.state === CellStateEnum.ForcedA && squareTeam === TeamEnum.TeamA
            || emptyCell.state === CellStateEnum.ForcedB && squareTeam === TeamEnum.TeamB
        ) {
            emptyCell.state = CellStateEnum.Impossible;
            this.state.impossibleCellCount++;
        }

        return new Square(cells[0], cells[1], cells[2], cells[3], squareTeam);
    }
}
