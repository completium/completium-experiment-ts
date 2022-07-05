export declare type Mprim = {
    "prim": "True" | "False" | "None" | "Unit";
};
export declare type Mstring = {
    "string": string;
};
export declare type Mbytes = {
    "bytes": string;
};
export declare type Mint = {
    "int": string;
};
export declare type Mpair = {
    "prim": "Pair";
    "args": Array<Micheline>;
};
export declare type Melt = {
    "prim": "Elt";
    "args": [Micheline, Micheline];
};
export declare type Msingle = {
    "prim": "Some" | "Right" | "Left";
    "args": [Micheline];
};
export declare type Marray = Array<Micheline>;
export declare type Micheline = Mprim | Mstring | Mbytes | Mint | Msingle | Mpair | Melt | Marray;
declare type MTprim = {
    "prim": "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" | "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" | "never" | "operation" | "signature" | "string" | "timestamp" | "unit";
};
declare type MTprimAnnots = {
    "prim": "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" | "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" | "never" | "operation" | "signature" | "string" | "timestamp" | "unit";
    "annots": Array<string>;
};
declare type MTsingle = {
    "prim": "contract" | "list" | "option" | "set" | "ticket";
    "args": [MichelineType];
};
declare type MTint = {
    "prim": "sapling_transaction" | "sapling_state";
    "args": [
        {
            "int": string;
        }
    ];
};
declare type MTpair = {
    "prim": "big_map" | "lambda" | "map" | "or" | "pair";
    "args": [MichelineType, MichelineType];
};
export declare type MichelineType = MTprim | MTprimAnnots | MTsingle | MTint | MTpair;
export interface Account {
    name: string;
    pubk: string;
    pkh: string;
    sk: string;
}
export interface Parameters {
    as: Account;
    amount: bigint;
}
export declare const set_mockup: () => void;
export declare const set_quiet: (b: boolean) => void;
export declare const set_mockup_now: (d: Date) => void;
export declare const get_account: (name: string) => Account;
export declare const pack: (obj: Micheline, typ?: MichelineType) => any;
/**
 * Expects f to fail with error
 * @param f async call to execute
 * @param error error that f is expected to thow
 */
export declare const expect_to_fail: (f: {
    (): Promise<void>;
}, error: Micheline) => Promise<void>;
/**
 * Returns value associated to key in big map
 * @param big_map_id big map identifier
 * @param key_value value of key
 * @param key_type type of key
 * @returns Micheline value associated to key
 */
export declare const get_big_map_value: (big_map_id: bigint, key_value: Micheline, key_type: MichelineType) => Promise<Micheline>;
export declare const sign: (v: string, a: Account) => Promise<string>;
/**
 * Returns contract storage
 * @param c contract address
 * @returns storage record
 */
export declare const get_storage: (c: string) => Promise<any>;
/**
 * Deploys contract
 * @param path (relative/absolute) path to archetype file (.arl)
 * @param params contract parameters
 * @param p deployment parameters (as, amout)
 * @returns address of deployed contract
 */
export declare const deploy: (path: string, params: any, p: Partial<Parameters>) => Promise<string>;
/**
 * Calls a contract entrypoint
 * @param c contract address
 * @param e entry point name
 * @param a entry point argument
 * @param p parameters (as, amount)
 */
export declare const call: (c: string, e: string, a: Micheline, p: Partial<Parameters>) => Promise<any>;
/**
 * Transfers tez
 * @param from account to transfer from
 * @param to   account or address to transfer to
 * @param amount amount to transfer in mutez
 * @returns
 */
export declare const transfer: (from: Account, to: Account | string, amount: bigint) => Promise<any>;
export declare const prim_to_mich_type: (p: "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" | "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" | "never" | "operation" | "signature" | "string" | "timestamp" | "unit") => MichelineType;
export declare const none_mich: Micheline;
export declare const string_to_mich: (v: string) => Micheline;
export declare const bool_to_mich: (v: boolean) => Micheline;
export declare const bigint_to_mich: (v: bigint) => Micheline;
export declare const elt_to_mich: (a: Micheline, b: Micheline) => Micheline;
export declare const pair_to_mich: (a: Micheline, b: Micheline) => Micheline;
export declare const pair_to_mich_type: (a: MichelineType, b: MichelineType) => MichelineType;
export declare const option_to_mich_type: (a: MichelineType) => MichelineType;
export declare const some_to_mich: (a: Micheline) => Micheline;
export declare const option_to_mich: <T>(v: T | undefined, to_mich: (a: T) => Micheline) => Micheline;
export declare const list_to_mich: <T>(l: T[], to_mich: (a: T) => Micheline) => Micheline;
export declare const set_to_mich: <T>(s: Set<T>, to_json: (a: T) => Micheline) => void;
export declare const string_cmp: (a: string, b: string) => 0 | 1 | -1;
export declare class Entrypoint {
    addr: string;
    name: string;
    constructor(a: string, n: string);
    to_mich(): Micheline;
}
export {};
//# sourceMappingURL=main.d.ts.map