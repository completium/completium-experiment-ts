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
}

export type MTprimAnnots = {
  "prim"   :  "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" |
              "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" |
              "never" | "operation" | "signature" | "string" | "timestamp" | "unit"
  "annots" : Array<string>
}

export type MTsingle = {
  "prim"   : "contract" | "list" | "option" | "set" | "ticket",
  "args"   : [ MichelineType ]
}

export type MTint   = {
  "prim"   : "sapling_transaction" | "sapling_state",
  "args"   : [
    { "int" : string }
  ]
}

export type MTPairArray = {
  "prim"   : "pair",
  "args"   : Array<MichelineType>
}

export type MTpair  = {
  "prim"   : "big_map" | "lambda" | "map" | "or",
  "args"   : [ MichelineType, MichelineType ]
}

export type MichelineType =
| MTprim
| MTprimAnnots
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

/* Int Nat Entrypoint Classes ---------------------------------------------- */

export class Int extends BigNumber {
  constructor(v : string | number | BigNumber | Nat | Rational) {
    const bn = new BigNumber(v)
    if (bn.comparedTo(bn.integerValue()) != 0) {
      throw new Error("Not an Int value: "+v)
    } else {
      super(v)
    }
  }
  to_mich() {
    return { "int" : this.toString() }
  }
  to_big_number() : BigNumber {
    return this
  }
  plus(x : Int) : Int {
    return new Int(super.plus(x.to_big_number()))
  }
  minus(x : Int) : Int {
    return new Int(super.minus(x.to_big_number()))
  }
  times(x : Int) : Int {
    return new Int(super.times(x.to_big_number()))
  }
  div(x : Int) : BigNumber {
    return super.div(x.to_big_number())
  }
  equals(x : Int) : boolean {
    return super.isEqualTo(x.to_big_number())
  }
}

export class Nat extends BigNumber {
  constructor(v : string | number | BigNumber | Int | Rational) {
    const bn = new BigNumber(v)
    if (bn.comparedTo(bn.integerValue()) != 0 || bn.isLessThan(new BigNumber(0))) {
      throw new Error("Not an Nat value: "+v)
    } else {
      super(v)
    }
  }
  to_mich() {
    return { "int" : this.toString() }
  }
  to_big_number() : BigNumber {
    return this
  }
  plus(x : Nat) : Nat {
    return new Nat(super.plus(x.to_big_number()))
  }
  minus(x : Nat) : Int {
    return new Int(super.minus(x.to_big_number()))
  }
  times(x : Nat) : Nat {
    return new Nat(super.times(x.to_big_number()))
  }
  div(x : Nat) : Rational {
    return new Rational(super.div(x.to_big_number()))
  }
  equals(x : Nat) : boolean {
    return super.isEqualTo(x.to_big_number())
  }
}

export class Rational extends BigNumber {
  constructor(v : string | number | BigNumber | Int | Nat) {
    super(v)
  }
  to_mich() : Micheline {
    const [ num, denom ] = this.toFraction()
    return {
      prim: "Pair",
      args: [
        { "int" : num.toString() },
        { "int" : denom.toString() }
      ]
    }
  }
  to_big_number() : BigNumber {
    return this
  }
  plus(x : Rational) : Rational {
    return new Rational(super.plus(x.to_big_number()))
  }
  minus(x : Rational) : Rational {
    return new Rational(super.minus(x.to_big_number()))
  }
  times(x : Rational) : Rational {
    return new Rational(super.times(x.to_big_number()))
  }
  div(x : Rational) : Rational {
    return new Rational(super.div(x.to_big_number()))
  }
  floor() : Int {
    return new Int(super.integerValue(BigNumber.ROUND_FLOOR))
  }
  ceil() : Int {
    return new Int(super.integerValue(BigNumber.ROUND_CEIL))
  }
  equals(x : Rational) : boolean {
    return super.isEqualTo(x.to_big_number())
  }
}

export class Entrypoint {
  addr : string
  name : string
  constructor(a : string, n : string) {
    this.addr = a
    this.name =n
  }
  to_mich() {
    return string_to_mich(this.addr+"%"+this.name)
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
  Completium.setMockupNow(Math.floor(d.getTime() / 1000))
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
  const err = (error as Mstring)["string"] /* TODO: manage other error type */
  await Completium.expectToThrow(f, err)
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
    prim: p
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

export const none_mich : Micheline = {
  "prim": "None"
}

export const string_to_mich = (v : string) : Micheline => {
  return { "string" : v }
}

export const bool_to_mich = (v : boolean) : Micheline => {
  return { "string" : v ? "True" : "False" }
}

export const date_to_mich = (v : Date) : Micheline => {
  return { "string" : v.toISOString() }
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
    args: [ a, b ]
  }
}

export const pair_array_to_mich_type = (l : Array<MichelineType>) : MichelineType => {
  return {
    prim: "pair",
    args: l
  }
}

export const option_to_mich_type = (a : MichelineType) : MichelineType => {
  return {
    prim: "option",
    args: [ a ]
  }
}

export const some_to_mich = (a : Micheline) : Micheline => {
  return {
    prim: "Some",
    args: [ a ]
  }
}

export const option_to_mich = <T>(v : T | undefined, to_mich : { (a : T) : Micheline }) : Micheline => {
  if (v != undefined) {
    return some_to_mich(to_mich(v))
  } else {
    return none_mich
  }
}

export const list_to_mich = <T>(l : Array<T>, to_mich : { (a : T) : Micheline }) : Micheline => {
  return l.map(x => to_mich(x))
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

export const mich_to_rational = (x : Micheline) : BigNumber => {
  const numerator = new BigNumber(((x as Mpair).args[0] as Mint)["int"])
  const denominator = new BigNumber(((x as Mpair).args[1] as Mint)["int"])
  return numerator.dividedBy(denominator)
}

export const mich_to_map = <K, V>(x : Micheline, f: { (k : Micheline, v : Micheline) : [K, V] }) : Array<[K, V]>  => {
  return (x as Marray).map((elt : Micheline) => {
    const k = (elt as Melt)["args"][0]
    const v = (elt as Melt)["args"][1]
    return f(k, v)
  })
}

/* TODO complete getter interface */