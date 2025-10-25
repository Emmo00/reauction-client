import { APIClient } from "./client";

export function syncListings() {
  return APIClient.post("/cron/sync-listings");
}
