---
Task ID: 1
Agent: Main
Task: Clone repo, fix 3 bugs in IT Management project

Work Log:
- Cloned repo from https://github.com/chanhphangemini-tech/it_management.git to /home/z/it_management/
- Copied all source files (components, API routes, prisma schema, layout, page) to /home/z/my-project/
- Installed dependencies, generated Prisma client, pushed DB schema, seeded data
- **Fix 1: Dialog too small** - Changed `max-w-7xl` to `sm:max-w-7xl` in Case Detail Dialog to override the base `sm:max-w-lg` from DialogContent component
- **Fix 2: Việt hóa categories** - Updated seed data to use Vietnamese category names, added `getCategoryName()` helper function, added category badge display to worklog cards
- **Fix 3: Worklog fetch error** - Added seeding for `worklogs` table (Worklog model) in addition to existing `work_logs` table (WorkLog model). The API reads from `worklogs` but seed only populated `work_logs`
- Verified all APIs working, lint passing

Stage Summary:
- All 3 bugs fixed
- Dialog now properly fills 95% viewport width on sm+ screens
- Categories display in Vietnamese throughout the app
- Worklogs API returns data successfully, "Failed to fetch" error resolved
