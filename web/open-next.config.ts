import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// R2バケットを用意したら、Incremental Cacheをr2-incremental-cacheに切り替える
// (@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache)
export default defineCloudflareConfig();
