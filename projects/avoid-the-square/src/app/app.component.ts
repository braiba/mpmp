import {Component, HostListener, OnInit} from '@angular/core';

import {Board} from './board.object';
import {Cell} from './cell.object';
import {CellAction} from './cell-action.object';
import {CellStateEnum} from './cell-state.enum';
import {environment} from '../environments/environment';
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
        gridSize: number;
        gifFrameDuration: number;
        gifRepeat: boolean;
        gifRepeatDelay: number;
    } = {
        gridSize: 10,
        gifFrameDuration: 150,
        gifRepeat: false,
        gifRepeatDelay: 3,
    };

    state: {
        board: Board,
        generatingGif: boolean,
        gifUrl: string,
    } = {
        board: null,
        generatingGif: false,
        gifUrl: null,
    };

    ngOnInit() {
        this.buildGrid();
    }

    buildGrid() {
        this.state.board = new Board(this.model.gridSize);
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

        let newTeam: TeamEnum = null;
        switch (cell.state) {
            case CellStateEnum.Empty:
            case CellStateEnum.ForcedA: {
                newTeam = TeamEnum.TeamA;
                break;
            }
            case CellStateEnum.TeamA:
            case CellStateEnum.ForcedB: {
                newTeam = TeamEnum.TeamB;
                break;
            }
        }

        this.state.board.do(new CellAction(cell.x, cell.y, cell.team, newTeam));
    }

    public canDoAllForced(): boolean {
        const boardState = this.state.board.boardState;
        return (
            boardState.completeSquareCount === 0
            && boardState.impossibleCellCount === 0
            && boardState.forcedSquareCount !== 0
        );
    }

    doAllForced() {
        const actions: CellAction[] = [];
        for (const cell of this.state.board.boardState.cells) {
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

        this.state.board.doMultiple(actions);
    }

    goBack() {
        this.state.board.goBack();
    }

    goForward() {
        this.state.board.goForward();
    }

    protected recalculateGrid() {
        this.buildGrid();
    }

    generateGif() {
        this.state.generatingGif = true;

        this.state.board.generateGif(this.model.gifFrameDuration, (this.model.gifRepeat ? this.model.gifRepeatDelay : null))
            .then((gifUrl) => {
                this.state.gifUrl = gifUrl;
                this.state.generatingGif = false;
            });
    }
}
