import { SushiIcon } from '@sushiswap/ui'
import * as React from 'react'
import { CSSProperties } from 'react'

export const defaultConfig = {
  styles: {
    root: undefined,
    header: undefined,
    seperator: undefined,
    footer: {
      root: undefined,
    },
  },
  classes: {
    root: 'flex flex-col max-w-sm mx-auto p-0.5 bg-slate-700 rounded-xl relative shadow-md shadow-slate-900',
    header: '',
    seperator: 'h-0',
    footer: {
      root: 'flex items-center justify-center cursor-pointer pointer-events-auto group hover:text-pink',
    },
  },
}

export interface Config {
  styles: {
    root: CSSProperties | undefined
    header: CSSProperties | undefined
    seperator: CSSProperties | undefined
    footer: {
      root: CSSProperties | undefined
    }
  }
  classes: {
    root: string
    header: string
    seperator: string
    footer: {
      root: string
    }
  }
}

export interface Props {
  config?: Config
  header?: React.ReactNode
  footer?: React.ReactNode
  seperator?: React.ReactNode
  button?: React.ReactNode
  children?: React.ReactNode
}

export function Widget({
  header = <></>,
  footer = (
    <>
      <SushiIcon width="1em" height="1em" className="mr-1 text-slate-400 group-hover:animate-spin" />{' '}
      <span className="text-xs select-none text-slate-500 group-hover:text-slate-300">
        Powered by the SushiSwap protocol
      </span>
    </>
  ),
  seperator = <></>,
  button = <></>,
  config = defaultConfig,
}: Props) {
  return (
    <article id="sushiswap-widget" className={config.classes.root} style={config.styles.root}>
      <header id="sushiswap-widget-header" className={config.classes.header} style={config.styles.header}>
        {header}
      </header>
      <div className="p-3 rounded-t-xl">
        <input />
      </div>
      <hr id="sushiswap-widget-seperator" className={config.classes.seperator} style={config.styles.seperator}>
        {seperator}
      </hr>
      <div className="p-3 bg-slate-800 rounded-xl ">
        <input />
      </div>
      <footer id="sushiswap-widget-footer" className={config.classes.footer.root} style={config.styles.footer.root}>
        {footer}
      </footer>
    </article>
  )
}

Widget.displayName = 'Widget'
