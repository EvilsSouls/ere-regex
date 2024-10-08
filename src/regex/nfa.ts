import State from "./state";
import type { FinalConnectionPointer } from "./state";

import Rectangle from "../svg/rectangle";
import Arrow from "../svg/arrow";

interface VisualPointer {
    pos: number;
    x: number;
    y: number;
}

export default class NFA extends Array<State> {
    constructor(...states: State[]) {
        super();
        this.concatArrays(...states);
    }

    /**
     * @summary Combines two or more arrays. This method modifies `this` unlike the built-in concat method.
     * @param items Additional arrays and/or items to add to the end of the array.
     */
    concatArrays(...items: State[] | NFA): void {
        for(let i = 0; i < items.length; i++) {
            this.push(items[i].clone());
        }
    }

    /**
     * @description Concatenates two NFA State Machines and patches both together.
     * @param addend The NFA to add
     */
    joinNFAs(addend: NFA): void {
        for(let i = 0; i < this.length; i++) {
            this[i].patch(this.length - i);
        }
        this.concatArrays(...addend);
    }

    /**
     * @description Patches all States' free floating arrows to point to one single State. Unlike joinNFAs this does not join two NFAs together. It only changes the existing connections. This is especially useful to form a loop, since you need all the connections at the end of the branch(es) to point to the start of the loop.
     * @param pointer The relative pointer to which the floating connections should all point to. (Counting from the first state, so for example -1 would point to the state before the NFA)
     */
    patchAllStates(pointer: FinalConnectionPointer): void {
        for(let i = 0; i < this.length; i++) {
            this[i].patch((pointer !== null) ? -i + pointer : null);
        }
    }

    /**
     * @description Creates multiple different alternate branches in the state machine.
     * @param nfaBranches All different alternate branches.
     */
    addBranches(...nfaBranches: NFA[]): void {
        const branchingState = new State();
        const tempNFA = new NFA(); // Temporary NFA to add all of the states of the single NFAs (from nfaBranches) to.
        // Adds all connections to the Branching State, so that later on the branches can just be added to the fragment (with the branching state).
        for(let i = 0, relativeStartingIndex = 1; i < nfaBranches.length; i++) {
            const currentBranch = nfaBranches[i];
            branchingState.addConnection(relativeStartingIndex);
            tempNFA.concatArrays(...currentBranch);
            relativeStartingIndex += currentBranch.length;
        }
        const newFragment = new NFA(branchingState);
        newFragment.concatArrays(...tempNFA);
        this.joinNFAs(newFragment);
    }

    /**
     * @todo Just finish this lmao
     */
    visualizeNFA(nfa: NFA = this): SVGElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        new Arrow(svg, "", 0, parseInt(`${svg.height}`, 10) / 2, 50, parseInt(`${svg.height}`, 10) / 2, "straight");

        for(const pointers: VisualPointer[] = [{pos: 0, x: 50, y: parseInt(`${svg.height}`, 10) / 2}], visitedStates: Map<number, VisualPointer> = new Map<number, VisualPointer>(); pointers.length > 0;) {
            for(let i = 0; i < pointers.length; i++) {
                const currentPointer = pointers[i];
                const currentState = nfa[currentPointer.pos];
                new Rectangle(svg, currentPointer.x, currentPointer.y, 50, 50);
                visitedStates.set(currentPointer.pos, currentPointer);
                pointers.splice(i, 1);
                for(const currentConnection of currentState.connections) {
                    if(currentConnection.relativePointingIndex === 0) {throw new Error("Self-pointing States are not supported.");}
                    if(currentConnection.relativePointingIndex ? currentConnection.relativePointingIndex:1 < 0) {
                        new Arrow(svg, currentConnection.character ? currentConnection.character:"", currentPointer.x + 25, currentPointer.y + 50, visitedStates.get(currentConnection.relativePointingIndex as number + currentPointer.pos)?.x as number, visitedStates.get(currentConnection.relativePointingIndex as number + currentPointer.pos)?.y as number, 100, 500, "bezier");
                    } else {
                        new Arrow(svg, currentConnection.character ? currentConnection.character:"", currentPointer.x + 50, currentPointer.y + 25, currentPointer.x + 100, currentPointer.y + 25, "straight");
                        if(currentConnection.relativePointingIndex) {
                            const newPointer: VisualPointer = {pos: currentPointer.pos + currentConnection.relativePointingIndex, x: currentPointer.x + 100, y: currentPointer.y};
                            pointers.push(newPointer);
                        }
                    }
                }
            }
        }

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