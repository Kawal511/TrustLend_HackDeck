// app/(dashboard)/settings/page.tsx - User settings page

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, User } from "lucide-react";

export default async function SettingsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const user = await currentUser();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Settings
                </h1>
                <p className="text-gray-500 mt-1">Manage your account preferences</p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile
                    </CardTitle>
                    <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Email</Label>
                            <p className="text-sm text-gray-600">
                                {user?.emailAddresses[0]?.emailAddress || "Not available"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Name</Label>
                            <p className="text-sm text-gray-600">
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : "Not set"}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <p className="text-sm text-gray-500">
                        To update your profile information, please use the Clerk user menu in the top right corner.
                    </p>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-500">Receive updates about your loans via email</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Payment Reminders</Label>
                            <p className="text-sm text-gray-500">Get reminded before payment due dates</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Loan Confirmations</Label>
                            <p className="text-sm text-gray-500">Notify when payments are confirmed</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy
                    </CardTitle>
                    <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Searchable Profile</Label>
                            <p className="text-sm text-gray-500">Allow others to find you by email</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Show Trust Score</Label>
                            <p className="text-sm text-gray-500">Display your trust score to lenders</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Delete Account</Label>
                            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
