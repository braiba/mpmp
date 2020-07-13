import {TeamEnum} from './team.enum';

export class CellAction {
    constructor(
        public x: number,
        public y: number,
        public prevTeam: TeamEnum,
        public newTeam: TeamEnum,
    ) {}
}
