import { ChainId } from '@sushiswap/chain'
import { EXCHANGE_SUBGRAPH_NAME, GRAPH_HOST, TRIDENT_SUBGRAPH_NAME } from '@sushiswap/graph-client/config'

interface Token {
  id: string
  liquidity: number
  derivedUSD: number
}

const getExchangeTokens = async (ids: string[], chainId: ChainId): Promise<Token[]> => {
  const { getBuiltGraphSDK } = await import('../../../.graphclient')
  const subgraphName = EXCHANGE_SUBGRAPH_NAME[chainId]
  if (!subgraphName) return []
  const sdk = getBuiltGraphSDK({ host: GRAPH_HOST[chainId], name: subgraphName })

  const { Exchange_tokens: tokens, Exchange_bundle: bundle } = await sdk.ExchangeTokens({
    where: { id_in: ids.map((id) => id.toLowerCase()) },
  })

  return tokens.map((token) => ({
    id: token.id,
    liquidity: Number(token.liquidity),
    derivedUSD: token.derivedETH * bundle?.ethPrice,
  }))
}

const getTridentTokens = async (ids: string[], chainId: ChainId): Promise<Token[]> => {
  const { getBuiltGraphSDK } = await import('../../../.graphclient')
  const subgraphName = TRIDENT_SUBGRAPH_NAME[chainId]
  if (!subgraphName) return []
  const sdk = getBuiltGraphSDK({ host: GRAPH_HOST[chainId], name: subgraphName })

  const { Trident_tokens: tokens, Trident_bundle: bundle } = await sdk.TridentTokens({
    where: { id_in: ids.map((id) => id.toLowerCase()) },
  })

  return tokens.map((token) => ({
    id: token.id,
    liquidity: Number(token.kpi?.liquidity),
    derivedUSD: token.price?.derivedNative * bundle?.nativePrice,
  }))
}

export const getTokenPrices = async (ids: string[], chainId: ChainId) => {
  const [exchangeTokens, tridentTokens] = await Promise.all([
    getExchangeTokens(ids, chainId),
    getTridentTokens(ids, chainId),
  ])

  const betterTokens = ids.map((id) => {
    const exchangeToken = exchangeTokens.find((token) => token.id === id.toLowerCase())
    const tridentToken = tridentTokens.find((token) => token.id === id.toLowerCase())

    if (exchangeToken && tridentToken)
      return exchangeToken.liquidity > tridentToken.liquidity ? exchangeToken : tridentToken
    return exchangeToken ?? (tridentToken as Token)
  })

  return betterTokens.map((token) => ({ id: token.id, derivedUSD: token.derivedUSD }))
}
