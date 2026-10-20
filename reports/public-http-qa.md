# Public route and image HTTP check

Checked 2125 local URLs against http://127.0.0.1:4193 using HEAD requests and response content types.
- Discovery pages: 1371
- Private entry pages: 1
- Referenced images, including responsive variants: 686
- Entry stylesheets and scripts: 55
- Licensed audio files: 12
- Passed: 2125
- Failed: 0

This check verifies route availability and asset responses. Interactive mounting is covered separately by check-platform-upgrade.mjs and check-play.mjs. Missing photographs explicitly listed in the content manifest remain research gaps, rather than broken image requests.
