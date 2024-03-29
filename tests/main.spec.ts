import { Address, Bytes, Chain_id, Micheline, MichelineType, Mint, Nat, Tez } from '@completium/archetype-ts-types';
import { set_mockup, set_endpoint, get_endpoint, is_mockup, deploy, originate, get_account, get_call_param, set_quiet, Account, get_balance, get_big_map_value, get_storage, get_raw_storage, expect_to_fail, call, set_mockup_now, get_mockup_now, delay_mockup_now_by_second, delay_mockup_now_by_minute, delay_mockup_now_by_hour, delay_mockup_now_by_day, delay_mockup_now_by_week, expr_micheline_to_json, json_micheline_to_expr, set_mockup_chain_id, get_chain_id, exec_batch, register_global_constant, mockup_bake, get_mockup_level, mockup_init, configure_experiment, get_sandbox_exec_address } from '../src';

const Completium = require('@completium/completium-cli');
const assert = require('assert');

set_quiet(true)
set_mockup()

describe('Completium', () => {
  it('deploy', async () => {
    const alice = get_account('alice');
    const addr = await deploy('./tests/contracts/simple.arl', {}, { as: alice });
  })

  it('originate', async () => {
    const bob = get_account('bob');
    const storage = new Nat(0);
    const addr = await originate('./tests/contracts/simple.tz', storage.to_mich(), { as: bob });
  })

  it('call', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/simple.arl', {}, { as: alice });
    await call(res.address, "exec", { prim: "Unit" }, { as: alice })
  })

  it('expect_to_fail', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/error.arl', {}, { as: alice });
    await expect_to_fail(async () => {
      await call(res.address, "exec", { prim: "Unit" }, { as: alice })
    }, { "string": "error" })
  })

  it('get_big_map_value', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/big_map.arl', {}, { as: alice });
    const storage = await get_storage(res.address);
    const big_map_id: bigint = storage;
    const key_value = { int: "2" };
    const key_type: MichelineType = { prim: "nat", annots: [] };
    const value = await get_big_map_value(big_map_id, key_value, key_type);
    assert(JSON.stringify(value) == `{"string":"mystr"}`);
  })

  it('get_big_map_value with value', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/big_map.arl', {}, { as: alice });
    const storage = await get_storage(res.address);
    const big_map_id: bigint = storage;
    const key_value = { int: "2" };
    const key_type: MichelineType = { prim: "nat", annots: [] };
    const value_type: MichelineType = { prim: "string", annots: [] };
    const value = await get_big_map_value(big_map_id, key_value, key_type, value_type);
    assert(value == 'mystr');
  })

  it('get_storage', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/simple.arl', {}, { as: alice });

    const storage = await get_storage(res.address);
    assert(storage == '0');
  })

  it('get_raw_storage', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/simple.arl', {}, { as: alice });

    const storage = await get_raw_storage(res.address);
    assert((storage as Mint).int == '0');
  })
})

describe('Account', () => {
  it('sign', async () => {
    const alice = get_account('alice');
    const data = new Bytes("050002");
    const sig = await alice.sign(data);
    assert(sig.toString() == "edsigtZ5u2yo1EfNLoxaPKafnmDZ6q1tjaP6deA7mX5dwx6GyPoN3Y3BfJv76jDcTAy9wsxkL1AQzFb4FvTWxLAtaXiS2dQg9gw", "Bad signature for alice")
  })

  it('sign anonymous', async () => {
    const unknown_account = new Account('unknow_account', 'edpkuvdBStTR7oFxDZ39siJEZzBMhwiq36uGCJmKP1tajbqGF8hnsv', 'tz1NwuWKWdvnzWye8LuDVNYAtZd86gXWMgbD', 'edskRet5YfuDNHomHY4NGPxDpEHTiQSQUBdQSp24bXExsQx5Zej5Bk2nMe22UzpLmSZ75w9adpmF97edazuZLHqDoibeDsKLq3');
    const data = new Bytes("050002");
    const sig = await unknown_account.sign(data);
    assert(sig.toString() == "edsigu6PJedxVVMgAXMBJUfkGv5B1aAcrBr33fo8t97evCJ9cHMSpnznz29QLu7gHgfdxdDiXJ1Wuzyd7CdtnsHseEV4rtyWv1X", "Bad signature for unknown_account")
  })

  it('originate', async () => {
    const bob = get_account('bob');
    const storage = new Nat(0);
    const addr = await originate('./tests/contracts/simple.tz', storage.to_mich(), { as: bob });
  })
})

describe('Mockup', () => {
  it('set_endpoint', () => {
    set_endpoint('mockup');
  })
  it('get_endpoint', () => {
    const endpoint = get_endpoint();
    assert(endpoint == 'mockup')
  })
  it('set_mockup', () => {
    set_mockup()
  })
  it('set_mockup', () => {
    assert(is_mockup())
  })
})

describe('Mockup time', () => {
  it('set and get mockup_now', () => {
    const d = new Date("2020-01-01T00:00:01.000Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");
  })

  it('set and get mockup_now', () => {
    const d = new Date("2020-01-01T00:00:01.001Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(nd.toISOString() == "2020-01-01T00:00:01.000Z", "Invalid value");
  })

  it('set and get mockup_now', () => {
    const d = new Date("2020-01-01T00:00:01.999Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(nd.toISOString() == "2020-01-01T00:00:01.000Z", "Invalid value");
  })

  it('delay_mockup_now_by_second', () => {
    const d = new Date("2020-01-01T00:00:01.000Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");
    delay_mockup_now_by_second(2);
    const v = get_mockup_now();
    assert(v.toISOString() == "2020-01-01T00:00:03.000Z", "Invalid value");
  })

  it('delay_mockup_now_by_minute', () => {
    const d = new Date("2020-01-01T00:00:01.000Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");
    delay_mockup_now_by_minute(2)
    const v = get_mockup_now();
    assert(v.toISOString() == "2020-01-01T00:02:01.000Z", "Invalid value");
  })

  it('delay_mockup_now_by_hour', () => {
    const d = new Date("2020-01-01T00:00:01.000Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");
    delay_mockup_now_by_hour(2)
    const v = get_mockup_now();
    assert(v.toISOString() == "2020-01-01T02:00:01.000Z", "Invalid value");
  })

  it('delay_mockup_now_by_day', () => {
    const d = new Date("2020-01-01T00:00:01.000Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");
    delay_mockup_now_by_day(2)
    const v = get_mockup_now();
    assert(v.toISOString() == "2020-01-03T00:00:01.000Z", "Invalid value");
  })

  it('delay_mockup_now_by_week', () => {
    const d = new Date("2020-01-01T00:00:01.000Z");
    set_mockup_now(d)
    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");
    delay_mockup_now_by_week(2)
    const v = get_mockup_now();
    assert(v.toISOString() == "2020-01-15T00:00:01.000Z", "Invalid value");
  })

  it('check on-chain now', async () => {
    const d = new Date("2022-12-06T16:30:00.000Z");
    set_mockup_now(d)

    const alice = get_account('alice');
    const contract = await deploy('./tests/contracts/gnow.arl', {}, { as: alice });

    await call(contract.address, "exec", { prim: "Unit" }, { as: alice })

    const nd = get_mockup_now();
    assert(d.toISOString() == nd.toISOString(), "Invalid value");

    const storage = await Completium.getStorage(contract.address);
    const onchain_date = new Date(storage);

    assert(onchain_date.toISOString() == nd.toISOString(), "Invalid value");
  })
})

describe('Mockup chain_id', () => {
  it('expr_micheline_to_json', async () => {
    const init_value = await get_chain_id();

    const chainid = new Chain_id("NetXdQprcVkpaWU");
    set_mockup_chain_id(chainid)

    const v = await get_chain_id();
    assert(v.equals(chainid))

    set_mockup_chain_id(init_value)
  })
})

describe('Utils', () => {
  it('expr_micheline_to_json', async () => {
    const input = '{ DROP }'
    const output = expr_micheline_to_json(input);
    assert(JSON.stringify(output, null, 0) == '[{"prim":"DROP"}]')
  })

  it('json_micheline_to_expr', async () => {
    const input: Micheline = [{ "prim": "DROP" }]
    const output = json_micheline_to_expr(input);
    assert(output == '{DROP}')
  })

  // it('configure_experiment', async () => {
  //   await configure_experiment();
  //   // or
  //   await configure_experiment({
  //     account: 'alice',
  //     endpoint: 'mockup',
  //     quiet: true,
  //   });
  // })

  // it('mockup init', async () => {
  //   await mockup_init()
  //   // or
  //   await mockup_init({protocol: "PtLimaPtLMwfNinJi9rCfDPWea8dFgTZ1MeJ9f1m2SRic6ayiwW"})
  // })
})

describe('Events', () => {
  it('call', async () => {
    set_endpoint('mockup');
    const alice = get_account('alice');
    const res_deploy = await deploy('./tests/contracts/event_emit.arl', {}, { as: alice });
    const res_call = await call(res_deploy.address, "exec", { prim: "Unit" }, { as: alice });
    assert(res_call.events.length == 2)

    const event_first = res_call.events[0];
    assert(event_first.from.equals(new Address(res_deploy.address)))
    assert(JSON.stringify(event_first.type) == "{\"prim\":\"pair\",\"args\":[{\"prim\":\"nat\",\"annots\":[\"%a\"]},{\"prim\":\"string\",\"annots\":[\"%b\"]}]}")
    assert(event_first.tag == "e_event")
    assert(JSON.stringify(event_first.payload) == "{\"prim\":\"Pair\",\"args\":[{\"int\":\"0\"},{\"string\":\"toto\"}]}")
    assert(event_first.consumed_gas == 100)

    const event_second = res_call.events[1];
    assert(event_second.from.equals(new Address(res_deploy.address)))
    assert(JSON.stringify(event_second.type) == "{\"prim\":\"pair\",\"args\":[{\"prim\":\"nat\",\"annots\":[\"%a\"]},{\"prim\":\"string\",\"annots\":[\"%b\"]}]}")
    assert(event_second.tag == "e_event")
    assert(JSON.stringify(event_second.payload) == "{\"prim\":\"Pair\",\"args\":[{\"int\":\"2\"},{\"string\":\"titi\"}]}")
    assert(event_second.consumed_gas == 100)
  })

  it('batch', async () => {
    set_endpoint('mockup');
    const alice = get_account('alice');
    const res_deploy = await deploy('./tests/contracts/event_emit.arl', {}, { as: alice });
    const param = await get_call_param(res_deploy.address, "exec", { prim: "Unit" }, { as: alice });
    const params = [param, param, param]

    const res_call = await exec_batch(params, { as: alice });
    assert(res_call.events.length == 6)

    for (let i = 0; i < 2; ++i) {
      const event_first = res_call.events[i * 2 + 0];
      assert(event_first.from.equals(new Address(res_deploy.address)))
      assert(JSON.stringify(event_first.type) == "{\"prim\":\"pair\",\"args\":[{\"prim\":\"nat\",\"annots\":[\"%a\"]},{\"prim\":\"string\",\"annots\":[\"%b\"]}]}")
      assert(event_first.tag == "e_event")
      assert(JSON.stringify(event_first.payload) == "{\"prim\":\"Pair\",\"args\":[{\"int\":\"0\"},{\"string\":\"toto\"}]}")
      assert(event_first.consumed_gas == 100)

      const event_second = res_call.events[i * 2 + 1];
      assert(event_second.from.equals(new Address(res_deploy.address)))
      assert(JSON.stringify(event_second.type) == "{\"prim\":\"pair\",\"args\":[{\"prim\":\"nat\",\"annots\":[\"%a\"]},{\"prim\":\"string\",\"annots\":[\"%b\"]}]}")
      assert(event_second.tag == "e_event")
      assert(JSON.stringify(event_second.payload) == "{\"prim\":\"Pair\",\"args\":[{\"int\":\"2\"},{\"string\":\"titi\"}]}")
      assert(event_second.consumed_gas == 100)
    }
  })
})

describe('Utils', () => {
  it('register_global_constant', async () => {
    const alice = get_account('alice');
    const res = await register_global_constant(new Nat(3).to_mich(), { as: alice });
  })

  // it('get_mockup_level and mockup_bake', async () => {
  //   const delta = 5;
  //   const before_level = await get_mockup_level();
  //   for (var i = 0; i < delta; ++i) {
  //     await mockup_bake();
  //   }
  //   const after_level = await get_mockup_level();
  //   assert(parseInt(before_level) + delta ==  parseInt(after_level))
  // })

  it('get_sandbox_exec_address', async () => {
    const addr = get_sandbox_exec_address()
    const balance = await get_balance(addr);
    assert(balance.equals(new Tez(0)))
  })
})
