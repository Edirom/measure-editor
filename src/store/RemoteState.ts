import {Measure} from '@/data/Measure';
import {generateUUID} from '@/data/utils';

export interface RemoteState<T> {
    create(element: T): Promise<T>;
    delete(element: T): Promise<T>;
    update(element: T): Promise<T>;
    get(): Promise<T[]>;
    getSingle(id: number): Promise<T>;
}
export interface RemoteSourceState<T> extends RemoteState<T> {
    attachToWork(element: T, workId: string): Promise<T>;
    detachFromWork(element: T, workId: string): Promise<T>;
}
export interface RemoteMeasureState {
    create(measure: Measure, imageId: string): Promise<Measure>;
    delete(measure: Measure): Promise<Measure>;
    update(measure: Measure): Promise<Measure>;
    getForImage(imageId: string): Promise<Measure[]>;
}
export class NoopRemoteState<T extends {id: string}> implements RemoteSourceState<T> {
    private nextId = 100;
    public attachToWork(element: T, workId: string): Promise<T> {
        return new Promise<T>((resolve) => resolve(element));
    }

    public create(element: T): Promise<T> {
        return new Promise<T>((resolve) => {
            if (element.id === '') {
                element.id = generateUUID();
            }
            resolve(element);
        });
    }

    public delete(element: T): Promise<T> {
        return new Promise<T>((resolve) => resolve(element));
    }

    public detachFromWork(element: T, workId: string): Promise<T> {
        return new Promise<T>((resolve) => resolve(element));
    }

    public get(): Promise<T[]> {
        return new Promise<T[]>((resolve) => resolve([]));
    }

    public getSingle(id: number): Promise<T> {
        return new Promise<T>((resolve, reject) => reject());
    }

    public update(element: T): Promise<T> {
        return new Promise<T>((resolve) => resolve(element));
    }
}
