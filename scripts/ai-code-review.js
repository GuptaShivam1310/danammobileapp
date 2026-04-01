const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require("child_process");
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const PROJECT_ID = process.env.CI_PROJECT_ID;
const MR_IID = process.env.CI_MERGE_REQUEST_IID;
const TARGET_BRANCH = process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME || 'main';

async function run() {
  console.log("Starting AI Code Review...");
  
  if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set.");
    console.error("TIP: If you've added it to GitLab CI/CD variables, ensure 'Protect variable' is UNCHECKED for feature branches.");
    process.exit(1);
  }
  if (!GITLAB_TOKEN || !PROJECT_ID || !MR_IID) {
    console.log("Not running in a Merge Request environment or missing GitLab credentials. Skipping review.");
    return;
  }

  try {
    const gitlabUrl = process.env.CI_API_V4_URL || 'https://gitlab.com/api/v4';
    const headers = { "PRIVATE-TOKEN": GITLAB_TOKEN };

    // Get diff
    console.log(`Fetching diff against ${TARGET_BRANCH}...`);
    
    try {
      // Ensure we have the target branch
      execSync(`git fetch origin ${TARGET_BRANCH} --depth=1000`);
    } catch (e) {
      console.log("Standard fetch failed, trying simple fetch...");
      execSync(`git fetch origin ${TARGET_BRANCH}`);
    }

    let diff;
    try {
      // Use three-dot diff to get changes in HEAD since it diverged from TARGET_BRANCH
      // Using origin/${TARGET_BRANCH} or FETCH_HEAD
      diff = execSync(`git diff origin/${TARGET_BRANCH}...HEAD`).toString();
    } catch (e) {
      console.error("Three-dot diff failed, attempting two-dot diff as fallback...");
      try {
        diff = execSync(`git diff origin/${TARGET_BRANCH} HEAD`).toString();
      } catch (innerError) {
        console.error("All diff attempts failed.");
        throw innerError;
      }
    }

    if (!diff || diff.trim().length === 0) {
      console.log("No changes detected between current branch and target branch.");
      return;
    }

    console.log(`Diff fetched. Size: ${diff.length} characters.`);

    // 1. Find existing issue for this MR
    console.log("Checking for existing AI review issues...");
    const issueTitle = `🤖 AI Detected Issues in MR !${MR_IID}`;
    const { data: existingIssues } = await axios.get(
      `${gitlabUrl}/projects/${PROJECT_ID}/issues?search=${encodeURIComponent(issueTitle)}&state=opened`,
      { headers }
    );

    let previousContext = "No previous issues recorded.";
    let existingIssue = existingIssues.length > 0 ? existingIssues[0] : null;

    if (existingIssue) {
      previousContext = `Existing issues found in previous run:\n${existingIssue.description}`;
    }
    const prompt = `
      You are an expert Senior React Native Developer. 
      Analyze the current code DIFF against the main branch AND the PREVIOUS ISSUES provided.
      
      PREVIOUS ISSUES CONTEXT:
      ${previousContext}

      CURRENT CODE DIFF:
      \`\`\`diff
      ${diff}
      \`\`\`

      CRITICAL INSTRUCTION:
      1. Identify which of the PREVIOUS ISSUES are now FIXED/RESOLVED in the current diff.
      2. Identify any BRAND NEW genuine bugs, crashes, or regressions.
      3. Focus ONLY on genuine logic issues, NOT stylistic nitpicks.

      YOU MUST RESPOND ONLY WITH A VALID JSON OBJECT in this format:
      {
        "resolved_issues": [{"id": "short_unique_id", "title": "brief title", "evidence": "why it is resolved"}],
        "new_issues": [{"id": "short_unique_id", "title": "brief description", "details": "why it is a bug"}],
        "still_pending_issues": [{"id": "id_from_prev", "title": "title", "details": "why it remains"}]
      }
      If no issues exist at all, return empty arrays.
    `;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const modelsToTry = [
      "models/gemini-2.0-flash",
      "models/gemini-2.5-flash-lite",
      "models/gemini-1.5-flash-8b",
      "models/gemini-1.5-pro",
      "models/gemini-3.1-flash-lite",
      "models/gemini-3-flash"
    ];
    let aiResponse;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const tempModel = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { responseMimeType: "application/json" } 
        });
        const result = await tempModel.generateContent(prompt);
        aiResponse = JSON.parse(result.response.text());
        console.log(`Successfully used ${modelName}`);
        break; 
      } catch (err) {
        console.warn(`${modelName} failed: ${err.message}`);
        if ((err.message.includes("429") || err.message.includes("404")) && modelName !== modelsToTry[modelsToTry.length - 1]) continue;
        if (modelName === modelsToTry[modelsToTry.length - 1]) throw err;
      }
    }

    const { resolved_issues, new_issues, still_pending_issues } = aiResponse;
    const totalPending = new_issues.length + still_pending_issues.length;

    // 2. Format the Issue Description
    let newDescription = `## 🤖 AI Code Review Status for MR !${MR_IID}\n\n`;
    
    if (resolved_issues.length > 0) {
      newDescription += `### ✅ Resolved Issues\n`;
      resolved_issues.forEach(i => newDescription += `- ~~${i.title}~~ (Fixed: ${i.evidence})\n`);
      newDescription += `\n`;
    }

    if (still_pending_issues.length > 0) {
      newDescription += `### ⚠️ Pending Issues\n`;
      still_pending_issues.forEach(i => newDescription += `- ${i.title}: ${i.details}\n`);
      newDescription += `\n`;
    }

    if (new_issues.length > 0) {
      newDescription += `### 🚨 New Issues Added\n`;
      new_issues.forEach(i => newDescription += `- **${i.title}**: ${i.details}\n`);
      newDescription += `\n`;
    }

    if (totalPending === 0) {
      newDescription += `\n🎉 **All issues resolved!**`;
    }

    // 3. Create or Update GitLab Issue
    if (existingIssue) {
      console.log(`Updating existing issue #${existingIssue.iid}...`);
      await axios.put(`${gitlabUrl}/projects/${PROJECT_ID}/issues/${existingIssue.iid}`, 
        { description: newDescription }, { headers });
    } else if (totalPending > 0) {
      console.log("Creating new issue...");
      const { data: createdIssue } = await axios.post(`${gitlabUrl}/projects/${PROJECT_ID}/issues`, { 
        title: issueTitle,
        description: newDescription,
        labels: "AI-Review, blocker, issue"
      }, { headers });
      existingIssue = createdIssue;
    }

    // 4. Update MR Comment
    const summaryComment = `### 🤖 AI Review Summary
- **${resolved_issues.length}** Issues resolved
- **${new_issues.length}** New issues added
- **${totalPending}** Issues Pending

[View detailed AI Issue](${existingIssue ? existingIssue.web_url : '#'})

${totalPending > 0 ? '❌ **Merging is blocked until these issues are resolved.**' : '✅ **No blocking issues found.**'}`;

    await axios.post(`${gitlabUrl}/projects/${PROJECT_ID}/merge_requests/${MR_IID}/notes`, 
      { body: summaryComment }, { headers });

    if (totalPending > 0) {
      console.log(`Found ${totalPending} pending issues. Blocking merge.`);
      process.exit(1);
    }

    console.log("AI review passed successfully.");
  } catch (error) {
    console.error("Error during AI review:", error.response?.data || error.message);
    // Don't fail the build if AI review fails
    process.exit(0);
  }
}

run();
