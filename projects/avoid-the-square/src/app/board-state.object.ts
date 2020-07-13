import {Cell} from './cell.object';
import {Square} from './square.object';
import {HistoryStep} from './history-step.object';
import {CellStateEnum} from './cell-state.enum';
import {TeamEnum} from './team.enum';
import {environment} from '../environments/environment';

export class BoardState {
    public cells: Cell[] = [];
    public cellMap: Cell[][] = [];
    public completeSquareCount = 0;
    public forcedSquareCount = 0;
    public impossibleCellCount = 0;
    public squares: Square[];

    constructor(public gridSize: number) {
        this.squares = [];

        this.cells = [];
        this.cellMap = [];
        for (let x = 0; x < this.gridSize; x++) {
            const col: Cell[] = [];
            for (let y = 0; y < this.gridSize; y++) {
                const cell = new Cell(x, y, CellStateEnum.Empty);
                this.cells.push(cell);
                col.push(cell);
            }

            this.cellMap.push(col);
        }
    }

    applyHistoryStep(step: HistoryStep) {
        for (const action of step.actions) {
            this.cellMap[action.x][action.y].state = this.getTeamCellState(action.newTeam);
        }

        this.detectSquares();
    }

    revertHistoryStep(step: HistoryStep) {
        for (const action of step.actions) {
            this.cellMap[action.x][action.y].state = this.getTeamCellState(action.prevTeam);
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

    protected detectSquares() {
        this.squares = [];
        this.completeSquareCount = 0;
        this.forcedSquareCount = 0;
        this.impossibleCellCount = 0;

        for (const cell of this.cells) {
            if (cell.state !== CellStateEnum.TeamA && cell.state !== CellStateEnum.TeamB) {
                cell.state = CellStateEnum.Empty;
            }
        }

        for (let a = 1; a < this.gridSize; a++) {
            for (let b = 0; b < this.gridSize - a; b++) {
                this.detectSquareType(a, b);
            }
        }
    }

    protected detectSquareType(offsetA: number, offsetB) {
        const footprintSize = offsetA + offsetB;
        for (let x = 0; x < this.gridSize - footprintSize; x++) {
            for (let y = 0; y < this.gridSize - footprintSize; y++) {
                const square = this.isSquare(x + offsetB, y, offsetA, offsetB);
                if (square) {
                    this.squares.push(square);
                }
            }
        }
    }

    protected isSquare(x: number, y: number, offsetA: number, offsetB): Square {
        const cells = [
            this.cellMap[x][y],
            this.cellMap[x + offsetA][y + offsetB],
            this.cellMap[x + offsetA - offsetB][y + offsetA + offsetB],
            this.cellMap[x - offsetB][y + offsetA],
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
            this.completeSquareCount++;
            return new Square(cells[0], cells[1], cells[2], cells[3], completeSquareTeam, true);
        }

        if (cellsByTeamMap[TeamEnum.TeamA].length !== 3 && cellsByTeamMap[TeamEnum.TeamB].length !== 3) {
            return null;
        }

        const emptyCell = cellsByTeamMap[-1][0];
        const squareTeam = (cellsByTeamMap[TeamEnum.TeamA].length === 3 ? TeamEnum.TeamA : TeamEnum.TeamB);

        if (emptyCell.state === CellStateEnum.Empty) {
            emptyCell.state = (squareTeam === TeamEnum.TeamA ? CellStateEnum.ForcedB : CellStateEnum.ForcedA);
            this.forcedSquareCount++;
        } else if (
            emptyCell.state === CellStateEnum.ForcedA && squareTeam === TeamEnum.TeamA
            || emptyCell.state === CellStateEnum.ForcedB && squareTeam === TeamEnum.TeamB
        ) {
            emptyCell.state = CellStateEnum.Impossible;
            this.impossibleCellCount++;
        }

        return new Square(cells[0], cells[1], cells[2], cells[3], squareTeam);
    }

    public render(): ImageBitmap {
        const size = (environment.gapSize + this.gridSize * (environment.gapSize + environment.cellSize));

        const canvas = new OffscreenCanvas(size, size);

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (const square of this.squares) {
            ctx.strokeStyle = (square.team === TeamEnum.TeamA ? 'blue' : 'red');

            if (square.isComplete) {
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
            } else {
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 3]);
            }

            ctx.beginPath();

            ctx.moveTo(square.cell1.xPos, square.cell1.yPos);
            ctx.lineTo(square.cell2.xPos, square.cell2.yPos);
            ctx.lineTo(square.cell3.xPos, square.cell3.yPos);
            ctx.lineTo(square.cell4.xPos, square.cell4.yPos);
            ctx.lineTo(square.cell1.xPos, square.cell1.yPos);

            ctx.stroke();
        }

        ctx.setLineDash([]);

        for (const cell of this.cells) {
            ctx.beginPath();
            ctx.arc(cell.xPos, cell.yPos, environment.cellSize / 2, 0, 2 * Math.PI);

            switch (cell.state) {
                case CellStateEnum.Empty: {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'lightgrey';
                    ctx.stroke();
                    break;
                }

                case CellStateEnum.TeamA: {
                    ctx.fillStyle = 'blue';
                    ctx.fill();
                    break;
                }

                case CellStateEnum.TeamB: {
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    break;
                }

                case CellStateEnum.ForcedA: {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'blue';
                    ctx.stroke();
                    break;
                }

                case CellStateEnum.ForcedB: {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();
                    break;
                }
            }
        }

        return canvas.transferToImageBitmap();
    }
}
