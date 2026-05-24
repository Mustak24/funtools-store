import cookAutoBuildHandlers from "./cookAutoBuildHandlers";
import mapObject from "@/utils/functions/mapObject";
import shallowEqual from "@/utils/functions/shallowEqual";
import { 
    ConfigStoreProps, GAH, GSH, States,
    UseHandlers, 
} from "./types";



export default function configStore<
    S extends States, 
    SH extends GSH<S> = GSH<S>,
    AH extends GAH<S> = GAH<S>
>({
    states, syncHandlers, asyncHandlers
}: ConfigStoreProps<S, SH, AH>) {

    const autoBuildHandlers = cookAutoBuildHandlers(states, () => notify());
    
    const syncHandlersObj = mapObject(syncHandlers ?? {}, (handler: any) => (
        (...args: any[]) => { 
            handler({states, handlers: autoBuildHandlers}, ...args); 
            notify(); 
        }
    ));
    
    const asyncHandlersObj = mapObject(asyncHandlers ?? {}, (handler: any) => (
        async (...args: any[]) => { 
            await handler({states, handlers: autoBuildHandlers}, ...args); 
            notify(); 
        }
    ));

    const handlers = Object.freeze({
        ...syncHandlersObj,
        ...asyncHandlersObj,
        ...autoBuildHandlers,
    }) as UseHandlers<S, SH, AH>;


    const consumers = new Map<string, () => void>();

    function consume(cb: () => void, storeId: string) {
        consumers.set(storeId, cb);
        return () => consumers.delete(storeId);
    }
    
    const cache = new Map<string, {
        val: any,
        isNeededToUpdate: boolean
    }>();
    
    function notify() {
        consumers.forEach((cb, key) => {
            const snapshot = cache.get(key);
            if(snapshot) {
                snapshot.isNeededToUpdate = true;
            }
            cb();
        });
    }


    function getSnapshot<T>(storeId: string, selector: (state: S) => T): T {
        const newSnapshot = selector(states);
        const oldSnapshot = cache.get(storeId);

        if(!oldSnapshot) {
            cache.set(storeId, {
                val: newSnapshot,
                isNeededToUpdate: false
            });

            return newSnapshot as T;
        }

        if(oldSnapshot.isNeededToUpdate) {
            oldSnapshot.isNeededToUpdate = false;
            if(shallowEqual(newSnapshot, oldSnapshot.val)) {
                return oldSnapshot.val as T;
            }

            oldSnapshot.val = newSnapshot;
            return oldSnapshot.val as T;
        }
        
        return oldSnapshot.val as T;
    }


    return {
        handlers,
        consume,
        getSnapshot
    }
}