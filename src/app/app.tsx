"use client";

import { APP_NAME } from "@/lib/constants";
import AppComponent from "@/components/App";

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  return <AppComponent />;
}
