export interface Farm {
  feeApr: number
  incentives: {
    apr: number
    rewardPerDay: number
    rewardToken: {
      address: string
      symbol: string
    }
  }[]
  chefType: 'MasterChefV1' | 'MasterChefV2' | 'MiniChef'
  poolType: 'Legacy' | 'Trident' | 'Kashi' | 'Unknown'
}
