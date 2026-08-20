import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type PillLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  solid?: boolean
  external?: boolean
}

/** Hairline pill link — the site's primary CTA style. */
export function PillLink({ href, solid, external, className, children, ...rest }: PillLinkProps) {
  const cls = `pill${solid ? ' solid' : ''}${className ? ` ${className}` : ''}`
  if (external || href.startsWith('http') || href.startsWith('#')) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  solid?: boolean
}

/** Hairline pill for form submits and non-navigation actions. */
export function PillButton({ solid, className, children, ...rest }: PillButtonProps) {
  return (
    <button className={`pill${solid ? ' solid' : ''}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </button>
  )
}
