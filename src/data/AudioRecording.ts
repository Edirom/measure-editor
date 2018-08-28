import {Source} from '@/data/Source';

export class AudioRecording implements Source {
    public get type(): string {
        return 'audio';
    }
    public constructor(public id: string, public name: string) {}
}
