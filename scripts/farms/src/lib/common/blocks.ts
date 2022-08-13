import { ChainId } from '@sushiswap/chain'
import { BLOCKS_SUBGRAPH_NAME, GRAPH_HOST } from '@sushiswap/graph-client/config'
import { addDays, getUnixTime, subDays } from 'date-fns'

interface Block {
  number: number
  timestamp: number
}

const getBlock = async (timestamp: number, chainId: ChainId): Promise<Block | undefined> => {
  const { getBuiltGraphSDK } = await import('@sushiswap/graph-client/.graphclient')
  const subgraphName = BLOCKS_SUBGRAPH_NAME[chainId]
  if (!subgraphName) return
  const sdk = getBuiltGraphSDK({ host: GRAPH_HOST[chainId], name: subgraphName })

  const {
    blocks: [block],
  } = await sdk.Blocks({ where: { timestamp_gt: timestamp, timestamp_lt: timestamp + 600 } })

  if (!block) return

  return {
    number: Number(block.number),
    timestamp: Number(block.timestamp),
  }
}

export const getBlockDaysAgo = async (days: number, chainId: ChainId): Promise<Block | undefined> => {
  const timestamp = getUnixTime(subDays(new Date(), days))
  return getBlock(timestamp, chainId)
}

// Avg block time in seconds in the last 24 hours
export const getAverageBlockTime = async (chainId: ChainId): Promise<number | undefined> => {
  const now = getUnixTime(Date.now())
  const [block, block24h] = await Promise.all([getBlock(now, chainId), getBlock(getUnixTime(addDays(now, 1)), chainId)])

  if (!block || !block24h) return

  const blocks = block.number - block24h.number
  const time = block.timestamp - block24h.timestamp

  return time / blocks
}
