import {fromJS, List, Map} from 'immutable';

import Constants from './constants';

/*
 * Create the initial memory for the LC3.
 * Returns: an Immutable.List with one entry per address, in order.
 */
function createMemory() {
    let memory = List(Array(Constants.MEMORY_SIZE)).map(x => 0);
    // TODO(william): load the OS memory here.
    return memory;
}

/*
 * Create the map of initial register values for the LC3.
 * Returns: an Immutable.Map from register name to word value,
 * for each register in Constants.REGISTER_NAMES.all.
 */
function createRegisters() {
    const registerDefaults = Map({
        "PC": 0x3000,
        "PSR": 0x8002,
    });

    return Map(Constants.REGISTER_NAMES.get("all").map(
            name => [name, registerDefaults.get(name) || 0]));
}

/*
 * Create the initial symbol table for the LC3.
 * This currently is just a blank symbol table,
 * but eventually should contain some predefined labels, etc.
 */
function createSymbolTable() {
    // TODO(william): Load the OS symbol table here.
    return Map();
}

/*
 * Create a new LC3 machine.
 * Don't invoke this with 'new'.
 */
export default function LC3() {
    return Map({
        memory: createMemory(),
        registers: createRegisters(),
        symbolTable: createSymbolTable(),
        consoleBuffer: "",
    });
}

/*
 * Get the condition code as -1, 0, or 1,
 * or null if the PSR is in an invalid state.
 */
export function getConditionCode(psr) {
    const [n, z, p] = [psr & 0x4, psr & 0x2, psr & 0x1];

    // Make sure exactly one condition code is set.
    if (!!n + !!z + !!p !== 1) {
        return null;
    }

    return n ? -1 : p ? 1 : 0;
}

/*
 * Get the condition code as "N", "Z", or "P",
 * or "Invalid" if the PSR is in an invalid state.
 *
 * This just uses the result of getConditionCode.
 */
export function formatConditionCode(psr) {
    switch (getConditionCode(psr)) {
        case null:
            return "Invalid";
        case -1:
            return "N";
        case 0: 
            return "Z";
        case 1:
            return "P";
    }
}

/*
 * Given a description of machine data to import,
 * in the form of an immutable map with key/value pairs including
 *     orig: integer,
 *     machineCode: List<Integer>,
 *     and symbolTable: Map<String, Integer>,
 * merge that data description into the given LC3 machine.
 */
export function mergeMemory(lc3, data) {
    const orig = data.get("orig");
    const machineCode = data.get("machineCode");
    const symbolTable = data.get("symbolTable") || Map();
    const length = machineCode.size;

    return lc3.update("memory", mem => mem.withMutations(mem => {
        for (let i = 0; i < length; i++) {
            mem.set(orig + i, machineCode.get(i));
        }
        return mem;
    })).update("symbolTable", table => table.concat(symbolTable));
}
