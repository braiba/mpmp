import {Component, OnInit} from '@angular/core';

import {Cell} from './cell.object';
import {CellStateEnum} from './cell-state.enum';
import {Distance} from './distance.object';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    readonly CellStateEnum: typeof CellStateEnum = CellStateEnum;

    model: {
        gridSize: number;
        selectedCells: Cell[],
    } = {
        gridSize: 3,
        selectedCells: [],
    };

    state: {
        grid: CellStateEnum[][];
        gridSize: number;
        distances: Distance[],
    } = {
        grid: [],
        gridSize: 3,
        distances: [],
    };

    ngOnInit() {
        this.buildGrid();
    }

    buildGrid() {
        this.state.gridSize = this.model.gridSize;
        this.state.distances = [];

        this.model.selectedCells = [];

        this.state.grid = [];
        for (let y = 0; y < this.model.gridSize; y++) {
            const row: CellStateEnum[] = [];
            for (let x = 0; x < this.model.gridSize; x++) {
                row.push(CellStateEnum.Empty);
            }

            this.state.grid.push(row);
        }
    }

    clickCell(x: number, y: number) {
        const cellState = this.state.grid[y][x];
        if (cellState === CellStateEnum.Forbidden) {
            return;
        }

        if (cellState === CellStateEnum.Empty) {
            this.activateCell(x, y);
            return;
        }

        if (cellState === CellStateEnum.Selected) {
            this.deactivateCell(x, y);
        }
    }

    protected activateCell(x: number, y: number) {
        const newCell = new Cell(x, y);

        const newDistances: Distance[] = [];
        for (const cell of this.model.selectedCells) {
            const distance = cell.getDistance(newCell);

            newDistances.push(distance);
            this.state.distances.push(distance);
        }

        for (const cell of this.model.selectedCells) {
            for (const distance of newDistances) {
                for (const otherCell of cell.getCellsByDistance(distance)) {
                    this.markCellIfEmpty(otherCell.x, otherCell.y, CellStateEnum.Forbidden);
                }
            }
        }

        for (const distance of this.state.distances) {
            for (const otherCell of newCell.getCellsByDistance(distance)) {
                this.markCellIfEmpty(otherCell.x, otherCell.y, CellStateEnum.Forbidden);
            }
        }

        this.model.selectedCells.push(newCell);

        this.model.selectedCells.push();
        this.state.grid[y][x] = CellStateEnum.Selected;

        this.checkForImpossibleCells();
    }

    protected deactivateCell(x: number, y: number) {
        this.state.grid[y][x] = CellStateEnum.Empty;

        const index = this.model.selectedCells
            .findIndex((selectedCell) => {
                return (selectedCell.x === x) && (selectedCell.y === y);
            });

        this.model.selectedCells.splice(index, 1);

        this.recalculateGrid();
    }

    protected markCellIfEmpty(x: number, y: number, newState: CellStateEnum) {
        if (
            (x < 0)
            || (y < 0)
            || (x >= this.model.gridSize)
            || (y >= this.model.gridSize)
            || (this.state.grid[y][x] !== CellStateEnum.Empty)
        ) {
            return;
        }

        this.state.grid[y][x] = newState;
    }

    protected recalculateGrid() {
        const cellsToAdd = this.model.selectedCells.slice();

        this.buildGrid();

        for (const cell of cellsToAdd) {
            this.activateCell(cell.x, cell.y);
        }

        this.checkForImpossibleCells();
    }

    protected checkForImpossibleCells() {
        for (let y = 0; y < this.model.gridSize; y++) {
            for (let x = 0; x < this.model.gridSize; x++) {
                const cellState = this.state.grid[y][x];

                if ((cellState === CellStateEnum.Empty) && this.isCellImpossible(x, y)) {
                    this.state.grid[y][x] = CellStateEnum.Impossible;
                }
            }
        }
    }

    protected isCellImpossible(x: number, y: number): boolean {
        const cell = new Cell(x, y);

        const distances: Distance[] = [];
        for (const selectedCell of this.model.selectedCells) {
            const newDistance = cell.getDistance(selectedCell);
            for (const distance of distances) {
                if (distance.equal(newDistance)) {
                    return true;
                }
            }
            distances.push(newDistance);
        }

        return false;
    }
}
