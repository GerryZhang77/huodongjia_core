# OpenEvent UI Upgrade Plan

Last updated: 2026-06-22
Owner context: HuoDongJia frontend, branch `refactor/tailwind-v3`
Figma file: https://www.figma.com/design/S6AY0IbBbuKhFRB4YJ3hPl/OpenEvent?node-id=0-1&t=z9qkocNW4TeoUs6I-1

## Current Status

This document is the cross-session source of truth for the OpenEvent UI upgrade plan, scope, decisions, and execution progress.

Business-code implementation has not started. The current task is planning only.

Figma access status:

- MCP account checked with `whoami`: `guangming.peng@debank.com`.
- Cloud/file-key MCP calls through `mcp__figma` are blocked: `get_metadata`, `get_design_context`, `get_screenshot`, and `get_libraries` for file `S6AY0IbBbuKhFRB4YJ3hPl`, node `0:1`, returned: "Looks like you don't have edit access to this file. The file owner can share it with you and make you an editor."
- Local Figma Desktop MCP works when the file is open locally. `mcp__figma_desktop.get_metadata` listed top-level page `0:1: Page 1`, and returned page/node metadata.
- Use local Figma Desktop MCP as the primary read path for this upgrade. Cloud/file-key MCP remains optional only if permissions are fixed.
- Do not implement against guessed values. First extract exact Figma parameters with Desktop MCP, fill the "Figma Parameter Matrix" below, then get user approval before business-code changes.

## Requirements From User

- Study the Figma file carefully and align exactly with concrete Figma values.
- Analyze existing implementation and determine complete transformation scope.
- Produce a concrete, detailed plan before implementation.
- Wait for user approval before business-code changes.
- Maintain a standalone document for plan, execution state, and cross-session continuity.
- Add necessary durable notes to local memory.

## Codebase Audit Summary

Confirmed stack from `package.json`:

- React `^18.3.1`
- TypeScript `~5.8.3`
- Vite `^6.3.5`
- Tailwind CSS `^3.4.19`
- UI dependencies include `antd-mobile`, `lucide-react`, custom components in `src/components/ui`

Current route surface from `src/App.tsx`:

- Public/auth: `/login`, `/register`, `/forgot-password`
- NFC/public compatibility: `/nfc/t/:token`, `/nfc/:eventId/:userId`
- Organizer: `/dashboard/*`
- User: `/u/*`
- Public/shared activity detail: `/activity/:id`, `/activity/preview/:id`
- Dev showcase routes: `/components`, `/button-test`, `/tailwind-test`, `/simple-test`

Current layout system:

- Organizer layout: `src/components/layout/MerchantLayout.tsx`
- Organizer desktop sidebar: `src/components/layout/MerchantDesktopSidebar.tsx`
- Organizer top bar: `src/components/layout/MerchantTopBar.tsx`
- User layout: `src/components/layout/UserLayout.tsx`
- User desktop sidebar: `src/components/layout/DesktopSidebar.tsx`
- User top bar: `src/components/layout/TopBar.tsx`
- Shared mobile tab bar legacy component: `src/components/layout/BottomTabBar.tsx`

Core design system files:

- Tailwind tokens: `tailwind.config.js`
- Global CSS and antd-mobile overrides: `src/index.css`
- TypeScript tokens: `src/types/design-tokens.ts`
- Custom UI primitives: `src/components/ui/*`
- Business components: `src/components/business/*`

Important audit findings:

- `tailwind.config.js` and `src/types/design-tokens.ts` currently define different color palettes, font sizes, and token values.
- Current Tailwind theme comments describe a previous "2024 new design"; this cannot be assumed to match OpenEvent.
- Many route pages use custom UI primitives, but many also use raw Tailwind classes and direct hex/gradient values.
- The auth pages are a major old-style island: login/register/forgot password use `#4facfe`, `#00c6ff`, decorative shapes, `rounded-[30px]`, and 54px buttons.
- antd-mobile is still used widely and needs theme alignment, not only custom component alignment.
- Existing uncommitted user changes are present in:
  - `src/components/enrollment/EnrollmentDetailDrawer.tsx`
  - `src/features/activities/components/RegistrationFormBuilder/index.tsx`
  - `test-data/嘉宾信息收集6.6.xlsx`
  These must not be reverted or overwritten.

Style usage scale from static audit:

- Approximately 5,768 `className` occurrences under `src`.
- `antd-mobile` imports appear in about 88 import statements.
- `lucide-react` appears in about 114 import statements.
- `@/components/ui` appears in about 115 import statements.
- Frequent hardcoded or raw values include `#4facfe`, `#00c6ff`, `#4a78ff`, arbitrary heights/radii such as `h-[54px]`, `rounded-[30px]`, `rounded-[22px]`.

## Figma Parameter Matrix

Fill this section only from Figma Desktop MCP output or direct Figma inspection. Do not infer values from existing code or old SVG drafts.

### File Structure

| Item | Figma source node | Confirmed value |
| --- | --- | --- |
| Top-level pages | Desktop MCP, no node id | `0:1` Page 1 |
| Design system page | Pending deeper Desktop MCP extraction | Pending |
| Organizer page frames | Pending deeper Desktop MCP extraction | Pending |
| User page frames | Desktop MCP partial | `1:55` 编辑名片, `110:3285` 点击查看-活动详情, `102:2143` 活动卡片1, plus related homepage/filter/card nodes under `102:*` |
| Auth/public frames | Pending deeper Desktop MCP extraction | Pending |
| Component library frames | Desktop MCP partial | `27:523` 保存 button instance/style, `Component 1` bottom/system bar instances |

### Color System

| Token | Figma style/variable | Value | Usage |
| --- | --- | --- | --- |
| brand primary | Desktop MCP partial | `#4D5EF8`, exposed as `var(--p-blue,#4d5ef8)` | Primary CTA, selected tags |
| brand secondary | Pending access | Pending | Secondary CTA, highlights |
| accent | Desktop MCP partial | `#E480FF`, `#C09EFF`, `#93A1FF`, `#4AD0FF`, gradients used on hot/full tags | Highlight tags |
| success | Pending access | Pending | Approved, success feedback |
| warning | Pending access | Pending | Pending/review warning |
| danger/error | Pending access | Pending | Reject/delete/error |
| text primary | Desktop MCP partial | `#262569` for activity card title; `rgba(0,0,0,0.87)` in profile form rows | Main text |
| text secondary | Desktop MCP partial | `rgba(0,0,0,0.54)` for activity card metadata | Supporting text |
| text tertiary/placeholder | Desktop MCP partial | `rgba(0,0,0,0.38)` for labels/hints | Low emphasis text |
| page background | Desktop MCP partial | `#F2F5FA` in edit-profile frame | App body |
| surface/card background | Desktop MCP partial | white at opacity `77%` for cards/panels | Cards, panels |
| input/search background | Desktop MCP partial | `rgba(255,255,255,0.9)` | Search fields, icon buttons |
| border subtle/default | Desktop MCP partial | Divider line nodes present, exact stroke pending | Dividers, cards |
| placeholder | Desktop MCP partial | `#94A3B8` | Search placeholder |
| overlay/scrim | Pending access | Pending | Modals, drawers |

### Typography

| Role | Font family | Size | Line height | Weight | Letter spacing |
| --- | --- | --- | --- | --- | --- |
| Display / large page title | Pending | Pending | Pending | Pending | Pending |
| Page title | Pending | Pending | Pending | Pending | Pending |
| Section title | Pending | Pending | Pending | Pending | Pending |
| Card title | Pending | Pending | Pending | Pending | Pending |
| Body | Pending | Pending | Pending | Pending | Pending |
| Caption | Pending | Pending | Pending | Pending | Pending |
| Button label | Pending | Pending | Pending | Pending | Pending |
| Tag label | Pending | Pending | Pending | Pending | Pending |

### Spacing, Radius, Shadow

| Category | Token | Value |
| --- | --- | --- |
| spacing scale | base unit | Pending |
| page padding mobile | `page-x-mobile` | Pending |
| page padding desktop | `page-x-desktop` | Pending |
| section gap | `section-gap` | Pending |
| card padding | `card-padding` | Pending |
| list item gap | `list-gap` | Pending |
| radius small | `radius-sm` | Pending |
| radius input | `radius-input` | Pending |
| radius card | `radius-card` | Pending |
| radius modal/drawer | `radius-overlay` | Pending |
| shadow card | `shadow-card` | Pending |
| shadow popover | `shadow-popover` | Pending |
| focus ring | `focus-ring` | Pending |

### Component Specs

| Component | States/variants to confirm | Dimensions to confirm |
| --- | --- | --- |
| Button | primary confirmed partially; secondary/ghost/outline/destructive/disabled/loading pending | Save button component `72x36`, `px 22`, `py 8`, radius `33`, primary `#4D5EF8`; sheet actions `163x44`, radius `46`; activity detail signup instance `346x52` from metadata |
| Input/Textarea/Search | default, focused, error, disabled | height, padding, radius, border, focus ring |
| Select/Segmented/Tabs | default, active, disabled | height, underline/indicator, gap |
| Card/Panel | default, selected, hover, empty/loading | radius, padding, shadow, border |
| Tag/Badge | selected and hot/activity tags confirmed partially | Selected interest tags height `24`, radius `13-25`, selected fill `#4D5EF8`, text 11px bold; activity card tags `44x24`, radius `12`; hot tag `56x24`, radius `61`, gradient `#E480FF` to `#C09EFF` |
| Modal/Dialog/Drawer | mobile filter bottom sheet confirmed partially | Bottom sheet `393x464`, top radii `24`, white background |
| Toast/Notification | success, error, loading | background, radius, spacing |
| Switch/Checkbox/Radio | on/off/disabled/focus | track, thumb, box size |
| Navigation shell | sidebar and topbar pending; mobile tabbar partially confirmed below | widths, heights, active indicator, icon size |
| Navigation | user bottom tabbar confirmed partially | `393x60`, top radii `16`, shadow `0px -2px 12.9px 2px rgba(175,226,248,0.44)`, tab slot `98x60`, icon `22-26px`, label `11px` Bold, active color `#81A2FD`, inactive `rgba(0,0,0,0.38)` |
| Activity card/list item | user list card partially confirmed | Card `345x136`, image `132x136`, card radius `16`, shadow `0px 5px 25.2px rgba(118,171,230,0.4)`, title 14px PingFang SC Heavy, metadata 11px, price/count 12px |
| Hot activity card | user home confirmed partially | `345x196`, radius `16`, title 16px Heavy white, info 11px Bold `rgba(255,255,255,0.87)`, bottom overlay to `rgba(28,32,139,0.73)`, full tag `75x24`, count badge `67x24`, count badge background `rgba(255,255,255,0.85)` |
| Search/city/filter header | user home confirmed partially | City selector `57x26`, text 12px Bold `#262569`; search `211x40`, radius `28`, placeholder 12px Medium `#94A3B8`, search icon 12; filter button `42x40`, radius `16`, icon 24 |
| Form builder fields | text, select, multi-select, phone, custom fields | row height, controls, drag states |

### Responsive Layout Specs

| Surface | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Global app shell | iPhone-like `393px` frames confirmed | Pending | Pending |
| User app max width | `393px` Figma mobile frame | Pending | Pending |
| Organizer app max width | Pending | Pending | Pending |
| Sidebar width | Pending | Pending | Pending |
| Topbar height | Pending | Pending | Pending |
| Bottom tabbar height | Pending | Pending | Pending |
| Page content width | Pending | Pending | Pending |
| Activity cover aspect ratio | Activity list item image `132x136`; detail poster `402x268`; hot card `345x196` | Pending | Pending |

## Transformation Scope

### Foundation

- Replace the current split token setup with one OpenEvent token source:
  - `tailwind.config.js`
  - `src/types/design-tokens.ts`
  - CSS custom properties in `src/index.css`
  - antd-mobile theme variables and component overrides
- Keep Tailwind v3 unless the user explicitly asks for a framework migration.
- Remove or quarantine stale comments that mention Tailwind v4 or previous "2024 design" when they are no longer true.

### UI Primitives

Primary files:

- `src/components/ui/Button`
- `src/components/ui/Input`
- `src/components/ui/Card`
- `src/components/ui/Tag`
- `src/components/ui/Modal`
- `src/components/ui/Dialog`
- `src/components/ui/Drawer`
- `src/components/ui/Checkbox`
- `src/components/ui/Switch`
- `src/components/ui/Toast`
- `src/components/ui/CitySelector`
- `src/components/ui/AuthNotification`
- `src/components/ui/Container`, `Grid`, `Stack`

Required changes:

- Align sizes, radii, typography, colors, icon sizing, loading states, disabled states, hover/focus/active states to Figma.
- Replace locally embedded SVG icons with `lucide-react` where equivalent and appropriate.
- Ensure buttons and fixed controls have stable dimensions, so text and icon state changes do not shift layout.

### Layout Shells

Primary files:

- `src/components/layout/MerchantLayout.tsx`
- `src/components/layout/MerchantDesktopSidebar.tsx`
- `src/components/layout/MerchantTopBar.tsx`
- `src/components/layout/UserLayout.tsx`
- `src/components/layout/DesktopSidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/BottomTabBar.tsx`
- `src/components/layout/Breadcrumb.tsx`

Required changes:

- Align mobile/desktop container widths, page backgrounds, sticky topbar heights, sidebar width, bottom tabbar height, safe-area behavior, active navigation states, badge sizes, avatar/logo treatments.
- Decide whether `BottomTabBar.tsx` is still used; if not, mark as legacy or remove only after confirming no references.

### Public and Auth Pages

Primary files:

- `src/pages/common/Login/index.tsx`
- `src/pages/common/Login/components/LoginForm.tsx`
- `src/pages/common/Register/index.tsx`
- `src/pages/common/Register/components/RegisterForm.tsx`
- `src/pages/common/ForgotPassword/index.tsx`
- `src/pages/common/ForgotPassword/components/ForgotPasswordForm.tsx`
- `src/components/legal/*`

Required changes:

- Rebuild page shell and form cards from Figma values.
- Remove old blue/cyan decorative background unless Figma still uses it.
- Align tab switcher, error panels, helper text, legal modals, test-account development panel.

### Shared Activity and NFC Pages

Primary files:

- `src/pages/common/ActivityDetail.tsx`
- `src/pages/common/ActivityDetailTemp.tsx`
- `src/pages/user/NFCResultPage.tsx`
- `src/pages/user/ActivityRecapPage.tsx`
- `src/components/business/ActivityPreview`
- `src/components/business/ImageCarousel`
- `src/components/business/ImageGallery`
- `src/components/business/NFCTouchModal`

Required changes:

- Align cover image behavior, action bars, public/owner states, metadata blocks, recap image grids, and NFC card states.

### User-Side Pages

Primary route pages:

- `src/pages/user/UserHome.tsx`
- `src/pages/user/UserDiscover.tsx`
- `src/pages/user/UserActivityDetail.tsx`
- `src/pages/user/UserRegistration.tsx`
- `src/pages/user/UserMatchResult.tsx`
- `src/pages/user/UserMatchDetail.tsx`
- `src/pages/user/UserProfileCards.tsx`
- `src/pages/user/UserPublicProfile.tsx`
- `src/pages/user/UserEditProfile.tsx`
- `src/pages/user/UserFieldLibrary.tsx`
- `src/pages/user/UserNotifications.tsx`
- `src/pages/user/UserSettings.tsx`
- `src/pages/user/UserFavorites.tsx`
- `src/pages/user/UserFriends.tsx`
- `src/pages/user/UserDiscoverPeople.tsx`
- `src/pages/user/UserConversations.tsx`
- `src/pages/user/UserChatRoom.tsx`
- `src/pages/user/UserActivityHistory.tsx`

Shared user/business components:

- `src/components/business/ActivityCard`
- `src/components/business/ActivityListItem`
- `src/components/business/HotActivityCarousel`
- `src/components/business/UserActivityCard`
- `src/components/business/ActivityFilterDrawer`
- `src/components/business/UserHoverCard`
- `src/features/social/*`
- `src/features/user/profile/components/PublicProfileCard.tsx`

Required changes:

- Align search headers, filters, city selector, activity cards, list rows, carousel, profile cards, social buttons, messaging, notifications, registration form, match result visual hierarchy.

### Organizer-Side Pages

Primary route pages:

- `src/pages/merchant/DashboardNew.tsx`
- `src/pages/merchant/ActivityCreateNew.tsx`
- `src/pages/merchant/ActivityEditNew.tsx`
- `src/pages/merchant/ActivityManageNew.tsx`
- `src/pages/merchant/EnrollmentManagementNew.tsx`
- `src/pages/merchant/MatchingConfig/index.tsx`
- `src/pages/merchant/NotificationsPage.tsx`
- `src/pages/merchant/ProfilePage.tsx`
- `src/pages/merchant/ProfileEditPage.tsx`
- `src/pages/merchant/TemplateListPage.tsx`
- `src/pages/merchant/HelpCenterPage.tsx`
- `src/pages/merchant/AnalyticsPage.tsx`
- `src/pages/merchant/SettingsPage.tsx`
- `src/pages/merchant/UserPoolPage.tsx`
- `src/pages/merchant/ActivityRecapEditPage.tsx`

Feature/components:

- `src/features/activities/components/*`
- `src/features/enrollment/components/*`
- `src/components/enrollment/*`
- `src/features/matching/components/*`
- `src/features/merchant/user-pool/components/*`
- `src/features/merchant/form-templates/components/*`

Required changes:

- Align dashboard stat cards, quick actions, activity management cards, create/edit forms, registration type/form builder, enrollment drawers and tables, matching rules/result panels, user-pool cards/drawers/modals, analytics cards, settings/profile pages.

### Dev Showcase

Primary files:

- `src/pages/dev/ComponentShowcase.tsx`
- `src/pages/dev/showcase/*`
- `src/pages/dev/ButtonTest.tsx`
- `src/pages/dev/TailwindTest.tsx`

Required changes:

- Update showcase after primitives are aligned so future sessions can visually verify token/component behavior.

## Proposed Execution Phases

No business-code phase should start until user approves this plan and Figma parameters are available.

1. Figma extraction and spec lock
   - Use local Figma Desktop MCP while the target file is open locally.
   - Use `get_metadata` to map pages/components.
   - Use `get_design_context` for design-system nodes and representative page components. For large pages that time out, read metadata first and then inspect smaller subnodes.
   - Fill the parameter matrix in this document.
   - Add screenshots or node ids for traceability.

2. Token foundation
   - Replace current Tailwind token values with OpenEvent values.
   - Update `src/types/design-tokens.ts` to match Tailwind exactly.
   - Add CSS variables in `src/index.css` if needed for antd-mobile and runtime styles.
   - Update antd-mobile global variables and overrides.

3. UI primitives
   - Update Button, Input/Textarea/Search, Card, Tag/Badge, Modal/Dialog/Drawer, Toast, Checkbox/Switch, CitySelector.
   - Update component showcase pages for quick visual QA.
   - Run `npm run check`.

4. Layout shells
   - Update user and organizer app shells, topbars, sidebars, bottom tabbars, breadcrumbs, content widths and safe-area behavior.
   - Verify desktop and mobile route chrome before page-specific work.

5. Public/auth pages
   - Rebuild Login/Register/ForgotPassword against Figma.
   - Update legal modal surfaces if affected.

6. User-side page migration
   - Start with shared activity components: ActivityCard, ActivityListItem, HotActivityCarousel, ActivityFilterDrawer.
   - Then migrate UserHome/UserDiscover.
   - Then activity detail, registration, matching, profile/social/messaging/notifications pages.

7. Organizer-side page migration
   - Start with shared B-side dashboard cards and forms.
   - Then DashboardNew, ActivityCreate/Edit/Manage.
   - Then EnrollmentManagement, MatchingConfig, UserPool, Profile/Settings/Analytics/Help/Templates/Notifications.

8. Visual QA and cleanup
   - Run `npm run check`.
   - Start `npm run dev:local` if integration testing is needed.
   - Capture key desktop/mobile screenshots.
   - Compare against Figma frame by frame.
   - Remove obsolete token comments and dead legacy design paths only after confirming no references.

## QA Route Matrix

Minimum route set to verify after implementation:

| Area | Route |
| --- | --- |
| Auth | `/login`, `/register`, `/forgot-password` |
| User home/discovery | `/u/home`, `/u/discover` |
| User activity flow | `/u/activities/:id`, `/u/activities/:id/register` |
| User matching/social | `/u/activities/:id/match-result`, `/u/profile`, `/u/profile/edit`, `/u/messages` |
| User utility | `/u/notifications`, `/u/settings`, `/u/favorites`, `/u/friends`, `/u/field-library` |
| Organizer dashboard | `/dashboard`, `/dashboard/activity/create` |
| Organizer activity management | `/dashboard/activity/:id/manage`, `/dashboard/activity/:id/enrollment`, `/dashboard/activity/:id/matching` |
| Organizer user/admin | `/dashboard/user-pool`, `/dashboard/analytics`, `/dashboard/settings`, `/dashboard/profile` |
| Public/NFC | `/activity/:id`, `/nfc/t/:token` |
| Showcase | `/components` |

## Progress

- [x] Created dedicated cross-session plan document.
- [x] Audited package stack and active route structure.
- [x] Audited current token entry points and design-system split.
- [x] Audited layout shells and major public/user/organizer surfaces.
- [x] Confirmed cloud/file-key Figma MCP permission blocker.
- [x] Confirmed local Figma Desktop MCP can read the currently open file.
- [ ] Continue local Desktop MCP extraction for all target frames and components.
- [ ] Fill Figma Parameter Matrix with complete concrete values and node references.
- [ ] User approves implementation plan.
- [ ] Phase 2 token foundation.
- [ ] Phase 3 UI primitives.
- [ ] Phase 4 layout shells.
- [ ] Phase 5 public/auth pages.
- [ ] Phase 6 user-side pages.
- [ ] Phase 7 organizer-side pages.
- [ ] Phase 8 QA and cleanup.

## Open Questions

- Does the Figma file contain both B-side and C-side redesigned frames, or only a shared design system plus selected screens?
- Should the old `ui_design_drafts` and `docs-private/design-system` be archived after the OpenEvent system is adopted?
- Should dark mode remain supported in the OpenEvent design, or should it be frozen/deprioritized if Figma only specifies light mode?
- Which route should be treated as the highest-priority visual benchmark: `/u/home`, `/dashboard`, `/login`, or another page?
