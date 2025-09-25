import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  ArrowRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  Smartphone,
  Shirt,
  Home,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { ThemeToggleButton } from "../ui/skiper-ui/skiper26";
import { getCurrentUser } from "@/lib/auth";

const Navbar = async () => {
   const user = await getCurrentUser();
    console.log("user      ", user)
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 bg-background/80 backdrop-blur-md font-serif">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group flex-shrink-0"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <Sparkles className="text-foreground w-5 h-5" />
            </div>
            <span className="text-2xl font-mono font-semibold text-foreground hidden sm:block">
              TechOra
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <form className="relative">
              <Input
                type="text"
                placeholder="Search premium products..."
                className="pl-12 pr-4 h-12 rounded-xl border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm w-full"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* User Menu */}
            <SignedIn>
              <UserButton />
            </SignedIn>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-10 w-10 rounded-lg hover:bg-accent",
                )}
              >
                <User className="w-5 h-5" />
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56 glass" align="end">
                <SignedIn>
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">Welcome back!</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user && <span>{user.email}</span> }
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/orders"
                      className="flex items-center cursor-pointer"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/addresses"
                      className="flex items-center cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Addresses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Section */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="flex items-center cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <SignOutButton>
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </div>
                    </SignOutButton>
                  </DropdownMenuItem>
                </SignedIn>
                <SignedOut>
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">Welcome!</p>
                    <p className="text-xs text-muted-foreground">
                      Sign in to your account
                    </p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer">
                    <SignInButton mode="modal">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </div>
                    </SignInButton>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <SignUpButton mode="modal">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Register
                      </div>
                    </SignUpButton>
                  </DropdownMenuItem>
                </SignedOut>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg hover:bg-accent relative"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                  0
                </Badge>
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg hover:bg-accent relative"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground">
                  0
                </Badge>
              </Link>
            </Button>

            <ThemeToggleButton
              className="size-7 mx-2 pointer-events-auto"
              variant="circle"
              start="top-center"
              blur={true}
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="border-t border-border/50">
          <ul className="flex flex-wrap gap-4 sm:gap-8 py-4">
            {/* Electronics Category */}
            <li>
              <Link
                href="/category/electronics"
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors flex items-center space-x-2 group"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Electronics</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />
              </Link>
            </li>

            {/* Fashion Category */}
            <li>
              <Link
                href="/category/fashion"
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors flex items-center space-x-2 group"
              >
                <Shirt className="w-4 h-4" />
                <span className="hidden sm:inline">Fashion</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />
              </Link>
            </li>

            {/* Home & Garden Category */}
            <li>
              <Link
                href="/category/home"
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors flex items-center space-x-2 group"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home & Garden</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />
              </Link>
            </li>

            {/* Sports Category */}
            <li>
              <Link
                href="/category/sports"
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors flex items-center space-x-2 group"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sports</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
