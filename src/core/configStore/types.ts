import { Action } from "../../utils/functions/runAction";
import { ArrayHandlers } from "./cookAutoBuildHandlers/Handlers/array.handlers";
import { BoolHandlers } from "./cookAutoBuildHandlers/Handlers/bool.handlers";
import { ObjectHandlers } from "./cookAutoBuildHandlers/Handlers/object.handler";


export type States = Record<string, any>;


export type ConfigStoreProps<
    S extends States,
    SH extends GSH<S> = GSH<S>,
    AH extends GAH<S> = GAH<S>
> = {
    states: S,
    syncHandlers?: SH,
    asyncHandlers?: AH
}



type CookedHandler<S extends States, V> = (
    V extends (first: {states: S, handlers: StateHandlers<S>}, ...args: infer A) => infer R ? (
        (...args: A) => R
    ) : never
)



export type GSH<S extends States> = Record<string, (first: { states: S, handlers: StateHandlers<S> }, ...args: any[]) => any>;

export type GAH<S extends States> = Record<string, (first: { states: S, handlers: StateHandlers<S> }, ...args: any[]) => Promise<any>>;



export type SyncHandlerRecord<S extends States, H extends GSH<S>> = {
    [K in keyof H]: CookedHandler<S, H[K]>
};

export type AsyncHandlerRecord<S extends States, H extends GAH<S>> = {
    [K in keyof H]: CookedHandler<S, H[K]>
};

export type StateHandlers<S extends States> = {
    [K in keyof S]: {
        set: (action: Action<S[K]>) => void,
        reset: () => void
    } & (
        S[K] extends Array<infer T> ? (
            ArrayHandlers<S[K], T>
        ) : S[K] extends object ? (
            ObjectHandlers<S[K]>
        ) : S[K] extends boolean ? (
            BoolHandlers<S[K]>
        ) : {}
    )
}


export type UseHandlers<S extends States, SH extends GSH<S> = GSH<S>, AH extends GAH<S> = GAH<S>> = (
    SyncHandlerRecord<S, SH> & AsyncHandlerRecord<S, AH> & StateHandlers<S> 
)