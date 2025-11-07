// src/components/Navbar.js
import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, LogOut, LayoutDashboard, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout, isGuest, isOrganizer, isAdmin } = useAuth();

  const getInitials = (name) => {
    return name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted" data-testid="link-home">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EventHub</span>
        </Link>


        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-base font-medium transition-colors hover:text-primary ${location === "/" ? "text-foreground" : "text-muted-foreground"
            }`}>
            Events
          </Link>

          {(isOrganizer || isAdmin) && (
            <Link href="/organizer">
              <span
                className={`text-base font-medium transition-colors hover:text-primary ${location === "/organizer" ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                Organizer Dashboard
              </span>
            </Link>

          )}

          {isAdmin && (
            <Link href="/admin">
              <span
                className={`text-base font-medium transition-colors hover:text-primary ${location === "/admin" ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                Admin Panel
              </span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isGuest ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          ) : (
            <>
              {isOrganizer && (
                <Link href="/organizer/create">
                  <Button variant="default" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


export default Navbar;