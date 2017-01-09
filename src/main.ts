import { makeWire, probe, halfAdder, setSignal, Digital, propagate, makeAgenda } from "./simulation";

function main() {
    makeAgenda();
    
    let a  = makeWire();
    let b  = makeWire();
    let sum     = makeWire();
    let carry   = makeWire();

    probe('a', a);
    probe('b', b);
    probe('sum', sum);
    probe('carry', carry);
    halfAdder(a,  b, sum, carry);
    setSignal(a, Digital.High);
    propagate();
    setSignal(b, Digital.High);
    propagate();
}

main();