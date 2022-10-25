import { Bytes, MichelineType, Mint, Nat } from '@completium/archetype-ts-types';
import { set_mockup, set_endpoint, get_endpoint, is_mockup, deploy, originate, get_account, set_quiet, Account, get_big_map_value, get_storage, get_raw_storage, expect_to_fail, call } from '../src';

const assert = require('assert');

set_quiet(true)

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
    await call(res.address, "exec", {prim: "Unit"}, {as: alice})
  })

  it('expect_to_fail', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/error.arl', {}, { as: alice });
    await expect_to_fail(async () => {
      await call(res.address, "exec", {prim: "Unit"}, {as: alice})
    }, {"string": "error"})
  })

  it('get_big_map_value', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/big_map.arl', {}, { as: alice });
    const storage = await get_storage(res.address);
    const big_map_id : bigint = storage;
    const key_value = {int: "2"};
    const key_type : MichelineType = {prim: "nat", annots: []};
    const value_type : MichelineType  = {prim: "string", annots: []};
    const value = await get_big_map_value(big_map_id, key_value, key_type, value_type);
    assert (value == 'mystr');
  })

  it('get_storage', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/simple.arl', {}, { as: alice });

    const storage = await get_storage(res.address);
    assert (storage == '0');
  })

  it('get_raw_storage', async () => {
    const alice = get_account('alice');
    const res = await deploy('./tests/contracts/simple.arl', {}, { as: alice });

    const storage = await get_raw_storage(res.address);
    assert ((storage as Mint).int == '0');
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
