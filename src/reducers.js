import {Map} from 'immutable';

import LC3 from './core/lc3';
import LC3Program from './core/program';
import * as Constants from './core/constants';

const initialState = Map({
    lc3: new LC3(),
    viewOptions: Map({
        topAddressShown: 0x3000,
        followPC: true,
    }),
});

function setPC(state, newPC) {
    return state.setIn(["lc3", "registers", "pc"], newPC);
}

function setMemory(state, address, value) {
    return state.setIn(["lc3", "memory", address], value);
}

function setRegister(state, name, value) {
    return state.setIn(["lc3", "registers", name], value);
}

function loadProgram(state, program) {
    const data = new LC3Program.fromJS(program);
    return state.update("lc3", lc3 => lc3.loadProgram(data));
}

function scrollTo(state, address) {
    return state.setIn(["viewOptions", "topAddressShown"],
        Math.max(0, Math.min(address, Constants.MEMORY_SIZE - 1)));
}

function scrollToPC(state) {
    return scrollTo(state, state.get("lc3").registers.pc);
}

function scrollBy(state, delta) {
    const currentAddress = state.getIn(["viewOptions", "topAddressShown"]);
    return scrollTo(state, currentAddress + delta);
}

function step(state) {
    return state.update("lc3", lc3 => lc3.step());
}

function enqueueStdin(state, text) {
    return state.updateIn(["lc3", "console", "stdin"], old => old + text);
}

function clearStdin(state) {
    return state.setIn(["lc3", "console", "stdin"], "");
}

function clearStdout(state) {
    return state.setIn(["lc3", "console", "stdout"], "");
}

function setNewlineMode(state, newlineMode) {
    return state.setIn(["lc3", "console", "newlineMode"], newlineMode);
}

export default function reducer(state = initialState, action) {

    switch (action.type) {
        case "SET_PC":
            return setPC(state, action.newPC);
        case "SET_MEMORY":
            return setMemory(state, action.address, action.value);
        case "SET_REGISTER":
            return setRegister(state, action.name, action.value);
        case "LOAD_PROGRAM":
            return loadProgram(state, action.program);
        case "SCROLL_TO":
            return scrollTo(state, action.address);
        case "SCROLL_TO_PC":
            return scrollToPC(state);
        case "SCROLL_BY":
            return scrollBy(state, action.delta);
        case "STEP":
            return step(state);
        case "ENQUEUE_STDIN":
            return enqueueStdin(state, action.text);
        case "CLEAR_STDIN":
            return clearStdin(state);
        case "CLEAR_STDOUT":
            return clearStdout(state);
        case "SET_NEWLINE_MODE":
            return setNewlineMode(state, action.newlineMode);
    }

    return state;
}
