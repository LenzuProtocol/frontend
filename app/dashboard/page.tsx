import type { Metadata } from "next";

import React from "react";

import Dashboard from "./_components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Lenzu",
  description: "Autonomous Liquidity Manager Dashboard",
};

export default function DashboardPage() {
  return <Dashboard />;
}
