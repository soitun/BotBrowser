
# 🔬 BotBrowser Research Test Suite

Academic research framework for browser‑compatibility analysis.

Demonstrates controlled browser‑compatibility research using [Playwright](https://playwright.dev/docs/writing-tests) for academic and security research purposes. Operate these scripts in accordance with the project [Legal Disclaimer](../DISCLAIMER.md) and [Responsible Use Guidelines](../RESPONSIBLE_USE.md). If you ever observe misuse, email [botbrowser@bk.ru](mailto:botbrowser@bk.ru) so we can follow up with the affected service.

## Research Environment Setup

All tests utilize **controlled network environments** with appropriate proxy configurations for academic analysis. Testing should be conducted through authorized institutional networks.

---

## Usage Context

These materials target university labs, security research groups, and other approved testing programs. Typical scenarios include:
- Browser compatibility studies comparing multiple detection vendors
- Academic coursework or workshops supervised by faculty
- Security benchmarking in dedicated staging environments
- Authorized penetration testing with written approval

Out-of-scope uses include production attacks, terms-of-service violations, or handling real customer data. When in doubt, obtain written permission and institutional ethics review (IRB or equivalent) before running any scenario.

### Test Data Policy

**All Test Scripts Use Only Synthetic/Invalid Data:**
- Random/generated usernames (not real accounts)
- Fake SSNs (e.g., "6789," which is obviously invalid)
- Non-existent email addresses
- Invalid credentials that will never authenticate
- Test endpoints and demo environments

**Never Use:**
- ❌ Real user accounts or credentials
- ❌ Valid personal information (SSN, DOB, etc.)
- ❌ Stolen or leaked credentials
- ❌ Production API endpoints without authorization

---

## 🔧 Getting Started

### Step 1: Research Environment Setup

Create a `.env` file in the project root with your configuration:

```bash
BOTBROWSER_EXEC_PATH=/absolute/path/to/botbrowser
BOT_PROFILE_PATH=/absolute/path/to/profile.enc
```

**Example Configuration:**
```bash
BOTBROWSER_EXEC_PATH=/usr/local/bin/chromium
BOT_PROFILE_PATH=/home/user/profiles/profile.enc
```

**Required Configuration:**
- `BOTBROWSER_EXEC_PATH` → BotBrowser executable
- `BOT_PROFILE_PATH` → Profile file (.enc file)

### Step 2: Install & Run Research Suite

```bash
# Install dependencies
npm install

# Run tests
npx playwright test

# Generate analysis report
npx playwright show-report
```

---

## 📝 Research Methodology

**Purpose:** Controlled compatibility‑analysis scripts for academic study.

**Framework:** All studies must be conducted within authorized environments that comply with institutional ethics guidelines, applicable laws, and protocols.

**Data Collection:** Collected only from publicly accessible testing interfaces and demonstration sites under controlled, non‑production conditions.

⚠️ **Important:** Results from these tests must not be interpreted as instructions for bypassing production systems or circumventing security measures.

### Ethical Testing Guidelines

Before running any tests, ensure you meet ALL of these requirements:

1. ✅ **Authorization:** You own the system OR have explicit written permission
2. ✅ **Test Environment:** Using test/demo endpoints, not production systems
3. ✅ **Synthetic Data:** No real user data or valid credentials
4. ✅ **Legal Compliance:** Full compliance with applicable laws (CFAA, GDPR, etc.)
5. ✅ **Terms of Service:** Not violating any website ToS
6. ✅ **Academic Purpose:** Results used solely for research/education

**If you cannot check ALL boxes above, DO NOT proceed with testing.**

### Financial Services Testing: Special Notice

Tests involving financial institutions (e.g., `threatmetrix.spec.ts` with Vanguard/Fidelity):
- ⚠️ Use ONLY publicly accessible "forgot password" or demo pages
- ⚠️ Submit ONLY invalid/synthetic data (fake names, obviously invalid SSNs)
- ⚠️ Do NOT attempt actual authentication or account access
- ⚠️ Intended to demonstrate fingerprinting behavior in research context
- ⚠️ Production testing requires explicit written authorization from the institution

### Research Environment Troubleshooting

| Issue | Solution |
|-------|----------|
| 🛑 Network access restrictions | 🔄 Use authorized institutional network infrastructure |
| ❌ Tests failing | ✅ Verify `.env` file paths and profile compatibility |
| 🐛 Browser environment issues | 🔧 Check BotBrowser executable permissions and research environment setup |

## 📖 Academic Resources

- [Playwright Documentation](https://playwright.dev/docs/writing-tests)
- [BotBrowser Profile Configs](https://github.com/botswin/BotBrowser/blob/main/profiles/PROFILE_CONFIGS.md)
- [Test Results & Reports](./test-results/)
- [ACM Code of Ethics](https://www.acm.org/code-of-ethics)

## 🙏 Research Dependencies

This project uses the following open-source libraries:

| Package | Purpose |
|---------|---------|
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |
| [ghost-cursor](https://www.npmjs.com/package/ghost-cursor) | Natural interaction simulation |
| [ghost-cursor-playwright](https://www.npmjs.com/package/ghost-cursor-playwright) | Playwright integration for realistic interactions |

**Ethics Notice:** Libraries are used solely for academic purposes under controlled conditions with proper institutional oversight.

---

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint-consistency testing and research only.
