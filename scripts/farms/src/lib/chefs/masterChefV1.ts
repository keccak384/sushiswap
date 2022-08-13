import { ChainId } from '@sushiswap/chain'
import { IMasterChef, MasterChef } from '@sushiswap/core'
import MasterChefV1ABI from '@sushiswap/core/abi/MasterChef.json'
import { MASTERCHEF_ADDRESS } from '@sushiswap/core-sdk'
import { SUSHI } from '@sushiswap/currency'
import { readContract, ReadContractConfig, readContracts, ReadContractsConfig } from '@wagmi/core'
import { daysInYear, secondsInDay } from 'date-fns'
import { Farm } from 'src/types'

import { getAverageBlockTime } from '../common'
import { getPairs } from '../common/pairs'
import { getTokenPrices } from '../common/prices'

const SUSHI_PER_BLOCK = 100

async function getPoolLength() {
  const poolLengthCall: ReadContractConfig = {
    addressOrName: MASTERCHEF_ADDRESS[ChainId.ETHEREUM],
    chainId: ChainId.ETHEREUM,
    contractInterface: MasterChefV1ABI,
    functionName: 'poolLength',
  }
  return readContract<IMasterChef, Awaited<ReturnType<MasterChef['poolLength']>>>(poolLengthCall)
}

async function getTotalAllocPoint() {
  const poolLengthCall: ReadContractConfig = {
    addressOrName: MASTERCHEF_ADDRESS[ChainId.ETHEREUM],
    chainId: ChainId.ETHEREUM,
    contractInterface: MasterChefV1ABI,
    functionName: 'totalAllocPoint',
  }
  return readContract<IMasterChef, Awaited<ReturnType<MasterChef['totalAllocPoint']>>>(poolLengthCall)
}

async function getPoolInfo(poolLength: number) {
  const poolInfoCalls: ReadContractsConfig['contracts'] = [...Array(poolLength)].map((_, i) => ({
    addressOrName: MASTERCHEF_ADDRESS[ChainId.ETHEREUM],
    args: [i],
    chainId: ChainId.ETHEREUM,
    contractInterface: MasterChefV1ABI,
    functionName: 'poolInfo',
  }))
  return readContracts<Awaited<ReturnType<MasterChef['poolInfo']>>[]>({
    allowFailure: true,
    contracts: poolInfoCalls,
  })
}

export async function getMasterChefV1(): Promise<Record<string, Farm>> {
  const [poolLength, totalAllocPoint, [{ derivedUSD: sushiPriceUSD }], averageBlockTime] = await Promise.all([
    getPoolLength(),
    getTotalAllocPoint(),
    getTokenPrices([SUSHI[ChainId.ETHEREUM].address], ChainId.ETHEREUM),
    getAverageBlockTime(ChainId.ETHEREUM),
  ])
  const poolInfos = await getPoolInfo(poolLength.toNumber())
  const pairs = await getPairs(
    poolInfos.map((pool) => pool.lpToken),
    ChainId.ETHEREUM
  )

  const blocksPerDay = averageBlockTime ? secondsInDay / averageBlockTime : 0
  const sushiPerDay = SUSHI_PER_BLOCK * blocksPerDay

  return poolInfos.reduce<Record<string, Farm>>((acc, farm) => {
    const pair = pairs.find((pair) => pair.id === farm.lpToken.toLowerCase())
    if (!pair) return acc

    const rewardPerDay = sushiPerDay * (farm.allocPoint.toNumber() / totalAllocPoint.toNumber())
    const rewardPerYearUSD = daysInYear * rewardPerDay * sushiPriceUSD

    acc[farm.lpToken] = {
      feeApr: pair.feeApr,
      incentives: [
        {
          apr: rewardPerYearUSD / pair.liquidityUSD,
          rewardPerDay: rewardPerDay,
          rewardToken: {
            address: SUSHI[ChainId.ETHEREUM].address,
            symbol: SUSHI[ChainId.ETHEREUM].symbol ?? '',
          },
        },
      ],
      chefType: 'MasterChefV1',
      poolType: pair.type,
    }
    return acc
  }, {})
}
