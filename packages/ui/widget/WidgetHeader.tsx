import { FC, ReactNode } from 'react'

import { Typography } from '../typography'

export interface WidgetHeaderProps {
  title: string
  children?: ReactNode
}

export const WidgetHeader: FC<WidgetHeaderProps> = ({ title, children }) => {
  return (
    <div className="p-3 mx-0.5 grid grid-cols-2 items-center pb-4 font-medium">
      <Typography weight={500} className="text-slate-100 hover:text-slate-200 flex items-center gap-2">
        {title}
      </Typography>
      <div className="flex justify-end">{children}</div>
    </div>
  )
}
