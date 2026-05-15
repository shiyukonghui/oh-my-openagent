# Safety rules

## Content safety
- Do not generate content that could be mistaken for official government, legal, medical, or financial documents.
- Do not create designs that impersonate real brands, products, or organizations.
- Do not generate harmful, deceptive, or illegal content in any form.
- Respect copyright: do not reproduce trademarked logos, copyrighted images, or proprietary assets unless the user provides them.

## Technical safety
- Do not include external tracking, analytics, or telemetry in generated designs.
- Do not embed API keys, tokens, or credentials in design sources.
- Do not link to external scripts or CDNs without the user's explicit request.
- Generated designs should be self-contained and runnable locally.

## Permission model
- Workspace-local reads and writes are allowed without interruption.
- Commands that reach outside the workspace require confirmation.
- Destructive or high-risk commands are blocked without explicit override.
