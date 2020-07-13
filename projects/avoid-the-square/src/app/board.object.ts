import {BoardState} from './board-state.object';
import {CellAction} from './cell-action.object';
import {Deferred} from './deferred.object';
import {HistoryStep} from './history-step.object';
import {environment} from '../environments/environment';

declare let Animated_GIF: any;

export class Board {
    boardState: BoardState;
    history: HistoryStep[] = [];
    historyIndex = 0;

    constructor(gridSize: number) {
        this.boardState = new BoardState(gridSize);
    }

    do(action: CellAction) {
        this.doMultiple([action]);
    }

    doMultiple(actions: CellAction[]) {
        const historyStep = new HistoryStep(actions);
        if (this.history.length > this.historyIndex) {
            this.history.splice(this.historyIndex);
        }
        this.history.push(historyStep);
        this.historyIndex++;

        this.boardState.applyHistoryStep(historyStep);
    }

    public canGoBack(): boolean {
        return (this.historyIndex !== 0);
    }

    public canGoForward(): boolean {
        return (this.historyIndex < this.history.length);
    }

    goBack() {
        if (this.historyIndex === 0) {
            return;
        }

        this.boardState.revertHistoryStep(this.history[--this.historyIndex]);
    }

    goForward() {
        if (this.historyIndex >= this.history.length) {
            return;
        }

        this.boardState.applyHistoryStep(this.history[this.historyIndex++]);
    }

    async generateGif(frameDuration: number, framesBeforeRepeat: number|null): Promise<string> {
        const size = (environment.gapSize + this.boardState.gridSize * (environment.gapSize + environment.cellSize));

        const ag = new Animated_GIF();
        ag.setRepeat(framesBeforeRepeat === null ? null : 0);
        ag.setSize(size, size);
        ag.setDelay(frameDuration);

        const boardState = new BoardState(this.boardState.gridSize);

        let image = boardState.render();
        ag.addFrame(image);

        for (const historyStep of this.history.slice(0, this.historyIndex)) {
            boardState.applyHistoryStep(historyStep);
            image = boardState.render();
            ag.addFrame(image);
        }

        if (framesBeforeRepeat) {
            for (let i = 0; i < framesBeforeRepeat; i++) {
                ag.addFrame(image);
            }
        }

        const deferred = new Deferred<string>();

        ag.getBase64GIF((gif) => {
            deferred.resolve(gif);
        });

        return deferred.promise;
    }
}
