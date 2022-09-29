const Completium = require('@completium/completium-cli');
import * as att from '@completium/archetype-ts-types'

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
  get_address = () : att.Address => {
    return new att.Address(this.pkh)
  }
  get_public_key = () : att.Key => {
    return new att.Key(this.pubk)
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
  sign = async (value : att.Bytes) => {
    return await sign(value, this)
  }
}

export interface Parameters {
  as     : Account,
  amount : att.Tez
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

export const pack = (obj : att.Micheline, typ ?: att.MichelineType) : att.Bytes => {
  if (typ != undefined) {
    return new att.Bytes(Completium.packTyped(obj, typ))
  } else {
    return new att.Bytes(Completium.pack(obj))
  }
}

export const blake2b = (b : att.Bytes) : att.Bytes => {
  return new att.Bytes(Completium.blake2b(b.toString()))
}

export const get_balance = async (addr : att.Address) : Promise<att.Tez> => {
  const b = await Completium.getBalance(addr.toString())
  return new att.Tez(b, "mutez")
}


/**
 * Expects f to fail with error
 * @param f async call to execute
 * @param error error that f is expected to thow
 */
export const expect_to_fail = async (f : { () : Promise<void> }, error : att.Micheline) => {
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
export const get_big_map_value = async (big_map_id: bigint, key_value : att.Micheline, key_type : att.MichelineType) : Promise<att.Micheline> => {
  return await Completium.getValueFromBigMap(big_map_id.toString(), key_value, key_type)
}

export const sign = async (b : att.Bytes, a : Account) : Promise<att.Signature> => {
  const signed = await Completium.sign(b.toString(), { as: a.get_name() })
  return new att.Signature(signed.prefixSig)
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

export const deploy_from_json = async (name : string, code : any, storage : att.Micheline) : Promise<string> => {
  const [contract, _] = await Completium.originate(
    null, {
      named : name,
      contract_json : code,
      storage_json : storage
    }
  )
  return contract.address
}

export const deploy_callback = async (name: string, mt : att.MichelineType) : Promise<string> => {
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

export const get_callback_value = async <T extends att.ArchetypeTypeArg>(callback_addr : string, mich_to : (_ : any) => T) : Promise<T> => {
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
export const call = async (c : string, e : string, a : att.Micheline, p : Partial<Parameters>) => {
  return await Completium.call(c, {
      entry: e,
      argJsonMichelson: a,
      as: p.as ? p.as.pkh : undefined,
      amount: p.amount ? p.amount.toString()+"utz" : undefined
   })
}

export const get_call_param = async (c : string, e : string, a : att.Micheline, p : Partial<Parameters>) : Promise<att.CallParameter> => {
  const param = await Completium.call(c, {
      entry: e,
      argJsonMichelson: a,
      as: p.as ? p.as.pkh : undefined,
      amount: p.amount ? p.amount.toString()+"utz" : undefined,
      only_param : true
   })
   return {
    destination : new att.Address(param.to),
    amount      : new att.Tez(param.amount),
    fee         : param.fee ? new att.Tez(param.fee) : undefined,
    entrypoint  : param.parameter.entrypoint,
    arg         : param.parameter.value
   }
}

export const exec_batch = async (cps : att.CallParameter[], p : Partial<Parameters>) => {
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

export const exec_getter = async (contract : att.Address, entry : string, arg : att.Micheline, param : Partial<Parameters>) => {
  return await Completium.runGetter(entry, contract.toString(), {
      argJsonMichelson: arg,
      as: param.as ? param.as.pkh : undefined,
      amount: param.amount ? param.amount.toString() + "utz" : undefined,
      json : true,
   })
}

export const exec_view = async (contract : att.Address, view : string, arg : att.Micheline, param : Partial<Parameters>) => {
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

