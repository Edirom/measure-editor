export class RGB {
    constructor(public red: number, public green: number, public blue: number) {
    }

    public equals(other: RGB): boolean {
        return this.red === other.red && this.green === other.green && this.blue === other.blue;
    }
}
