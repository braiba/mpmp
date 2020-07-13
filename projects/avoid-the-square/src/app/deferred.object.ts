import {DeferredStateEnum} from './deferred-state.enum';

export class Deferred<T> {
    promise: Promise<T>;

    protected _state: DeferredStateEnum = DeferredStateEnum.Pending;
    protected promiseResolve: (value?: T | PromiseLike<T>) => void;
    protected promiseReject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject  = reject;
        });
    }

    resolve(value?: T | PromiseLike<T>) {
        this.promiseResolve(value);
        this._state = DeferredStateEnum.Resolved;
    }

    reject(reason?: any) {
        this.promiseReject(reason);
        this._state = DeferredStateEnum.Rejected;
    }

    get state(): DeferredStateEnum {
        return this._state;
    }
}
