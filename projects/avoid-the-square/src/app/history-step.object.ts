import {CellAction} from './cell-action.object';

export class HistoryStep {
    constructor(
        public actions: CellAction[],
    ) {}
}
