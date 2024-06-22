interface Connection {
    numCrossing: number;
    relativePointingIndex: number | undefined | null; // Null = Matching State
    condition: {character?: string; maximum?: number; minimum?: number};
}

export default class State {
    connections: Connection[];

    constructor() {
        this.connections = [];
    }

    patch(pointer: number) {
        for(let i = 0; i < this.connections.length; i++) {
            if(this.connections[i].relativePointingIndex !== undefined) {console.warn("Patching together already defined connection! This will most definitly lead to mistakes.");}
            this.connections[i].relativePointingIndex = pointer;
        }
    }
}