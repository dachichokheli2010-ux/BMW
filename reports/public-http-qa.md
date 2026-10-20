# Public route and image HTTP check

Checked 2080 local URLs against http://127.0.0.1:3000 using HEAD requests and response content types.
- Discovery pages: 1358
- Private entry pages: 1
- Referenced images, including responsive variants: 683
- Entry stylesheets and scripts: 38
- Passed: 2080
- Failed: 0

This check verifies route availability and asset responses. Interactive mounting is covered separately by check-platform-upgrade.mjs and check-play.mjs. Missing photographs explicitly listed in the content manifest remain research gaps, rather than broken image requests.
