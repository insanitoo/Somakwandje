---
name: Analytics privacy
description: Privacy boundary for the site's self-hosted access metrics.
---

Country metrics resolve the visitor IP in memory and persist only the country code, path, and timestamp; raw IP addresses must not be stored.

**Why:** The site needs country-level reporting without sending visitor data to third-party analytics services or retaining unnecessary personal data.

**How to apply:** Keep future metrics additions aggregate-oriented; if unique visitors or retention are added, use an explicit privacy-safe design rather than reintroducing raw IP storage.