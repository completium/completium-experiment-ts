import { Nat } from '@completium/archetype-ts-types';
import BigNumber from 'bignumber.js';
import { set_mockup, set_endpoint, get_endpoint, is_mockup, deploy, originate, get_account, set_quiet } from '../src';

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
