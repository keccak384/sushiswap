import { BigInt, log } from '@graphprotocol/graph-ts'

import { ConvexRewarder, HarvestFromMasterChefCall } from '../../generated/MasterChefV2/ConvexRewarder'
import { MasterChefV2Rewarder } from '../../generated/schema'

export function harvestFromMasterChef(call: HarvestFromMasterChefCall): void {
  log.info('ConvexRewarder harvestFromMasterChef', [])
  const rewarder = MasterChefV2Rewarder.load(call.to.toHex()) as MasterChefV2Rewarder
  const convexRewarderContract = ConvexRewarder.bind(call.to)
  const rewardRate = convexRewarderContract.rewardRate()
  rewarder.rewardPerSecond = rewardRate
  rewarder.rewardPerBlock = rewardRate.times(BigInt.fromU32(13))
  rewarder.save()
}
