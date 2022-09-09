const Completium = require('@completium/completium-cli');
import { BigNumber } from 'bignumber.js'

/* Michleline -------------------------------------------------------------- */

export type Mprim   = {
  "prim" : "True" | "False" | "None" | "Unit"
}

export type Mstring = {
  "string" : string
}

export type Mbytes  = {
  "bytes"  : string
}

export type Mint    = {
  "int"    : string
}

export type Mpair   = {
  "prim"   : "Pair",
  "args"   : Array<Micheline>
}

export type Melt   = {
  "prim"   : "Elt",
  "args"   : [ Micheline, Micheline ]
}

export type Msingle = {
  "prim"   : "Some" | "Right" | "Left",
  "args"   : [ Micheline ]
}

export type Marray  = Array<Micheline>

export type Micheline =
| Mprim
| Mstring
| Mbytes
| Mint
| Msingle
| Mpair
| Melt
| Marray

/* Michleline Type --------------------------------------------------------- */

export type MTprim = {
  "prim"   :  "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" |
              "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" |
              "never" | "operation" | "signature" | "string" | "timestamp" | "unit"
  "annots" : Array<string>
}

export type MTsingle = {
  "prim"   : "contract" | "list" | "option" | "set" | "ticket",
  "args"   : [ MichelineType ]
  "annots" : Array<string>
}

export type MTint   = {
  "prim"   : "sapling_transaction" | "sapling_state",
  "args"   : [
    { "int" : string }
  ]
  "annots" : Array<string>
}

export type MTPairArray = {
  "prim"   : "pair",
  "args"   : Array<MichelineType>
  "annots" : Array<string>
}

export type MTpair  = {
  "prim"   : "big_map" | "lambda" | "map" | "or",
  "args"   : [ MichelineType, MichelineType ]
  "annots" : Array<string>
}

export type MichelineType =
| MTprim
| MTsingle
| MTint
| MTpair
| MTPairArray


/* Interfaces -------------------------------------------------------------- */

export class Account {
  name : string;
  pubk : string;
  pkh  : string;
  sk   : string;
  constructor(n : string, k : string, h : string, s : string) {
    this.name = n
    this.pubk = k
    this.pkh  = h
    this.sk   = s
  }
  get_address = () : Address => {
    return new Address(this.pkh)
  }
  get_public_key = () : Key => {
    return new Key(this.pubk)
  }
  get_secret_key = () => {
    return this.sk
  }
  get_name = () => {
    return this.name
  }
}

export interface Parameters {
  as     : Account,
  amount : Tez
}

/* Archetype value */

export abstract class ArchetypeType {
  abstract to_mich() : Micheline
  abstract toString() : string
}

/* Int Nat Entrypoint Classes ---------------------------------------------- */

export class Address implements ArchetypeType {
  private _content : string
  constructor(v : string) {
    this._content = v
    /* TODO check address format */
  }
  to_mich() : Micheline {
    return string_to_mich(this._content)
  }
  equals(a : Address) : boolean {
    return this._content == a.toString()
  }
  toString(): string {
      return this._content
  }
}

export class Duration implements ArchetypeType {
  private _content : number
  constructor(v : string) {
    this._content = 0
    /* TODO converts Archetype duration literal to number of seconds */
  }
  to_mich() : Micheline {
    return { "int" : this._content.toString() }
  }
  equals(a : Duration) : boolean {
    return this._content.toString() == a.toString()
  }
  toString(): string {
      return this._content.toString()
  }
}

export class Int implements ArchetypeType {
  private _content : BigNumber
  constructor(v : string | number | BigNumber) {
    this._content = new BigNumber(v)
    if (this._content.comparedTo(this._content.integerValue()) != 0) {
      throw new Error("Not an Int value: "+v)
    } else {
      this._content = new BigNumber(v)
    }
  }
  to_mich = () : Micheline => {
    return { "int" : this._content.toString() }
  }
  to_big_number() : BigNumber {
    return this._content
  }
  plus(x : Int) : Int {
    return new Int(this._content.plus(x.to_big_number()))
  }
  minus(x : Int) : Int {
    return new Int(this._content.minus(x.to_big_number()))
  }
  times(x : Int) : Int {
    return new Int(this._content.times(x.to_big_number()))
  }
  div(x : Int) : BigNumber {
    return this._content.div(x.to_big_number())
  }
  equals = (x : Int) : boolean => {
    return this._content.isEqualTo(x.to_big_number())
  }
  toString() : string {
    return this._content.toString()
  }
}

export class Nat implements ArchetypeType {
  private _content : BigNumber
  constructor(v : string | number | BigNumber) {
    this._content = new BigNumber(v)
    if (this._content.comparedTo(this._content.integerValue()) != 0 || this._content.isLessThan(new BigNumber(0))) {
      throw new Error("Not an Nat value: "+v)
    }
  }
  to_mich = () : Micheline => {
    return { "int" : this._content.toString() }
  }
  to_big_number() : BigNumber {
    return this._content
  }
  plus(x : Nat) : Nat {
    return new Nat(this._content.plus(x.to_big_number()))
  }
  minus(x : Nat) : Int {
    return new Int(this._content.minus(x.to_big_number()))
  }
  times(x : Nat) : Nat {
    return new Nat(this._content.times(x.to_big_number()))
  }
  div(x : Nat) : Rational {
    return new Rational(this._content.div(x.to_big_number()))
  }
  equals = (x : Nat) : boolean => {
    return this._content.isEqualTo(x.to_big_number())
  }
  toString = () => {
    return this._content.toString()
  }
}

export class Rational implements ArchetypeType {
  private _content : BigNumber
  constructor(v : string | number | BigNumber, denom : BigNumber = new BigNumber(1)) {
    this._content = (new BigNumber(v)).div(denom)
  }
  to_mich = () : Micheline => {
    const [ num, denom ] = this._content.toFraction()
    return {
      prim: "Pair",
      args: [
        { "int" : num.toString() },
        { "int" : denom.toString() }
      ]
    }
  }
  to_big_number() : BigNumber {
    return this._content
  }
  plus(x : Rational) : Rational {
    return new Rational(this._content.plus(x.to_big_number()))
  }
  minus(x : Rational) : Rational {
    return new Rational(this._content.minus(x.to_big_number()))
  }
  times(x : Rational) : Rational {
    return new Rational(this._content.times(x.to_big_number()))
  }
  div(x : Rational) : Rational {
    return new Rational(this._content.div(x.to_big_number()))
  }
  floor() : Int {
    return new Int(this._content.integerValue(BigNumber.ROUND_FLOOR))
  }
  ceil() : Int {
    return new Int(this._content.integerValue(BigNumber.ROUND_CEIL))
  }
  equals = (x : Rational) : boolean => {
    return this._content.isEqualTo(x.to_big_number())
  }
  toString = () : string => {
    return this._content.toString()
  }
}

export class Bytes implements ArchetypeType {
  private _content : string
  constructor(v : string) {
    /* TODO check value validity */
    this._content = v
  }
  to_mich(): Micheline {
      return {
        "bytes" : this._content
      }
  }
  equals = (x : Bytes) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Signature implements ArchetypeType {
  private _content : string
  constructor(v : string) {
    /* TODO check value validity */
    this._content = v
  }
  to_mich(): Micheline {
      return {
        "string" : this._content
      }
  }
  equals = (x : Signature) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Key implements ArchetypeType {
  private _content : string
  constructor(v : string) {
    /* TODO check value validity */
    this._content = v
  }
  to_mich(): Micheline {
      return {
        "string" : this._content
      }
  }
  equals = (x : Key) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Tez implements ArchetypeType {
  private _content : BigNumber
  constructor(v : string | number | BigNumber, unit : "tez" | "mutez" = "tez") {
    this._content = new BigNumber(v)
    switch(unit) {
      case "mutez":
        if (this._content.comparedTo(this._content.integerValue()) != 0)
          throw new Error("Mutez value must be integer");
        break
      case "tez":
        if (this._content.isLessThan(new BigNumber(0)) || this._content.isGreaterThan(new BigNumber("")))
          throw new Error("Invalid Tez value")
        this._content = new BigNumber(this._content.times(1000000).integerValue(BigNumber.ROUND_FLOOR))
    }
  }
  to_mich = () : Micheline => {
    return { "int" : this.toString() }
  }
  to_big_number() : BigNumber {
    return this._content
  }
  plus(x : Tez) : Tez {
    return new Tez(this._content.plus(x.to_big_number()), "mutez")
  }
  times(x : Nat) : Tez {
    return new Tez(this._content.times(x.to_big_number()), "mutez")
  }
  equals = (x : Tez) : boolean => {
    return this._content.isEqualTo(x.to_big_number())
  }
  toString = () : string => {
    return this._content.toString()
  }
}

export class Entrypoint implements ArchetypeType {
  addr : string
  name : string
  constructor(a : Address, n : string) {
    this.addr = a.toString()
    this.name = n
  }
  to_mich = () : Micheline => {
    return string_to_mich(this.toString())
  }
  equals = (x : Entrypoint) : boolean => {
    return this.addr == x.addr && this.name == x.name
  }
  toString() : string {
    return this.addr + '%' + this.name
  }
}

export abstract class Enum<T> implements ArchetypeType {
  constructor(private _kind : T) {}
  type() { return this._kind }
  abstract to_mich() : Micheline
  abstract toString(): string
}

export const none_mich : Micheline = {
  "prim": "None"
}

export const some_to_mich = (a : Micheline) : Micheline => {
  return {
    prim: "Some",
    args: [ a ]
  }
}

type ArchetypeTypeArg = ArchetypeType | string | Date | boolean

export class Option<T extends ArchetypeTypeArg | string | Date | boolean> implements ArchetypeType {
  _content : T | undefined | null
  constructor(v : T | undefined | null) {
    this._content = v
  }
  static None = <T extends ArchetypeTypeArg>() => { return new Option<T>(null) }
  static Some = <T extends ArchetypeTypeArg>(v : T) => { return new Option<T>(v) }
  get = () : T => {
    if (this._content != undefined && this._content != null) {
      return this._content
    } else {
      throw new Error("Option.get : is none")
    }
  }
  is_none() : boolean {
    return this._content == undefined || this._content == null
  }
  is_some() : boolean {
    return this._content != undefined && this._content != null
  }
  to_mich = () : Micheline => {
    if (this._content == undefined || this._content == null) {
      return none_mich
    }
    let mich
    switch (typeof this._content) {
      case "string": mich = string_to_mich(this._content); break;
      case "boolean": mich = bool_to_mich(this._content); break;
      case "object":
        // js hack ...
        if (this._content instanceof Date) {
          const d = this._content as Date
          mich = date_to_mich(d)
        } else if (this._content instanceof Array) {
          mich = list_to_mich(this._content, x => x.to_mich())
        } else {
          mich = this._content.to_mich();
        }
        break
      default: throw new Error("to_mich : unknown type")
    }
    return some_to_mich(mich)
  };
  equals = (o : Option<T>) => {
    return this.toString() == o.toString()
  }
  toString = () : string => {
    if (this._content == undefined || this._content == null) {
      return "None"
    } else {
      let str : string
      switch (typeof this._content) {
        case "string": str = this._content; break;
        case "boolean": str = "" + this._content; break;
        case "object":
          // js hack ...
          if (this._content instanceof Date) {
            const d = this._content as Date
            str = d.toISOString()
          } else {
            str = this._content.toString()
          }
        default: str = this._content.toString()
      }
      return "Some (" + str + ")"
    }
  };
}

export class Or<T1 extends ArchetypeTypeArg, T2 extends ArchetypeTypeArg> implements ArchetypeType {
  _content : T1 | T2
  _is_left : boolean
  constructor(v : T1 | T2, is_left : boolean) {
    this._content = v
    this._is_left = is_left
  }
  static Left  = <T1 extends ArchetypeTypeArg, T2 extends ArchetypeTypeArg>(v : T1) => { return new Or<T1, T2>(v, true) }
  static Right = <T1 extends ArchetypeTypeArg, T2 extends ArchetypeTypeArg>(v : T2) => { return new Or<T1, T2>(v, false) }
  get = () : T1 | T2 => {
    if (this._content != undefined && this._content != null) {
      return this._content
    } else {
      throw new Error("Or.get : is not defined")
    }
  }
  is_left() { return this._is_left }
  is_right() { return !this.is_left }
  to_mich() : Micheline {
    let mich
    switch (typeof this._content) {
      case "string": mich = string_to_mich(this._content); break;
      case "boolean": mich = bool_to_mich(this._content); break;
      case "object":
        // js hack ...
        if (this._content instanceof Date) {
          const d = this._content as Date
          mich = date_to_mich(d)
        } else if (this._content instanceof Array) {
          mich = list_to_mich(this._content, x => x.to_mich())
        } else {
          mich = this._content.to_mich();
        }
        break
      default: throw new Error("to_mich : unknown type")
    }
    if (this.is_left()) {
      return left_to_mich(mich)
    } else {
      return right_to_mich(mich)
    }
  }
  toString(): string {
    let str : string
    switch (typeof this._content) {
      case "string": str = this._content; break;
      case "boolean": str = "" + this._content; break;
      case "object":
        // js hack ...
        if (this._content instanceof Date) {
          const d = this._content as Date
          str = d.toISOString()
        } else {
          str = this._content.toString()
        }
      default: str = this._content.toString()
    }
    if (this.is_left()) {
      return "Left (" + str + ")"
    } else {
      return "Right (" + str + ")"
    }
  }
  equals = (o : Or<T1, T2>) => {
    return this.toString() == o.toString()
  }
}

/* Experiment API ---------------------------------------------------------- */

export const set_mockup = () => {
  Completium.setEndpoint('mockup');
}

export const set_quiet = (b : boolean) => {
  Completium.setQuiet(b)
}

export const set_mockup_now = (d : Date) => {
  Completium.setMockupNow(Math.floor(d.getTime() / 1000 - 1))
}

export const get_account = (name : string) : Account => {
  const a = Completium.getAccount(name)
  return new Account(a.name, a.pubk, a.pkh, a.sk)
}

export const pack = (obj : Micheline, typ ?: MichelineType) : Bytes => {
  if (typ != undefined) {
    return new Bytes(Completium.packTyped(obj, typ))
  } else {
    return new Bytes(Completium.pack(obj))
  }
}

export const blake2b = (b : Bytes) : Bytes => {
  return new Bytes(Completium.blake2b(b.toString()))
}

export const get_balance = async (addr : Address) : Promise<Tez> => {
  const b = await Completium.getBalance(addr.toString())
  return new Tez(b, "mutez")
}

/**
 * Expects f to fail with error
 * @param f async call to execute
 * @param error error that f is expected to thow
 */
export const expect_to_fail = async (f : { () : Promise<void> }, error : Micheline) => {
  const str_err = (error as Mstring)["string"] /* TODO: manage other error type */
  if (str_err === undefined) {
    const pair_err = (error as Mpair)
    await Completium.expectToThrow(f, Completium.jsonMichelineToExpr(pair_err).toString().replace(/\\"/gi, ''))
  } else {
    await Completium.expectToThrow(f, str_err)
  }
}

/**
 * Returns value associated to key in big map
 * @param big_map_id big map identifier
 * @param key_value value of key
 * @param key_type type of key
 * @returns Micheline value associated to key
 */
export const get_big_map_value = async (big_map_id: bigint, key_value : Micheline, key_type : MichelineType) : Promise<Micheline> => {
  return await Completium.getValueFromBigMap(big_map_id.toString(), key_value, key_type)
}

export const sign = async (b : Bytes, a : Address) : Promise<Signature> => {
  const signed = await Completium.sign(b.toString(), { as: a.toString() })
  return new Signature(signed.prefixSig)
}

/**
 * Returns contract storage
 * @param c contract address
 * @returns storage record
 */
export const get_storage = async (c : string) : Promise<any> => {
  return await Completium.getStorage(c)
}

/**
 * Deploys contract
 * @param path (relative/absolute) path to archetype file (.arl)
 * @param params contract parameters
 * @param p deployment parameters (as, amout)
 * @returns address of deployed contract
 */
export const deploy = async (path : string, params : any, p : Partial<Parameters>) : Promise<string> => {
  const [contract, _] = await Completium.deploy(
    path, {
      parameters: params ,
      as: params.as,
      amount: params.amount ? params.amount.toString()+"utz" : undefined
    }
  )
  return contract.address
}

/**
 * Calls a contract entrypoint
 * @param c contract address
 * @param e entry point name
 * @param a entry point argument
 * @param p parameters (as, amount)
 */
export const call = async (c : string, e : string, a : Micheline, p : Partial<Parameters>) => {
  return await Completium.call(c, {
      entry: e,
      argJsonMichelson: a,
      as: p.as ? p.as.pkh : undefined,
      amount: p.amount ? p.amount.toString()+"utz" : undefined
   })
}

export const exec_getter = async (c : string, e : string, a : Micheline, p : Partial<Parameters>) => {
  return await Completium.runGetter(e, c, {
      argJsonMichelson: a,
      as: p.as ? p.as.pkh : undefined,
      amount: p.amount ? p.amount.toString()+"utz" : undefined,
      json : true
   })
}

/**
 * Transfers tez
 * @param from account to transfer from
 * @param to   account or address to transfer to
 * @param amount amount to transfer in mutez
 * @returns
 */
export const transfer = async (from : Account, to : Account | string, amount : bigint) => {
  const to_ = typeof to == "string" ? to : to.pkh
  return await Completium.transfer(from.pkh, to_, amount.toString())
}

/* to Micheline ------------------------------------------------------------ */

export const prim_to_mich_type = (
  p : "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" |
      "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" |
      "never" | "operation" | "signature" | "string" | "timestamp" | "unit") : MichelineType => {
  return {
    prim   : p,
    annots : []
  }
}

export const prim_annot_to_mich_type = (
  p : "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" |
      "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" |
      "never" | "operation" | "signature" | "string" | "timestamp" | "unit",
  a : Array<string>) : MichelineType => {
  return {
    prim: p,
    annots: a
  }
}

export const unit_mich : Micheline = { prim : "Unit" }

export const unit_to_mich = () : Micheline => {
  return unit_mich
}

export const string_to_mich = (v : string) : Micheline => {
  return { "string" : v }
}

export const bool_to_mich = (v : boolean) : Micheline => {
  return v ? { "prim" : "True" } : { "prim" : "False" }
}

export const date_to_mich = (v : Date) : Micheline => {
  return { "int" : "" + Math.floor(v.getTime() / 1000) }
}

export const elt_to_mich = (a : Micheline, b : Micheline) : Micheline => {
  return {
    prim: "Elt",
    args: [ a, b ]
  }
}

export const left_to_mich = (v : Micheline) : Micheline => {
  return {
    prim: "Left",
    args: [v]
  }
}

export const right_to_mich = (v : Micheline) : Micheline => {
  return {
    prim: "Right",
    args: [v]
  }
}

export const or_to_mich_type = (l : MichelineType, r : MichelineType) : MichelineType => {
  return {
    prim: "or",
    args: [l, r],
    annots: []
  }
}

export const pair_to_mich = (l : Array<Micheline>) : Micheline => {
  return {
    prim: "Pair",
    args: l
  }
}

export const pair_to_mich_type = (prim: "big_map" | "lambda" | "map" | "or", a : MichelineType, b : MichelineType) : MichelineType => {
  return {
    prim: prim,
    args: [ a, b ],
    annots: []
  }
}

export const pair_array_to_mich_type = (l : Array<MichelineType>) : MichelineType => {
  return {
    prim: "pair",
    args: l,
    annots: []
  }
}

export const mich_array_to_mich = (l : Array<Micheline>) : Micheline => {
  if (l.length == 1) {
    return l[0]
  }
  if (l.length == 2) {
    return pair_to_mich(l)
  } else {
    return pair_to_mich([ l[0], mich_array_to_mich(l.slice(1))])
  }
}

export const option_to_mich_type = (a : MichelineType) : MichelineType => {
  return {
    prim: "option",
    args: [ a ],
    annots: []
  }
}

export const option_annot_to_mich_type = (mt : MichelineType, a : Array<string>) : MichelineType => {
  return {
    prim: "option",
    args: [ mt ],
    annots : a
  }
}

export const list_to_mich = <T>(l : Array<T>, to_mich : { (a : T) : Micheline }) : Micheline => {
  return l.map(x => to_mich(x))
}

export const list_to_mich_type = (mt : MichelineType) : MichelineType => {
  return {
    prim: "list",
    args: [ mt ],
    annots : []
  }
}

export const list_annot_to_mich_type = (mt : MichelineType, a : Array<string>) : MichelineType => {
  return {
    prim: "list",
    args: [ mt ],
    annots : a
  }
}

export const set_to_mich = <T>(s : Set<T>, to_json : { (a : T) : Micheline }) => {
  Array.from(s.values()).map(x => to_json(x))
}

export const string_cmp = (a : string, b : string) => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

export const mich_to_pairs = (x : Micheline) : Array<Micheline> => {
  return (x as Mpair)["args"]
}

export const annotated_mich_to_array = (x : Micheline, t : MichelineType) : Array<Micheline> => {
  const internal_mich_to_array = (x : Micheline, t : MichelineType, acc : Array<Micheline>) : Array<Micheline> => {
    if (t.annots.length > 0) {
      acc.push(x)
      return acc
    } else {
      switch (t.prim) {
        case "pair" :
          const pair = (x as Mpair)
          pair.args.reduce((a : Array<Micheline>, x : Micheline, i : number) => {
            return internal_mich_to_array(x, t.args[i], a)
          }, acc)
        default : throw new Error("internal_mich_to_array: found an unannotated node that is not a pair but a '" + t.prim + "'")
      }
    }
  }
  return internal_mich_to_array(x, t, [])
}

export const mich_to_string = (x : Micheline) : string => {
  return (x as Mstring)["string"]
}

export const mich_to_date = (x : Micheline) : Date => {
  return new Date((x as Mstring)["string"])
}

export const mich_to_int = (x : Micheline) : Int => {
  return new Int((x as Mint)["int"])
}

export const mich_to_nat = (x : Micheline) : Nat => {
  return new Nat((x as Mint)["int"])
}

export const mich_to_signature = (x : Micheline) : Signature => {
  return new Signature((x as Mstring)["string"])
}

export const mich_to_key = (x : Micheline) : Key => {
  return new Key((x as Mstring)["string"])
}

export const mich_to_tez = (x : Micheline) : Tez => {
  return new Tez((x as Mint)["int"])
}

export const mich_to_bytes = (x : Micheline) : Bytes => {
  return new Bytes((x as Mbytes)["bytes"])
}

export const mich_to_duration = (x : Micheline) : Duration => {
  return new Duration((x as Mint)["int"])
}

export const mich_to_address = (x : Micheline) : Address => {
  return new Address((x as Mstring)["string"])
}

export const mich_to_bool = (x : Micheline) : boolean => {
  switch ((x as Mprim).prim) {
    case "False" : return false
    case "True"  : return true
    default : throw new Error("mich_to_bool: invalid prim '" + (x as Mprim).prim + "'")
  }
}

export const mich_to_option = <T extends ArchetypeType>(x : Micheline, mich_to : (_ : Micheline) => T) : Option<T> => {
  if ("prim" in x) {
    switch (x.prim) {
      case "None" : return new Option<T>(undefined)
      case "Some" : return new Option<T>(mich_to(x.args[0]))
    }
  }
  throw new Error("mich_to_option: prim not found")
}

export const mich_to_list = <T>(x : Micheline, mich_to: (_ : Micheline) => T) : Array<T> => {
  const xlist = (x as Marray)
  return xlist.map(mich_to)
}

export const mich_to_rational = (x : Micheline) : Rational => {
  const numerator = new BigNumber(((x as Mpair).args[0] as Mint)["int"])
  const denominator = new BigNumber(((x as Mpair).args[1] as Mint)["int"])
  return new Rational(numerator.dividedBy(denominator))
}

export const mich_to_map = <K, V>(x : Micheline, f: { (k : Micheline, v : Micheline) : [K, V] }) : Array<[K, V]>  => {
  return (x as Marray).map((elt : Micheline) => {
    const k = (elt as Melt)["args"][0]
    const v = (elt as Melt)["args"][1]
    return f(k, v)
  })
}

export const is_left =  (x : Micheline) : boolean => {
  return (x as Msingle)["prim"] == "Left"
}

export const is_right =  (x : Micheline) : boolean => {
  return (x as Msingle)["prim"] == "Right"
}

export const mich_to_or_value = (x : Micheline) : Micheline => {
  return (x as Msingle)["args"][0]
}

export const cmp_date = (a : Date , b : Date) : boolean => {
  return (a.getTime() - a.getMilliseconds()) == (b.getTime() - b.getMilliseconds())
}
