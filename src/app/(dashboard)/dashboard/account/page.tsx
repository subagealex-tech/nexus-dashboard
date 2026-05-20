"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Bell,
  Key,
  Eye,
  EyeOff,
  Download,
  Edit2,
  Save,
  X,
  Check,
  Activity,
  ShoppingBag,
  FileText,
  CreditCardIcon,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountUser {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  avatar: string;
  role: string;
  subscription: string;
  subscriptionStatus: string;
}

interface Order {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: "completed" | "pending" | "cancelled";
}

interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: "order" | "payment" | "profile" | "security";
}

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "security" | "billing">("overview");
  
  const [formData, setFormData] = useState({
    name: "Alex Thompson",
    email: "alex.thompson@techcorp.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
  });

  const accountUser: AccountUser = {
    name: "Alex Thompson",
    email: "alex.thompson@techcorp.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    joinDate: "March 2023",
    avatar: "AT",
    role: "Premium Administrator",
    subscription: "Enterprise Plan",
    subscriptionStatus: "Active",
  };

  const orders: Order[] = [
    { id: "ORD-7829", date: "May 15, 2026", type: "Subscription Renewal", amount: "$299.00", status: "completed" },
    { id: "ORD-7721", date: "April 28, 2026", type: "Additional Storage", amount: "$49.00", status: "completed" },
    { id: "ORD-7598", date: "April 10, 2026", type: "API Credits Pack", amount: "$79.00", status: "completed" },
    { id: "ORD-7456", date: "March 22, 2026", type: "Premium Support", amount: "$149.00", status: "completed" },
    { id: "ORD-7389", date: "March 5, 2026", type: "Team License Upgrade", amount: "$499.00", status: "completed" },
  ];

  const activities: Activity[] = [
    { id: "1", action: "Profile Updated", description: "Changed phone number", timestamp: "2 hours ago", icon: "profile" },
    { id: "2", action: "New Login", description: "Chrome on macOS", timestamp: "5 hours ago", icon: "security" },
    { id: "3", action: "Export Completed", description: "Quarterly report exported", timestamp: "Yesterday", icon: "order" },
    { id: "4", action: "Payment Processed", description: "Subscription renewed", timestamp: "3 days ago", icon: "payment" },
    { id: "5", action: "Team Invited", description: "New member joined", timestamp: "1 week ago", icon: "profile" },
  ];

  const stats = useMemo(() => ({
    totalOrders: 47,
    totalSpent: "$12,458",
    activeDays: 189,
    savedReports: 23,
  }), []);

  const handleSave = () => {
    setIsEditing(false);
  };

  const getActivityIcon = (icon: Activity["icon"]) => {
    switch (icon) {
      case "order": return ShoppingBag;
      case "payment": return CreditCard;
      case "profile": return User;
      case "security": return Shield;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ] as const;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Account Management
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-80 flex-shrink-0"
        >
          <div className="glass rounded-2xl border border-glass-border p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple mx-auto flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">{accountUser.avatar}</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{accountUser.name}</h2>
              <p className="text-sm text-text-secondary">{accountUser.role}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                {accountUser.subscriptionStatus}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-glass-bg">
                <Mail className="w-5 h-5 text-accent-cyan" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm text-text-primary truncate">{accountUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-glass-bg">
                <Phone className="w-5 h-5 text-accent-purple" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm text-text-primary truncate">{accountUser.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-glass-bg">
                <MapPin className="w-5 h-5 text-accent-pink" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Location</p>
                  <p className="text-sm text-text-primary truncate">{accountUser.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-glass-bg">
                <Calendar className="w-5 h-5 text-accent-yellow" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Member Since</p>
                  <p className="text-sm text-text-primary truncate">{accountUser.joinDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-glass-bg">
                <CreditCardIcon className="w-5 h-5 text-green-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Plan</p>
                  <p className="text-sm text-text-primary truncate">{accountUser.subscription}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-glass-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent-cyan">{stats.totalOrders}</p>
                  <p className="text-xs text-text-muted">Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-purple">{stats.activeDays}</p>
                  <p className="text-xs text-text-muted">Active Days</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-pink">${stats.savedReports}</p>
                  <p className="text-xs text-text-muted">Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-yellow">{stats.savedReports}</p>
                  <p className="text-xs text-text-muted">Reports</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="glass rounded-2xl border border-glass-border overflow-hidden">
            <div className="border-b border-glass-border">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                        activeTab === tab.id
                          ? "text-accent-cyan border-accent-cyan bg-accent-cyan/5"
                          : "text-text-secondary border-transparent hover:text-text-primary hover:bg-glass-bg"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-glass-bg text-text-primary">
                          {formData.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-glass-bg text-text-primary">
                          {formData.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-glass-bg text-text-primary">
                          {formData.phone}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-glass-bg text-text-primary">
                          {formData.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-glass-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {activities.map((activity) => {
                        const Icon = getActivityIcon(activity.icon);
                        return (
                          <div
                            key={activity.id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-glass-bg hover:bg-glass-bg/80 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                              <p className="text-xs text-text-muted truncate">{activity.description}</p>
                            </div>
                            <span className="text-xs text-text-muted">{activity.timestamp}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Order History</h3>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-glass-bg hover:bg-glass-bg/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-accent-cyan" />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{order.type}</p>
                            <p className="text-sm text-text-muted">
                              {order.id} • {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-text-primary">{order.amount}</span>
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", getStatusColor(order.status))}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-glass-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-glass-bg text-center">
                        <p className="text-2xl font-bold text-accent-cyan">{stats.totalOrders}</p>
                        <p className="text-sm text-text-muted">Total Orders</p>
                      </div>
                      <div className="p-4 rounded-xl bg-glass-bg text-center">
                        <p className="text-2xl font-bold text-accent-purple">{stats.totalSpent}</p>
                        <p className="text-sm text-text-muted">Total Spent</p>
                      </div>
                      <div className="p-4 rounded-xl bg-glass-bg text-center">
                        <p className="text-2xl font-bold text-accent-pink">${Math.round(parseInt(stats.totalSpent.replace("$", "")) / stats.totalOrders)}</p>
                        <p className="text-sm text-text-muted">Avg Order Value</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text-primary">Security Settings</h3>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-glass-bg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-accent-cyan" />
                          <div>
                            <p className="font-medium text-text-primary">Password</p>
                            <p className="text-sm text-text-muted">Last changed 3 months ago</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors text-sm">
                          Change Password
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value="••••••••••••"
                          disabled
                          className="w-full px-4 py-3 pr-12 rounded-xl bg-glass-bg border border-glass-border text-text-primary"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-glass-bg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                            <p className="text-sm text-text-muted">Enabled - Using authenticator app</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Enabled
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-glass-bg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-accent-yellow" />
                          <div>
                            <p className="font-medium text-text-primary">Login Alerts</p>
                            <p className="text-sm text-text-muted">Get notified of new login attempts</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors text-sm">
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-glass-border">
                    <h4 className="font-medium text-text-primary mb-4">Recent Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-glass-bg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">Chrome on macOS</p>
                            <p className="text-xs text-text-muted">San Francisco, CA • Current session</p>
                          </div>
                        </div>
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-glass-bg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-accent-cyan" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">Safari on iOS</p>
                            <p className="text-xs text-text-muted">San Francisco, CA • 5 hours ago</p>
                          </div>
                        </div>
                        <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Billing & Subscription</h3>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </button>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-text-muted">Current Plan</p>
                        <h4 className="text-2xl font-bold text-text-primary">{accountUser.subscription}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-accent-cyan">$299</p>
                        <p className="text-sm text-text-muted">per month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        Active until June 15, 2026
                      </span>
                      <button className="text-sm text-accent-cyan hover:text-accent-cyan/80">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-glass-bg text-center">
                      <p className="text-2xl font-bold text-accent-cyan">5</p>
                      <p className="text-sm text-text-muted">Team Members</p>
                    </div>
                    <div className="p-4 rounded-xl bg-glass-bg text-center">
                      <p className="text-2xl font-bold text-accent-purple">100GB</p>
                      <p className="text-sm text-text-muted">Storage Used</p>
                    </div>
                    <div className="p-4 rounded-xl bg-glass-bg text-center">
                      <p className="text-2xl font-bold text-accent-pink">10K</p>
                      <p className="text-sm text-text-muted">API Credits</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-glass-border">
                    <h4 className="font-medium text-text-primary mb-4">Payment Method</h4>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-glass-bg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">Visa ending in 4242</p>
                          <p className="text-sm text-text-muted">Expires 12/2027</p>
                        </div>
                      </div>
                      <button className="text-sm text-accent-cyan hover:text-accent-cyan/80">
                        Update
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-glass-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-text-primary">Auto-Renewal</h4>
                        <p className="text-sm text-text-muted">Your subscription will automatically renew</p>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
