import { ChainId } from '@sushiswap/chain'
import { WNATIVE_ADDRESS } from '@sushiswap/currency'
import { EXCHANGE_SUBGRAPH_NAME, GRAPH_HOST, TRIDENT_SUBGRAPH_NAME } from '@sushiswap/graph-client/config'
import { Farm } from 'src/types'

import { getBlockDaysAgo } from './blocks'
import { getTokenPrices } from './prices'

interface Pair {
  id: string
  feeApr: number
  totalSupply: number
  liquidityUSD: number
  type: Farm['poolType']
}

async function getExchangePairs(ids: string[], chainId: ChainId): Promise<Pair[]> {
  const { getBuiltGraphSDK } = await import('../../../.graphclient')
  const subgraphName = EXCHANGE_SUBGRAPH_NAME[chainId]
  if (!subgraphName) return []
  const sdk = getBuiltGraphSDK({ host: GRAPH_HOST[chainId], name: subgraphName })

  const [block7d, { Exchange_pairs: pairs }, [{ derivedUSD: nativePrice }]] = await Promise.all([
    getBlockDaysAgo(7, chainId),
    sdk.ExchangePairs({ where: { id_in: ids.map((id) => id.toLowerCase()) } }),
    getTokenPrices([WNATIVE_ADDRESS[chainId]], chainId),
  ])

  const { Exchange_pairs: pairs7d } = await sdk.ExchangePairs({
    where: { id_in: ids.map((id) => id.toLowerCase()) },
    block: { number: block7d?.number },
  })

  return pairs.map((pair) => {
    const pair7d = pairs7d.find((pair7d) => pair7d.id === pair.id)

    return {
      id: pair.id,
      feeApr: pair7d ? (pair.volumeUSD - pair7d.volumeUSD) / pair.reserveUSD : 0,
      totalSupply: Number(pair.totalSupply),
      liquidityUSD: pair.trackedReserveETH * nativePrice,
      type: 'Legacy',
    }
  })
}

async function getTridentPairs(ids: string[], chainId: ChainId): Promise<Pair[]> {
  const { getBuiltGraphSDK } = await import('../../../.graphclient')
  const subgraphName = TRIDENT_SUBGRAPH_NAME[chainId]
  if (!subgraphName) return []
  const sdk = getBuiltGraphSDK({ host: GRAPH_HOST[chainId], name: subgraphName })

  const [block7d, { Trident_pairs: pairs }, [{ derivedUSD: nativePrice }]] = await Promise.all([
    getBlockDaysAgo(7, chainId),
    sdk.TridentPairs({ where: { id_in: ids.map((id) => id.toLowerCase()) } }),
    getTokenPrices([WNATIVE_ADDRESS[chainId]], chainId),
  ])

  const { Trident_pairs: pairs7d } = await sdk.TridentPairs({
    where: { id_in: ids.map((id) => id.toLowerCase()) },
    block: { number: block7d?.number },
  })

  return pairs.map((pair) => {
    const pair7d = pairs7d.find((pair7d) => pair7d.id === pair.id)

    return {
      id: pair.id,
      feeApr: pair7d ? (pair.volumeNative - pair7d.volumeNative) / pair.liquidityNative : 0,
      totalSupply: Number(pair.liquidity),
      liquidityUSD: pair.liquidityNative * nativePrice,
      type: 'Trident',
    }
  })
}

// async function getKashiPairs(ids: string[], chainId: ChainId): Promise<Pair[]> {
//   const { getBuiltGraphSDK } = await import('../../.graphclient')
// }

export async function getPairs(ids: string[], chainId: ChainId) {
  return (await Promise.all([getExchangePairs(ids, chainId), getTridentPairs(ids, chainId)])).flat()
}
