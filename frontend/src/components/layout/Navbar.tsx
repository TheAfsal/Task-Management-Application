"use client"

import { Link, useLocation } from "react-router-dom"
import { MoonIcon, SunIcon, CheckSquare, MenuIcon, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useTheme } from "../theme-provider"
import { useAuthStore } from "../../store/authStore"
import { useState } from "react"

export default function Navbar() {
  const location = useLocation()
  const { setTheme } = useTheme()
  const logout = useAuthStore((state) => state.logout)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <Link to="/" className="text-xl font-bold">
            Task Manager
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden">
          <Button variant="outline" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/groups"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/groups" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Groups
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-t shadow-md md:hidden z-40">
            <div className="flex flex-col gap-4 p-4">
              <Link
                to="/"
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/groups"
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/groups" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Groups
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Theme
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={() => { closeMenu(); logout(); }}>
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
