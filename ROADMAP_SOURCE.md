# Roadmap source

The 10 phases and 200 problems in `backend/src/scripts/seed-data.json` are transcribed from the supplied `200 LeetCode Roadmap Phase1to10` PDF. Each record includes the PDF's serial number (`roadmapOrder`), LeetCode problem number (`leetcodeId`), title, difficulty and pattern label. URLs are generated from each problem title's LeetCode slug; verify individual links during QA before public launch.

Run `npm run seed -w backend` after configuring the backend environment to upsert by phase/order, retaining existing problem document IDs for matching records.
