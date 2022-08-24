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

export interface Account {
  name : string,
  pubk : string,
  pkh  : string,
  sk   : string,
}

export interface Parameters {
  as     : Account,
  amount : bigint
}

/* Archetype value */

abstract class ArchetypeType {
  abstract equals : (v : this) => boolean
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
    return new Tez(this._content.plus(x.to_big_number()))
  }
  times(x : Nat) : Tez {
    return new Tez(this._content.times(x.to_big_number()))
  }
  equals = (x : Tez) : boolean => {
    return this._content.isEqualTo(x.to_big_number())
  }
  toString = () : string => {
    return this._content.toString()
  }
}

export class Entrypoint {
  addr : string
  name : string
  constructor(a : string, n : string) {
    this.addr = a
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

const none_mich : Micheline = {
  "prim": "None"
}

const some_to_mich = (a : Micheline) : Micheline => {
  return {
    prim: "Some",
    args: [ a ]
  }
}

type optionArg =
  boolean
| string
| Date
| Bytes
| Duration
| Address
| Int
| Nat
| Rational
| Tez
| Array<optionArg>
| Option<any>

export class Option<T extends optionArg> implements ArchetypeType {
  _content : T | undefined | null
  constructor(v : T | undefined | null) {
    this._content = v
  }
  static None = <T extends optionArg>() => { return new Option<T>(null) }
  static Some = <T extends optionArg>(v : T) => { return new Option<T>(v) }
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
  return {
    name : a.name,
    pubk : a.pubk,
    pkh  : a.pkh,
    sk   : a.sk
  }
}

export const pack = (obj : Micheline, typ ?: MichelineType) => {
  if (typ != undefined) {
    return Completium.packTyped(obj, typ)
  } else {
    return Completium.pack(obj)
  }
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
    await Completium.expectToThrow(f, Completium.jsonMichelineToExpr(pair_err))
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

export const sign = async (v : string, a : Account) : Promise<string> => {
  const signed = await Completium.sign(v, { as: a.name })
  return signed.prefixSig
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

export const mich_to_option = <T extends optionArg>(x : Micheline, mich_to : (_ : Micheline) => T) : Option<T> => {
  if ("prim" in x) {
    switch (x.prim) {
      case "None" : return new Option<T>(undefined)
      case "Some" : return new Option<T>(mich_to(x.args[0]))
    }
  }
  throw new Error("mich_to_option: prim not found")
}

export const mich_to_list = <T extends optionArg>(x : Micheline, mich_to: (_ : Micheline) => T) : Array<T> => {
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

export const cmp_date = (a : Date , b : Date) : boolean => {
  return (a.getTime() - a.getMilliseconds()) == (b.getTime() - b.getMilliseconds())
}

/* TODO complete getter interface */