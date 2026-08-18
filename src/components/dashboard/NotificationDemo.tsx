"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/ui/NotificationDropdown";
import { Bell, CheckCircle, UserPlus, FileText, ExternalLink, RotateCcw } from "lucide-react";

export function NotificationDemo() {
  const { addNotification, notifications, unreadCount } = useNotifications();

  // Add demo notifications on first load
  useEffect(() => {
    if (notifications.length === 0) {
      const demoNotifications = [
        {
          type: "proposal_accepted" as const,
          title: "Proposal Accepted",
          description: "Amanda Ratucoko accepted proposal MAD-2026-10534548",
          actionUrl: "/proposals/prop-vykdsfmwjw5n",
          actionLabel: "View Proposal",
        },
        {
          type: "customer_created" as const,
          title: "New Customer Added",
          description: "John Smith from Bristol added to the system",
          actionUrl: "/customers/cust-abc123",
          actionLabel: "View Customer",
        },
        {
          type: "proposal_created" as const,
          title: "Proposal Created",
          description: "New proposal MAD-2026-87654321 created for Sarah Johnson",
          actionUrl: "/proposals/prop-new123",
          actionLabel: "View Proposal",
        },
        {
          type: "proposal_viewed" as const,
          title: "Proposal Viewed",
          description: "Michael Brown viewed proposal MAD-2026-11223344",
          actionUrl: "/proposals/prop-viewed456",
          actionLabel: "View Details",
        },
      ];

      // Add them with slight delays for animation effect
      demoNotifications.forEach((notif, index) => {
        setTimeout(() => addNotification(notif), index * 300);
      });
    }
  }, [notifications.length, addNotification]);

  const addTestNotification = (type: "proposal_accepted" | "customer_created" | "proposal_created" | "proposal_viewed") => {
    const templates = {
      proposal_accepted: {
        title: "Proposal Accepted",
        description: "Customer accepted proposal MAD-2026-" + Math.floor(10000000 + Math.random() * 90000000),
        actionUrl: "/proposals/new",
        actionLabel: "View Proposal",
      },
      customer_created: {
        title: "New Customer Added",
        description: "New customer added from the portal",
        actionUrl: "/customers/new",
        actionLabel: "View Customer",
      },
      proposal_created: {
        title: "Proposal Created",
        description: "New proposal created for a customer",
        actionUrl: "/proposals/new",
        actionLabel: "View Proposal",
      },
      proposal_viewed: {
        title: "Proposal Viewed",
        description: "Customer viewed a proposal via public link",
        actionUrl: "/proposals",
        actionLabel: "View Details",
      },
    };

    addNotification({ type, ...templates[type] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notification Demo</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Unread: {unreadCount}
          </span>
          <Button variant="ghost" size="sm" onClick={() => addTestNotification("proposal_accepted")}>
            <CheckCircle className="w-4 h-4 mr-1" /> Accept
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addTestNotification("customer_created")}>
            <UserPlus className="w-4 h-4 mr-1" /> Customer
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addTestNotification("proposal_created")}>
            <FileText className="w-4 h-4 mr-1" /> Proposal
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addTestNotification("proposal_viewed")}>
            <ExternalLink className="w-4 h-4 mr-1" /> Viewed
          </Button>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Click the buttons above to test different notification types. Check the bell icon in the top nav to see them.
      </p>
    </div>
  );
}