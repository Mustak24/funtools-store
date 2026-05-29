import runAction, { Action } from "@/utils/functions/runAction";


export type ArrayHandlers<S extends Array<any>, V = S extends Array<infer T> ? T : never> = S extends Array<V> ? {
    push: (val: V) => V;
    pop: () => V;
    shift: () => V;
    unShift: (val: V) => V;
    update: (index: number, val: Action<V>) => V;
    remove: (index: number) => V;
    findAndUpdate: (predicate: (val: V) => boolean, val: Action<V>) => V | undefined;
    findAndRemove: (predicate: (val: V) => boolean) => V | undefined;
    map: (callback: (val: V, index: number) => V) => V[];
    filter: (callback: (val: V, index: number) => boolean) => V[];
} : {}


export default function arrayHandlers<S extends Array<any>, V = S extends Array<infer T> ? T : never>(
    getState: () => S, setState: (value: S) => void
): ArrayHandlers<S, V> {

    if(!Array.isArray(getState())) return {} as ArrayHandlers<S, V>;

    return {
        push: (val: V) => {
            setState([...getState(), val] as S);
            return val;
        },

        pop: () => {
            const state = getState();
            setState([...state.slice(0, -1)] as S);
            return state[state.length - 1];
        },

        shift: () => {
            const state = getState();
            setState([...state.slice(1)] as S);
            return state[0];
        },

        unShift: (val: V) => {
            const state = getState();
            setState([val, ...state] as S);
            return val;
        },

        update: (index: number, val: Action<V>) => {
            const state = getState();
            const newState = [...state];
            index = (index + state.length) % state.length;
            newState[index] = runAction(val, state[index]);
            setState(newState as S);
            return newState[index];
        },

        remove: (index: number) => {
            const state = getState();
            const removed = state[index];
            index = (index + state.length) % state.length;
            const newState = state.filter((_, i) => i !== index);
            setState([...newState] as S);
            return removed;
        },

        findAndUpdate: (predicate: (val: V) => boolean, val: Action<V>) => {
            const state = getState();
            const index = state.findIndex(predicate);
            if (index === -1) return undefined;
            const newState = [...state];
            newState[index] = runAction(val, state[index]);
            setState(newState as S);
            return newState[index];
        },

        findAndRemove: (predicate: (val: V) => boolean) => {
            const state = getState();
            const index = state.findIndex(predicate);
            if (index === -1) return undefined;
            const removed = state[index];
            const newState = state.filter((_, i) => i !== index);
            setState([...newState] as S);
            return removed;
        },

        map: (callback: (val: V, index: number) => V) => {
            const state = getState();
            const newState = state.map(callback);
            setState(newState as S);
            return newState;
        },

        filter: (callback: (val: V, index: number) => boolean) => {
            const state = getState();
            const newState = state.filter(callback);
            setState(newState as S);
            return newState;
        }
    }
}