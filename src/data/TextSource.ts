import {Source} from '@/data/Source';

export class TextSource implements Source {
    public get type(): string {
        return 'text';
    }
    public constructor(public id: string, public name: string) {}
}
