import State from "./state";

export default class NFA extends Array<State> {
    constructor(...states: State[]) {
        super();
        this.concat(states);
    }

    /**
     * @description Concatenates two NFA State Machines and patches both together.
     * @param addend The NFA to add
     */
    joinNFAs(addend: NFA): void {
        this.at(-1)?.patch(1);
        this.concat(addend);
    }

    visualizeNFA(nfa: NFA = this): SVGElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg:ere-visualization");

        return(svg);
    }

    /*printNFA(nfa: NFA = this): string[] {
        for(let pointers: number[] = []; true;) {
            for(let i = 0; i < pointers.length; i++) {
                const currentPointer = pointers[i];
                const currentState = nfa[currentPointer];

                if(currentState.connections.length > 1) {
                    for(let i = 0; i < currentState.connections.length; i++) {
                        const relativePointingIndex = currentState.connections[i].relativePointingIndex
                        if(!relativePointingIndex) {throw new Error("Not implemented yet!!");}
                        const newPointer = currentPointer + relativePointingIndex;
                        pointers.push(newPointer);
                    }
                }

                // Reminder that this needs to be converted into string[]
                // Here add logic to add the connection's relativePointingIndex to the current Pointer
                // Uhhh there's probably a lot more, where the logic needs to be figured out.
            }
        }

        return(["This is tempoary!!"]);
    }*/
}