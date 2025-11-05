"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  Moon,
  Sun,
  Palette,
  Monitor,
  Save,
  CheckCircle2,
  Database,
  Link,
  Lock,
  FileText,
  LayoutGrid,
  Clock,
  Mail,
} from "lucide-react"

export default function SettingsPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    agreementAlerts: true,
    clientUpdates: true,
    financialReports: true,
    systemUpdates: false,
  })

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    theme: "light",
    density: "comfortable",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
  })

  // Integration settings
  const [integrationSettings, setIntegrationSettings] = useState({
    googleCalendar: false,
    microsoftOutlook: true,
    quickbooks: true,
    athenaHealth: false,
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    activityTracking: true,
    dataSharingForAnalytics: true,
    cookieConsent: true,
  })

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleDisplayChange = (setting: string, value: string) => {
    setDisplaySettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleIntegrationChange = (setting: string, value: boolean) => {
    setIntegrationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">Notification Types</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agreement Alerts</Label>
                    <p className="text-sm text-gray-500">Expiring agreements and renewals</p>
                  </div>
                  <Switch
                    checked={notificationSettings.agreementAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("agreementAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Client Updates</Label>
                    <p className="text-sm text-gray-500">New clients and client changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.clientUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("clientUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Financial Reports</Label>
                    <p className="text-sm text-gray-500">Billing and revenue updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.financialReports}
                    onCheckedChange={(checked) => handleNotificationChange("financialReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-gray-500">Platform updates and maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Display Settings
              </CardTitle>
              <CardDescription>Customize the appearance of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <RadioGroup
                  value={displaySettings.theme}
                  onValueChange={(value) => handleDisplayChange("theme", value)}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="flex items-center">
                      <Sun className="h-4 w-4 mr-1" />
                      Light
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="flex items-center">
                      <Moon className="h-4 w-4 mr-1" />
                      Dark
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system" className="flex items-center">
                      <Monitor className="h-4 w-4 mr-1" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="density">Interface Density</Label>
                <Select
                  value={displaySettings.density}
                  onValueChange={(value) => handleDisplayChange("density", value)}
                >
                  <SelectTrigger id="density">
                    <SelectValue placeholder="Select density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={displaySettings.language}
                  onValueChange={(value) => handleDisplayChange("language", value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select
                    value={displaySettings.timezone}
                    onValueChange={(value) => handleDisplayChange("timezone", value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={displaySettings.dateFormat}
                    onValueChange={(value) => handleDisplayChange("dateFormat", value)}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button variant="outline">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Integrations
              </CardTitle>
              <CardDescription>Connect with other services and applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Google Calendar</Label>
                  <p className="text-sm text-gray-500">Sync appointments and deadlines</p>
                </div>
                <Switch
                  checked={integrationSettings.googleCalendar}
                  onCheckedChange={(checked) => handleIntegrationChange("googleCalendar", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Microsoft Outlook</Label>
                  <p className="text-sm text-gray-500">Sync emails and calendar</p>
                </div>
                <Switch
                  checked={integrationSettings.microsoftOutlook}
                  onCheckedChange={(checked) => handleIntegrationChange("microsoftOutlook", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">QuickBooks</Label>
                  <p className="text-sm text-gray-500">Sync financial data</p>
                </div>
                <Switch
                  checked={integrationSettings.quickbooks}
                  onCheckedChange={(checked) => handleIntegrationChange("quickbooks", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">athenaHealth</Label>
                  <p className="text-sm text-gray-500">Sync patient and billing data</p>
                </div>
                <Switch
                  checked={integrationSettings.athenaHealth}
                  onCheckedChange={(checked) => handleIntegrationChange("athenaHealth", checked)}
                />
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Manage API Keys
                </Button>
                <Button variant="outline">
                  <Link className="h-4 w-4 mr-2" />
                  Add New Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Manage your data privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Activity Tracking</Label>
                  <p className="text-sm text-gray-500">Track your actions for audit purposes</p>
                </div>
                <Switch
                  checked={privacySettings.activityTracking}
                  onCheckedChange={(checked) => handlePrivacyChange("activityTracking", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Sharing for Analytics</Label>
                  <p className="text-sm text-gray-500">Share anonymous usage data to improve the platform</p>
                </div>
                <Switch
                  checked={privacySettings.dataSharingForAnalytics}
                  onCheckedChange={(checked) => handlePrivacyChange("dataSharingForAnalytics", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Cookie Consent</Label>
                  <p className="text-sm text-gray-500">Allow cookies for improved functionality</p>
                </div>
                <Switch
                  checked={privacySettings.cookieConsent}
                  onCheckedChange={(checked) => handlePrivacyChange("cookieConsent", checked)}
                />
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Data Retention
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
