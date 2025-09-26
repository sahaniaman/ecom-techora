"use client";

import {
  ArrowLeft,
  Calendar,
  Crown,
  Edit,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDate } from "@/lib/formatDate";
import type { UserRole } from "@/types/User";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // sync form data when user loads (useEffect to avoid setState during render)
  useEffect(() => {
    if (!user) return;
    setFormData({
      name: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim(),
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      // call API to update DB user - adjust route as you implement it
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update profile");
      }

      setIsEditing(false);
      setStatusMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (error: unknown) {
      setStatusMessage({
        type: "error",
        text:
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: string }).message)
            : "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);

      // auto-clear message after 4s
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to view your profile.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/sign-in">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: UserRole | undefined) => {
    if (!role && typeof role === "undefined") {
      return null;
    }
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-purple-100 text-purple-700">
            <Crown className="w-3 h-3 mr-1" />
            Super Admin
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <User className="w-3 h-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hover:bg-accent">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto container-padding py-8">
        <div className="space-y-6">
          {/* status banner */}
          {statusMessage && (
            <div
              className={`rounded-md px-4 py-2 text-sm max-w-2xl mx-auto ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Profile Overview */}
          <Card className="card-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and account settings
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-semibold text-primary-foreground">
                    {user.profile?.firstName?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Member since{" "}
                      {formatDate(user.createdAt, {
                        locale: "en-GB",
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
