import { stream, Stream, streamRef, streamFilter, streamHead, streamRest } from './stream';
import { makeWire, probe, halfAdder, setSignal, Digital, propagate, makeAgenda } from "./simulation";

(function () {
    function integers(start = 1) {
        function next(n:number):Stream<number> {
            return stream(n, ()=>next(n + 1));
        }

        return next(start);
    }

    function fibonacci():Stream<number> {
        function next(a:number, b:number):Stream<number> {
            return stream(a, ()=> next(b, a + b));
        }

        return next(0, 1);
    }

    function primes():Stream<number> {
        function next(s:Stream<number>):Stream<number> {
            let head = streamHead(s);

            return stream(head, ()=> {
                return next(streamFilter(streamRest(s), (x)=>x % head != 0));
            });
        }

        return next(integers(2));
    }

    let even = streamFilter(integers(), (n)=>n % 2 === 0);

    streamRef(even, 10, (n)=>console.info(n));
    streamRef(fibonacci(), 10, (n)=>console.info(n));
    streamRef(primes(), 11, (n)=>console.info(n));
})();

(function () {
    makeAgenda();

    let a = makeWire();
    let b = makeWire();
    let sum = makeWire();
    let carry = makeWire();

    probe('a', a);
    probe('b', b);
    probe('sum', sum);
    probe('carry', carry);
    halfAdder(a, b, sum, carry);
    setSignal(a, Digital.High);
    propagate();
    setSignal(b, Digital.High);
    propagate();
})();
