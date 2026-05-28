import { useCallback, useRef, useSyncExternalStore } from "react";
import configStore from "../core/configStore";
import { ConfigStoreProps, GSH, GAH, States, UseHandlers } from "../core/configStore/types";
import UUIDGenerator from "@/utils/functions/generateUUID";
import protectSnapshot from "@/utils/functions/protectSnapshot";

export default function createStore<
    S extends States, 
    SH extends GSH<S> = GSH<S>, 
    AH extends GAH<S> = GAH<S>
>(option: ConfigStoreProps<S, SH, AH>) {
    const {handlers, consume, getSnapshot} = configStore<S, SH, AH>(option);
    const generateUUID = UUIDGenerator();

    function useStore<T>(selector: (state: S) => T): T {
        const storeIdRef = useRef<string | null>(null);

        if(storeIdRef.current === null) {
            storeIdRef.current = generateUUID();
        }

        const storeId = storeIdRef.current;

        const subscribe = useCallback((cb: () => void) => {
            const unsubscribe = consume(storeId, cb);
            return unsubscribe;
        }, [storeId])

        const snapshot = useSyncExternalStore(
            subscribe,
            () => getSnapshot(storeId, selector),
            () => getSnapshot(storeId, selector)
        );

        return protectSnapshot(snapshot);
    }

    const useHandlers = (): UseHandlers<S, SH, AH> => handlers;

    return {
        useStore,
        useHandlers
    }
}

export type CreateStore<S extends States, SH extends GSH<S> = GSH<S>, AH extends GAH<S> = GAH<S>> = ReturnType<typeof createStore<S, SH, AH>>