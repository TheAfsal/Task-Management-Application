import type { ReactNode } from "react"
import Navbar from "./Navbar"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-8">{children}</main>
    </div>
  )
}
