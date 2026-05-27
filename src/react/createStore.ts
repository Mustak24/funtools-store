import { useRef, useSyncExternalStore } from "react";
import configStore from "../core/configStore";
import { ConfigStoreProps, GSH, GAH, States, UseHandlers } from "../core/configStore/types";
import UUIDGenerator from "@/utils/functions/generateUUID";

export default function createStore<
    S extends States, 
    SH extends GSH<S> = GSH<S>, 
    AH extends GAH<S> = GAH<S>
>(option: ConfigStoreProps<S, SH, AH>) {
    const {handlers, consume, getSnapshot} = configStore<S, SH, AH>(option);
    const generateUUID = useRef(UUIDGenerator()).current;

    function useStore<T>(selector: (state: S) => T): T {
        const storeId = useRef(generateUUID());
        const states = useSyncExternalStore(
            (cb) => {
                const unsubscribe = consume(storeId.current, cb);
                return unsubscribe;
            },
            () => getSnapshot(storeId.current, selector),
            () => getSnapshot(storeId.current, selector)
        );
        
        return Object.freeze(structuredClone(states));
    }

    const useHandlers = (): UseHandlers<S, SH, AH> => handlers;

    return {
        useStore,
        useHandlers
    }
}

export type CreateStore<S extends States, SH extends GSH<S> = GSH<S>, AH extends GAH<S> = GAH<S>> = ReturnType<typeof createStore<S, SH, AH>>