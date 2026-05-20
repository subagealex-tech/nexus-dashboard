"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Configure your dashboard preferences and account settings.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-outfit)]">
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Full Name</label>
                <Input defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Email</label>
                <Input defaultValue="admin@nexus.io" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Organization</label>
              <Input defaultValue="Nexus Corporation" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-outfit)]">
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Email notifications", description: "Receive email updates about your data", defaultChecked: true },
              { label: "Push notifications", description: "Get push notifications on your devices", defaultChecked: false },
              { label: "Weekly digest", description: "Receive a weekly summary of your analytics", defaultChecked: true },
              { label: "Security alerts", description: "Get notified about security events", defaultChecked: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.description}</p>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-outfit)]">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
              <div>
                <p className="text-sm font-medium text-text-primary">Delete Account</p>
                <p className="text-xs text-text-muted">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}