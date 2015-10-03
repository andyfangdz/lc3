import {expect} from 'chai';

import {Map, List} from 'immutable';

import LC3, {
    getConditionCode, formatConditionCode,
    mergeMemory,
} from '../../src/core/lc3';
import Constants from '../../src/core/constants';

describe('LC3', () => {

    describe("the LC3 constructor", () => {

        const lc3 = LC3();

        it("creates some sort of thing", () => {
            expect(lc3).to.be.ok;
        });

        it("has a memory buffer of the right length", () => {
            const memory = lc3.get("memory");
            expect(memory.size).to.equal(Constants.MEMORY_SIZE);
        });

        it("has the right number of registers", () => {
            const registers = lc3.get("registers");
            expect(registers.size).to.equal(
                Constants.REGISTER_NAMES.get("all").size);
        });

        it("has the program counter set to 0x3000", () => {
            const registers = lc3.get("registers");
            const pc = registers.get("PC");
            expect(pc).to.equal(0x3000);
        });

        it("has a symbol table", () => {
            const symbolTable = lc3.get("symbolTable");
            expect(symbolTable).to.be.ok;
        });

        it("starts with an empty console buffer", () => {
            const consoleBuffer = lc3.get("consoleBuffer");
            expect(consoleBuffer).to.equal("");
        });

    });

    describe('getConditionCode', () => {
        const test = (psr, expected) => () => {
            expect(getConditionCode(psr)).to.equal(expected);
        };

        it("handles the negative case", test(0x8004, -1));
        it("handles the zero case", test(0x8002, 0));
        it("handles the positive case", test(0x8001, 1));

        it("fails when none of the bits is set", test(0x8000, null));
        it("fails when two of the bits are set", test(0x8003, null));
        it("fails when all the bits are set", test(0x8007, null));
    });

    describe('formatConditionCode', () => {
        const test = (psr, expected) => () => {
            expect(formatConditionCode(psr)).to.equal(expected);
        };

        it("handles the negative case", test(0x8004, "N"));
        it("handles the zero case", test(0x8002, "Z"));
        it("handles the positive case", test(0x8001, "P"));

        it("fails when none of the bits is set", test(0x8000, "Invalid"));
        it("fails when two of the bits are set", test(0x8003, "Invalid"));
        it("fails when all the bits are set", test(0x8007, "Invalid"));
    });

    describe('mergeMemory', () => {
        const lc3 = LC3();

        it("merges machine code", () => {
            const data = Map({
                orig: 0x3000,
                machineCode: List([0x5260, 0x1468, 0x1262, 0x1642]),
            });
            const newLC3 = mergeMemory(lc3, data);

            expect(newLC3).to.be.ok;
            expect(newLC3.get("memory").slice(0x2FFE, 0x3006)).
                to.equal(List([0, 0, 0x5260, 0x1468, 0x1262, 0x1642, 0, 0]));

            const data2 = Map({
                orig: 0x3002,
                machineCode: List([0xABCD, 0xBCDE, 0xCDEF]),
            });
            const newerLC3 = mergeMemory(newLC3, data2);

            expect(newerLC3).to.be.ok;
            expect(newerLC3.get("memory").slice(0x2FFE, 0x3006)).
                to.equal(List(
                    [0, 0, 0x5260, 0x1468, 0xABCD, 0xBCDE, 0xCDEF, 0]
                ));
        });

        it("merges a symbol table", () => {
            const data = Map({
                orig: 0x3000,
                machineCode: List([]),
                symbolTable: Map({
                    "START": 0x3000,
                    "DATA": 0x3100,
                }),
            });
            const newLC3 = mergeMemory(lc3, data);

            expect(newLC3).to.be.ok;
            expect(newLC3.getIn(["symbolTable", "START"])).to.equal(0x3000);
            expect(newLC3.getIn(["symbolTable", "DATA"])).to.equal(0x3100);

            const data2 = Map({
                orig: 0x3002,
                machineCode: List([]),
                symbolTable: Map({
                    "DATA": 0x3200,
                    "MORE": 0x3300,
                }),
            });
            const newerLC3 = mergeMemory(newLC3, data2);

            expect(newerLC3).to.be.ok;
            expect(newerLC3.getIn(["symbolTable", "START"])).to.equal(0x3000);
            expect(newerLC3.getIn(["symbolTable", "DATA"])).to.equal(0x3200);
            expect(newerLC3.getIn(["symbolTable", "MORE"])).to.equal(0x3300);
        });

    });

});
