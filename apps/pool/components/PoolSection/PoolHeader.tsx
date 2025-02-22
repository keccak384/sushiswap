import chains from '@sushiswap/chain'
import { Price } from '@sushiswap/currency'
import { formatPercent } from '@sushiswap/format'
import { Currency, NetworkIcon, Typography } from '@sushiswap/ui'
import { FC } from 'react'

import { useTokensFromPair } from '../../lib/hooks'
import { PairWithAlias } from '../../types'

interface PoolHeader {
  pair: PairWithAlias
}

export const PoolHeader: FC<PoolHeader> = ({ pair }) => {
  const { token0, token1, reserve1, reserve0 } = useTokensFromPair(pair)
  const price = new Price({ baseAmount: reserve0, quoteAmount: reserve1 })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex gap-1">
          <NetworkIcon type="naked" chainId={pair.chainId} width={16} height={16} />

          <Typography variant="xs" className="text-slate-500">
            {chains[pair.chainId].name}
          </Typography>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex">
            <Currency.IconList iconWidth={44} iconHeight={44}>
              <Currency.Icon currency={token0} />
              <Currency.Icon currency={token1} />
            </Currency.IconList>
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <Typography variant="lg" className="text-slate-50" weight={700}>
                  {token0.symbol}/{token1.symbol}
                </Typography>
              </div>
              <Typography variant="xs" className="text-slate-300">
                Fee: {pair.swapFee / 100}%
              </Typography>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Typography weight={400} as="span" className="text-slate-400 sm:text-right">
              APR: <span className="font-bold text-slate-50">{formatPercent(pair.apr / 100)}</span>
            </Typography>
            <div className="flex gap-2">
              <Typography variant="sm" weight={400} as="span" className="text-slate-400">
                Rewards: 12%
              </Typography>
              <Typography variant="sm" weight={400} as="span" className="text-slate-400">
                Fees: 10.27%
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex gap-3 rounded-lg bg-slate-800 p-3">
          <Currency.Icon currency={token0} width={20} height={20} />
          <Typography variant="sm" weight={600} className="text-slate-300">
            1 {token0.symbol} = {price?.toSignificant(6)} {token1.symbol}
          </Typography>
        </div>
        <div className="flex gap-3 rounded-lg bg-slate-800 p-3">
          <Currency.Icon currency={token1} width={20} height={20} />
          <Typography variant="sm" weight={600} className="text-slate-300">
            1 {token1.symbol} = {price?.invert()?.toSignificant(6)} {token0.symbol}
          </Typography>
        </div>
      </div>
    </div>
  )
}
