import { BigInt, log } from '@graphprotocol/graph-ts'

import { MasterChefV2Rewarder } from '../../generated/schema'
import { LogRewardPerSecond } from '../../generated/templates/ComplexRewarder/ComplexRewarder'

export function rewardPerSecond(event: LogRewardPerSecond): void {
  log.info('Complex Rewarder 02: rewardPerSecond {}', [event.params.rewardPerSecond.toString()])
  const rewarder = MasterChefV2Rewarder.load(event.address.toHex()) as MasterChefV2Rewarder
  rewarder.rewardPerSecond = event.params.rewardPerSecond
  rewarder.rewardPerBlock = event.params.rewardPerSecond.times(BigInt.fromU32(13))
  rewarder.save()
}
