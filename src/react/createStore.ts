import { useEffect, useRef, useSyncExternalStore } from "react";
import configStore from "../core/configStore";
import { ConfigStoreProps, GSH, GAH, States, UseHandlers } from "../core/configStore/types";

export default function createStore<
    S extends States, 
    SH extends GSH<S> = GSH<S>, 
    AH extends GAH<S> = GAH<S>
>(option: ConfigStoreProps<S, SH, AH>) {
    const {handlers, consume, getSnapshot} = configStore<S, SH, AH>(option);

    function useStore<T>(selector: (state: S) => T): T {
        const storeId = useRef(crypto.randomUUID());
        const states = useSyncExternalStore(
            (cb) => {
                console.log("Subscribing to store with id -> ", storeId.current);
                const unsubscribe = consume(cb, storeId.current);
                return unsubscribe;
            },
            () => getSnapshot(storeId.current, selector),
            () => getSnapshot(storeId.current, selector)
        );
        // return states;
        return Object.freeze(structuredClone(states));
    }

    const useHandlers = (): UseHandlers<S, SH, AH> => handlers;

    return {
        useStore,
        useHandlers
    }
}

export type CreateStore<S extends States, SH extends GSH<S> = GSH<S>, AH extends GAH<S> = GAH<S>> = ReturnType<typeof createStore<S, SH, AH>>