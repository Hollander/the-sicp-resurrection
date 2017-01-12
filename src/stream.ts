export interface Delayed<T> {
    ():Stream<T>;
}

export interface Stream<T> {
    head:T,
    rest:Delayed<T>
}

function delay<T>(b:Delayed<T>):Delayed<T> {
    let result:{value:Stream<T>} = null;

    return () => {
        if(result == null) {
            result = {value:b()};
        }
        return result.value;
    };
}

function force<T>(delayed:Delayed<T>):Stream<T> {
    return delayed();
}

export function stream<T>(a:T, b:Delayed<T>):Stream<T> {
    return {
        head: a,
        rest:delay(b)
    }
}

export function streamHead<T>(s:Stream<T>) {
    return s.head;
}

export function streamRest<T>(s:Stream<T>) {
    return force(s.rest);
}

export function streamRef<T>(s:Stream<T>, n:number, fn:(t:T)=>void) {
    if(n === 0)
        return;

    fn(streamHead(s));
    streamRef(streamRest(s), n - 1, fn);
}

export function streamFilter<T>(s:Stream<T>, predicate:(t:T)=>boolean):Stream<T> {
    function next() {
        let t = streamHead(s);

        if(predicate(t)) {
            return stream(t, ()=> streamFilter(streamRest(s), predicate));
        } else {
            return streamFilter(streamRest(s), predicate);
        }
    }

    return next();
}