const OrGateDelay = 5;
const AndGateDelay = 3;
const InverterDelay = 2;

interface Action {
    ():void;
}

export interface Agenda {
    currentTime:number;
    segments:Segment[];
}

interface Segment {
    time:number;
    queue:Action[];
}

let theAgenda:Agenda = null;

export enum Digital {
    Low = 0,
    High = 1
}

export interface Wire {
    signal:Digital;
    actions:Action[];
}

export function getSignal(w:Wire):Digital {
    return w.signal;
}

export function setSignal(w:Wire, s:Digital):void {
    if(w.signal === s)
        return;
    
    w.signal = s;
    callEach(w);
}

export function addAction(w:Wire, action:Action) {
    w.actions.push(action);
    action();
}

export function callEach(w:Wire) {
    w.actions.forEach( a=>a() );
}


export function afterDelay(delay:number, action:Action) {
    addToAgenda(delay + theAgenda.currentTime, action, theAgenda);
}

export function addToAgenda(time:number, action:Action, agenda:Agenda) {
    let segment = findOrCreateByTime(time, agenda.segments);

    segment.queue.push(action);
}

export function findOrCreateByTime(time:number, segments:Segment[]):Segment {
    let i = 0;

    for(; i < segments.length; i++) {
        if(segments[i].time === time) {
            return segments[i];
        }
        if(segments[i].time > time) {
            break;
        }
    }

    segments.splice(i, 0, makeTimeSegment(time));

    return segments[i];
}

export function makeTimeSegment(time:number):Segment {
    return {
        time:time,
        queue:[]
    };
}

export function segmentTime(s:Segment) {
    return s.time;
}

export function makeAgenda():void {
    theAgenda = {
        currentTime:0,
        segments:[]
    };
}

export function firstAgendaItem(agenda:Agenda) {
    if (emptyAgenda(agenda))
        throw Error('Empty agenda');

    let firstSeg = agenda.segments[0];

    agenda.currentTime = segmentTime(firstSeg);

    return firstSeg.queue[0];
}

export function removeFirstAgendaItem(agenda:Agenda) {
    let firstSeg = agenda.segments[0];

    if(firstSeg.queue.length === 1) {
        agenda.segments.shift();
        return;
    }
    firstSeg.queue.shift();
}

export function emptyAgenda(agenda:Agenda) {
    return agenda.segments.length === 0;
}

export function propagate() {
    while(!emptyAgenda(theAgenda)) {
        let firstItem = firstAgendaItem(theAgenda);
        firstItem();
        removeFirstAgendaItem(theAgenda);
    }
}

export function logicalNot(a:Digital):Digital {
    expectDigital(a);

    return a ^ Digital.High;
}

export function makeWire():Wire {
    return {
        signal:Digital.Low,
        actions:[]
    };
}

export function orGate(a:Wire, b:Wire, output:Wire) {
    function reaction() {
        let newValue = logicalOr(getSignal(a), getSignal(b));

        afterDelay(OrGateDelay, () => setSignal(output, newValue));
    }

    addAction(a, reaction);
    addAction(b, reaction);
}

export function andGate(a:Wire, b:Wire, output:Wire) {
    function reaction() {
        let newValue = logicalAnd(getSignal(a), getSignal(b));

        afterDelay(AndGateDelay, () => setSignal(output, newValue));
    }

    addAction(a, reaction);
    addAction(b, reaction);
}

function expectDigital(a:Digital) {
    if(a === Digital.Low || a === Digital.High)
        return;

    throw Error('Invalid digital signal value');
}

export function logicalAnd(a:Digital, b:Digital):Digital {
    expectDigital(a);
    expectDigital(b);

    return a & b;
}

export function logicalOr(a:Digital, b:Digital):Digital {
    expectDigital(a);
    expectDigital(b);

    return a | b;
}

export function inverter(input:Wire, output:Wire) {
    function reaction() {
        let newValue = logicalNot(getSignal(input));

        afterDelay(InverterDelay, ()=> setSignal(output, newValue));
    }

    addAction(input, reaction);
}

export function halfAdder(a:Wire, b:Wire, s:Wire, c:Wire) {
    let d = makeWire(),
        e = makeWire();

    orGate(a, b, d);
    andGate(a, b, c);
    inverter(c, e);
    andGate(d, e, s);
}

export function fullAdder(a:Wire, b:Wire, cIn:Wire, sum:Wire, cOut:Wire) {
    let s = makeWire(),
        c1 = makeWire(),
        c2 = makeWire();

    halfAdder(b, cIn, s, c1);
    halfAdder(a, s, sum, c2);
    orGate(c1, c2, cOut);
}

export function probe(name:string, wire:Wire) {
    addAction(wire, ()=>{
        console.log(name, theAgenda.currentTime, `new value ${getSignal(wire)}`);
    });
}

