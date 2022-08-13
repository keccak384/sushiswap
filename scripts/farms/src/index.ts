import 'dotenv/config'

import { client } from '@sushiswap/wagmi/client'
import { createClient } from '@wagmi/core'

import { getMasterChefV1 } from './lib'

createClient(client.config as any)
;(async function () {
  console.log(await getMasterChefV1())
})()
