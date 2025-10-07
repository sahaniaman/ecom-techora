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
  Crown,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Package,
  Phone,
  RotateCcw,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  Zap
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ProductCategory } from "@/types/product";
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

const Navbar = async () => {
  const categories = [
    {
      id: ProductCategory.MOBILE_ACCESSORIES,
      name: "Mobile Accessories",
      icon: <Phone className="w-5 h-5" />,
    },
    {
      id: ProductCategory.PREMIUM_PHONES,
      name: "Premium Phones",
      icon: <Crown className="w-5 h-5" />,
    },
    {
      id: ProductCategory.REFURBISHED_PHONES,
      name: "Refurbished Phones",
      icon: <RotateCcw className="w-5 h-5" />,
    },
    {
      id: ProductCategory.GADGETS,
      name: "Gadgets",
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const user = await getCurrentUser();

  return (
    <>
      {/* Top Bar - Always visible */}
      <header className="sticky top-0 z-50 glass-card-strong border-b border-border/50 bg-background/80 backdrop-blur-xl font-serif transition-all duration-300 hover-lift">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and search - simplified for mobile */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center hover-scale shadow-glow-primary">
                <Sparkles className="text-foreground w-4 h-4 animate-pulse-glow" />
              </div>
              <span className="text-xl font-mono font-semibold text-foreground">
                TechOra
              </span>
            </Link>


            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-xl mx-4 ">
              <form className="relative">
                <Input
                  type="text"
                  placeholder="Search premium products..."
                  className="pl-12 pr-4 h-12 rounded-xl border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm w-full focus-visible-ring transition-all duration-300 hover:shadow-soft"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              </form>
            </div>

            {/* Icons - simplified for mobile */}
            <div className="md:flex items-center space-x-1 sm:space-x-2 hidden ">
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
                        {user && <span>{user.email}</span>}
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
                    {user && user.role === "SUPER_ADMIN" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/superadmin"
                            className="flex items-center cursor-pointer"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Super Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user && user.role === "ADMIN" && (
                      <>
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
                      </>
                    )}

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
            </div>

            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), 'size-10 md:hidden rounded-lg')}>
                <Menu className="size-5 text-foreground" />
              </SheetTrigger>
              <SheetContent className="font-serif w-full sm:max-w-md px-3 ">
                <SheetHeader className="text-left">
                  <SheetTitle className="sr-only">Menu Navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Mobile navigation menu for TechOra
                  </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 py-6">
                  {/* User Section */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <SignedIn>
                      <div className="flex items-center gap-3">
                        <UserButton />
                        <div>
                          <p className="text-base font-medium">Welcome back!</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {user && <span>{user.email}</span>}
                          </p>
                        </div>
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Welcome!</p>
                          <p className="text-xs text-muted-foreground">Sign in to your account</p>
                        </div>
                      </div>
                    </SignedOut>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <SignedIn>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base"
                      >
                        <User className="size-5" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base"
                      >
                        <Package className="size-5" />
                        My Orders
                      </Link>
                      <Link
                        href="/addresses"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base"
                      >
                        <MapPin className="size-5" />
                        Addresses
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base"
                      >
                        <Settings className="size-5" />
                        Settings
                      </Link>

                      {/* Admin Section */}
                      {user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
                        <>
                          <div className="border-t my-3" />
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base bg-primary/5 border"
                          >
                            <Settings className="size-5" />
                            {user.role === "SUPER_ADMIN" ? "Super Admin Panel" : "Admin Panel"}
                          </Link>
                        </>
                      )}

                      <div className="border-t my-3" />
                      <SignOutButton>
                        <Button className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base w-full text-red-600">
                          <LogOut className="size-5" />
                          Sign Out
                        </Button>
                      </SignOutButton>
                    </SignedIn>

                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base w-full">
                          <User className="size-5" />
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base w-full">
                          <User className="size-5" />
                          Create Account
                        </Button>
                      </SignUpButton>
                    </SignedOut>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base relative"
                    >
                      <Heart className="size-5" />
                      Wishlist
                      <Badge className="ml-auto h-6 w-6 rounded-full p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                        0
                      </Badge>
                    </Link>

                    <Link
                      href="/cart"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base relative"
                    >
                      <ShoppingCart className="size-5" />
                      Shopping Cart
                      <Badge className="ml-auto h-6 w-6 rounded-full p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                        0
                      </Badge>
                    </Link>
                  </div>

                  {/* Categories Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Categories</h3>
                    <div className="grid gap-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-base"
                        >
                          <span className="text-muted-foreground">{category.icon}</span>
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <ThemeToggleButton
              className="size-7 mx-2 pointer-events-auto "
              variant="circle"
              start="top-center"
              blur={true}
            />
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:block border-t border-border/50">
            <ul className="flex items-center justify-evenly lg:justify-start lg:flex-wrap lg:gap-4 py-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.id}`}
                    className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors flex items-center space-x-2 group"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 bg-background/80 backdrop-blur-md font-serif">
        <ul className="flex items-center justify-around py-3">
          {categories.map((category) => (
            <li key={category.id} className="flex-1">
              <Link
                href={`/category/${category.id}`}
                className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors hover:bg-accent/50"
              >
                {category.icon}
                <span className="text-xs font-medium text-center">{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>


    </>
  );
};

export default Navbar;