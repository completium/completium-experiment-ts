import BigNumber from 'bignumber.js';
import { Nat, Rational } from '../src/main'

describe('ArchetypeType', () => {
  describe('Nat', () => {
    describe('Constructor', () => {
      test('Fails if neg number', () => {
        expect(() => {new Nat(-5)}).toThrow("Not an Nat value: -5")
      });
    });

    describe('toString', () => {

      test('Number simple', () => {
        expect(new Nat(5).toString()).toBe("5");
      });

      test('String simple', () => {
        expect(new Nat("5").toString()).toBe("5");
      });

      test('Bignumber simple', () => {
        expect(new Nat(new BigNumber("5")).toString()).toBe("5");
      });

      test('String big', () => {
        expect(new Nat("9999999999999999999999999999999999999").toString()).toBe("9999999999999999999999999999999999999");
      });

      test('Bignumber big', () => {
        expect(new Nat(new BigNumber("9999999999999999999999999999999999999")).toString()).toBe("9999999999999999999999999999999999999");
      });
    })
  })



  describe('Rational', () => {
    describe('toString', () => {
      it('String simple', () => {
        expect(new Rational("5").toString()).toBe("5");
      });

      it('Number simple', () => {
        expect(new Rational(5).toString()).toBe("5");
      });

      it('Number decimal', () => {
        expect(new Rational(5.4464).toString()).toBe("5.4464");
      });

      it('String decimal', () => {
        expect(new Rational("5.4464").toString()).toBe("5.4464");
      });

      it('String decimal percent', () => {
        expect(new Rational("5.4464%").toString()).toBe("0.054464");
      });

      it('String with big number', () => {
        expect(new Rational("99999999999999999999999956456456456999999999", new BigNumber("999999999999956456456456999999999")).toString()).toBe("100000000000.00435435435425664606");
      });

    });

    describe('to_mich', () => {
      it('String simple', () => {
        expect(JSON.stringify(new Rational("5").to_mich())).toBe('{"prim":"Pair","args":[{"int":"5"},{"int":"1"}]}');
      });

      it('Number simple', () => {
        expect(JSON.stringify(new Rational(5).to_mich())).toBe('{"prim":"Pair","args":[{"int":"5"},{"int":"1"}]}');
      });

      it('Number decimal', () => {
        expect(JSON.stringify(new Rational(5.4464).to_mich())).toBe('{"prim":"Pair","args":[{"int":"3404"},{"int":"625"}]}');
      });

      it('String decimal', () => {
        expect(JSON.stringify(new Rational("5.4464").to_mich())).toBe('{"prim":"Pair","args":[{"int":"3404"},{"int":"625"}]}')
      });

      it('String decimal percent', () => {
        expect(JSON.stringify(new Rational("5.4464%").to_mich())).toBe('{"prim":"Pair","args":[{"int":"851"},{"int":"15625"}]}')
      });

      it('String with big number', () => {
        expect(JSON.stringify(new Rational("99999999999999999999999956456456456999999999", new BigNumber("999999999999956456456456999999999")).to_mich())).toBe('{"prim":"Pair","args":[{"int":"5000000000000217717717712832303"},{"int":"50000000000000000000"}]}')
      });
    });

  })
})
