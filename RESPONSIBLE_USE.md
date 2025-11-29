# RESPONSIBLE USE GUIDELINES

BotBrowser is a dual-use research platform. These guidelines clarify the expectations for anyone who accesses binaries, profiles, or source artifacts.

## REQUIRED CONDITIONS

- **AUTHORIZATION:** Operate the software only on systems you own or have written permission to test. Maintain signed approvals or tickets for auditing.
- **CONTROLLED ENVIRONMENTS:** Prefer testbeds, sandboxes, or clearly documented demo endpoints. Production services require explicit opt-in from the owner.
- **SYNTHETIC DATA ONLY:** Use fake credentials, generated identities, or anonymized datasets. Never process personal data or live customer accounts.
- **LEGAL COMPLIANCE:** Follow all applicable laws (e.g., CFAA, GDPR, CCPA) and institutional policies. When uncertain, consult qualified legal counsel before proceeding.
- **ETHICS REVIEW:** Obtain IRB or equivalent ethics clearance whenever research involves user-impacting systems or data collection.

## PROHIBITED ACTIVITIES

- Circumventing anti-abuse or automated detection mechanisms on production services without consent.
- Harvesting personal data, account credentials, session tokens, or payment information.
- Providing the software to third parties who intend to violate laws or service terms.
- Using BotBrowser outputs to enable fraud, spam, scalping, automated ticket purchasing, or other abusive automation.

## RESPONSIBLE DISCLOSURE & COOPERATION

- **ABUSE REPORTING:** Service operators or security vendors can contact the maintainers at [botbrowser@bk.ru](mailto:botbrowser@bk.ru). Include evidence (timestamps, IPs, scripts) so investigations can begin immediately.
- **LICENSE REVOCATION:** Maintainers may revoke access to binaries or profiles for any breach of these rules.
- **VENDOR COLLABORATION:** We coordinate with bot-detection providers to share indicators of compromise and mitigate ongoing abuse.
- **TESTING REPORTS:** Qualified vendors who need additional visibility into BotBrowser evaluations may request redacted test reports or joint review calls after verifying ownership of the affected property.

## PUBLICATION & SHARING

- When publishing research, clearly state the defensive or analytical objective. Do not release step-by-step bypass instructions or targeting details.
- Redact sensitive partner data from papers, blog posts, talks, and sample code.
- Respect third-party disclosure timelines and embargo agreements.

## SECURITY HYGIENE

- Store profiles and binaries in secured locations with restricted access.
- Rotate proxy credentials and other secrets used in experiments.
- Update promptly to the latest BotBrowser release to obtain security fixes and policy updates.

By continuing to use BotBrowser you acknowledge and accept these requirements in addition to the project [Legal Disclaimer](DISCLAIMER.md). Contact the maintainers with any questions before you proceed.
