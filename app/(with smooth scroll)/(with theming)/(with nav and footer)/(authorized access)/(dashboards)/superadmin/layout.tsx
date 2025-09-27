import type { PropsWithChildren } from "react"

const layout = (children: PropsWithChildren) => {
  return (
    <div>
      {children.children}
    </div>
  )
}

export default layout
