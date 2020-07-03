export class Distance {
    constructor(
        public horizontal: number,
        public vertical: number,
    ) {}

    public equal(d: Distance) {
        return (
            ((d.horizontal === this.horizontal) && (d.vertical === this.vertical))
            || ((d.horizontal === this.vertical) && (d.vertical === this.horizontal))
        );
    }
}
