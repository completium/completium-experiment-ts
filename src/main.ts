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
  get_balance = async () => {
    return await get_balance(this.get_address())
  }
  sign = async (value : Bytes) => {
    return await sign(value, this)
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
    return { "int" : this._content.toFixed() }
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
    return this._content.toFixed()
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
    return { "int" : this._content.toFixed() }
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
    return this._content.toFixed()
  }
}

export class Rational implements ArchetypeType {
  private _content : BigNumber
  constructor(v : string | number | BigNumber, denom : BigNumber = new BigNumber(1)) {
    let numerator : string | number | BigNumber = v
    switch (typeof v) {
      case "string":
        const parsed = v.endsWith('%') ? parseFloat(v) / 100 : v
        if (null !== parsed && ! Number.isNaN(parsed) ) {
          numerator = parsed
        } else {
          throw new Error("Rational error: '" + v + "' not a number")
        }; break;
      default : {}
    }
    this._content = (new BigNumber(numerator)).div(denom)
  }
  to_mich = () : Micheline => {
    const [ num, denom ] = this._content.toFraction()
    return {
      prim: "Pair",
      args: [
        { "int" : num.toFixed() },
        { "int" : denom.toFixed() }
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
    return this._content.toFixed()
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
    return this._content.toFixed()
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

type ArchetypeTypeArg = ArchetypeType | Array<ArchetypeTypeArg> | string | Date | boolean

const generic_to_mich = (x: any): Micheline => {
  switch (typeof x) {
    case "string": return string_to_mich(x);
    case "boolean": return bool_to_mich(x);
    case "object": {
      if (x instanceof Date) {
        const d = x as Date
        return date_to_mich(d)
      } else if (x instanceof Array) {
        return list_to_mich(x, x => generic_to_mich(x))
      } else {
        return x.to_mich();
      }
    }
    default: throw new Error("generic_to_mich : unknown type")
  }
}

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
    const mich = generic_to_mich(this._content)
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
    const mich = generic_to_mich(this._content)
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

export class Bls12381Fr implements ArchetypeType {
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
  equals = (x : ChestKey) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Bls12381G1 implements ArchetypeType {
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
  equals = (x : ChestKey) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Bls12381G2 implements ArchetypeType {
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
  equals = (x : ChestKey) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class ChainId implements ArchetypeType {
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
  equals = (x : ChainId) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Chest implements ArchetypeType {
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
  equals = (x : Chest) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class ChestKey implements ArchetypeType {
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
  equals = (x : ChestKey) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class KeyHash implements ArchetypeType {
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
  equals = (x : KeyHash) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class SaplingState implements ArchetypeType {
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
  equals = (x : SaplingState) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class SaplingTransaction implements ArchetypeType {
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
  equals = (x : SaplingTransaction) : boolean => {
    return this._content == x.toString()
  }
  toString = () : string => {
    return this._content
  }
}

export class Unit implements ArchetypeType {
  constructor() {
  }
  to_mich(): Micheline {
      return {
        "prim" : "Unit"
      }
  }
  equals = (x : Unit) : boolean => {
    return true
  }
  toString = () : string => {
    return "Unit"
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

export const list_equals = <T>(l1 : Array<T>, l2 : Array<T>, cmp : { (e1 : T, e2 : T) : boolean }) : boolean => {
  if (l1.length == l2.length) {
    for (let i = 0; i < l1.length; i++) {
      if (! cmp(l1[i], l2[i])) {
        return false
      }
    }
    return true
  }
  return false
}

/**
 * Expects f to fail with error
 * @param f async call to execute
 * @param error error that f is expected to thow
 */
export const expect_to_fail = async (f : { () : Promise<void> }, error : Micheline) => {
  const str_error = JSON.stringify(error, null, 2).toString().replace(/\\"/gi, '')
  const m = "Failed to throw " + str_error ;
  try {
    await f();
    throw new Error(m)
  } catch (ex : any) {
    if (ex.value) {
      const json = Completium.exprMichelineToJson(ex.value)
      const str_value = JSON.stringify(json, null, 2)
      if (str_value != str_error) {
        throw new Error(`actual ${str_value} vs. expected ${str_error}`)
      }
    } else {
      throw ex
    }
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

export const sign = async (b : Bytes, a : Account) : Promise<Signature> => {
  const signed = await Completium.sign(b.toString(), { as: a.get_name() })
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
      parametersMicheline: params ,
      as: params.as,
      amount: params.amount ? params.amount.toString()+"utz" : undefined
    }
  )
  return contract.address
}

export const deploy_from_json = async (name : string, code : any, storage : Micheline) : Promise<string> => {
  const [contract, _] = await Completium.originate(
    null, {
      named : name,
      contract_json : code,
      storage_json : storage
    }
  )
  return contract.address
}

export const deploy_callback = async (name: string, mt : MichelineType) : Promise<string> => {
  return await deploy_from_json(name + "_callback", [
    {
      "prim": "storage",
      "args": [
        {
              "prim": "option",
              "args": [
                mt
          ]
        }
      ]
    },
    {
      "prim": "parameter",
      "args": [
        { ...mt, annots:["%callback"] }
      ]
    },
    {
      "prim": "code",
      "args": [
        [
          {
            "prim": "CAR"
          },
          {
            "prim": "SOME"
          },
          {
            "prim": "NIL",
            "args": [
              {
                "prim": "operation"
              }
            ]
          },
          {
            "prim": "PAIR"
          }
        ]
      ]
    }
  ], { prim : "None" })
}

export const getter_args_to_mich = (arg : Micheline, callback : Entrypoint) : Micheline => {
  return pair_to_mich([arg, callback.to_mich()]);
}

export const get_callback_value = async <T extends ArchetypeTypeArg>(callback_addr : string, mich_to : (_ : any) => T) : Promise<T> => {
  const mich = await get_storage(callback_addr)
  //const option = mich_to_option<T>(mich, mich_to)
  return mich_to(mich)
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

export interface CallParameter {
  destination : Address,
  amount      : Tez,
  fee        ?: Tez,
  entrypoint  : string,
  arg         : Micheline
}

export const get_call_param = async (c : string, e : string, a : Micheline, p : Partial<Parameters>) : Promise<CallParameter> => {
  const param = await Completium.call(c, {
      entry: e,
      argJsonMichelson: a,
      as: p.as ? p.as.pkh : undefined,
      amount: p.amount ? p.amount.toString()+"utz" : undefined,
      only_param : true
   })
   return {
    destination : new Address(param.to),
    amount      : new Tez(param.amount),
    fee         : param.fee ? new Tez(param.fee) : undefined,
    entrypoint  : param.parameter.entrypoint,
    arg         : param.parameter.value
   }
}

export const exec_batch = async (cps : CallParameter[], p : Partial<Parameters>) => {
  return await Completium.exec_batch(cps.map(x => {
    return {
      kind : "transaction",
      to   : x.destination.toString(),
      amount : x.amount.toString(),
      mutez : true,
      fee : x.fee?.toString(),
      parameter : {
        entrypoint : x.entrypoint,
        value : x.arg
      }
    }
  }), {
    as: p.as ? p.as.pkh : undefined
  })
}

export const exec_getter = async (contract : Address, entry : string, arg : Micheline, param : Partial<Parameters>) => {
  return await Completium.runGetter(entry, contract.toString(), {
      argJsonMichelson: arg,
      as: param.as ? param.as.pkh : undefined,
      amount: param.amount ? param.amount.toString() + "utz" : undefined,
      json : true,
   })
}

export const exec_view = async (contract : Address, view : string, arg : Micheline, param : Partial<Parameters>) => {
  return await Completium.runView(view, contract.toString(), {
      argJsonMichelson: arg,
      as: param.as ? param.as.pkh : undefined,
      amount: param.amount ? param.amount.toString() + "utz" : undefined,
      json : true,
      taquito_schema : true
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

export const or_to_mich_type = (l : MichelineType, r : MichelineType, a : string[] = []) : MichelineType => {
  return {
    prim: "or",
    args: [l, r],
    annots: a
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

export const pair_array_to_mich_type = (l : Array<MichelineType>, annots : Array<string> = []) : MichelineType => {
  return {
    prim: "pair",
    args: l,
    annots: annots
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

export const mich_to_bls12_381_fr = (x : Micheline) : Bls12381Fr => {
  return new Bls12381Fr((x as Mbytes)["bytes"])
}

export const mich_to_bls12_381_g1 = (x : Micheline) : Bls12381G1 => {
  return new Bls12381G1((x as Mbytes)["bytes"])
}

export const mich_to_bls12_381_g2 = (x : Micheline) : Bls12381G2 => {
  return new Bls12381G2((x as Mbytes)["bytes"])
}

export const mich_to_chain_id = (x : Micheline) : ChainId => {
  return new ChainId((x as Mstring)["string"])
}

export const mich_to_chest = (x : Micheline) : Chest => {
  return new Chest((x as Mbytes)["bytes"])
}

export const mich_to_chest_key = (x : Micheline) : ChestKey => {
  return new ChestKey((x as Mbytes)["bytes"])
}

export const mich_to_key_hash = (x : Micheline) : KeyHash => {
  return new KeyHash((x as Mbytes)["bytes"])
}

export const mich_to_sapling_state = (x : Micheline) : SaplingState => {
  return new SaplingState((x as Mbytes)["bytes"])
}

export const mich_to_sapling_transaction = (x : Micheline) : SaplingTransaction => {
  return new SaplingTransaction((x as Mbytes)["bytes"])
}

export const mich_to_unit = (x : Micheline) : Unit => {
  return new Unit()
}

export const mich_to_option = <T extends ArchetypeTypeArg>(x : Micheline, mich_to : (_ : any) => T) : Option<T> => {
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
