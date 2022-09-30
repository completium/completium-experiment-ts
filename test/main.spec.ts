import BigNumber from 'bignumber.js';
import { set_mockup, get_endpoint, is_mockup } from '../src';

const assert = require('assert');

describe('Mockup', () => {
  it('set_mockup', () => {
    set_mockup()
  })
  it('get_endpoint', () => {
    const endpoint = get_endpoint();
    assert(endpoint == 'mockup')
  })
  it('set_mockup', () => {
    assert(is_mockup())
  })
})
