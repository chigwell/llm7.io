# Responsible Disclosure Program

**Last updated: 13 August 2026**

LLM7.io welcomes good-faith security reports from users, developers, and independent researchers. If you believe you have found a vulnerability in LLM7.io, `dash.llm7.io`, `api.llm7.io`, or another official LLM7.io service, please report it privately before sharing details publicly.

Please send reports to **[security@llm7.io](mailto:security@llm7.io)**.

This program is intended to help us receive, assess, and fix security issues responsibly. It is not a cash bug bounty program, and it does not create any entitlement to a reward, service credit, compensation, contract, or continued access.

---

## How to report

Please include as much useful detail as you reasonably can:

- The affected domain, endpoint, feature, account flow, or API behaviour.
- A clear summary of the issue and the security impact.
- Minimal steps to reproduce the issue.
- Any safe proof of concept, screenshots, request IDs, timestamps, or logs that help us verify the report.
- Whether you believe any data, account, token, billing, model-access, or rate-limit boundary may be affected.
- Your preferred contact details and whether you would like public credit if we later publish acknowledgements.

Please avoid sending unrelated sensitive data. If your report necessarily includes sensitive information, keep it to the minimum needed to explain the issue.

---

## Good-faith testing

To keep testing constructive and low risk, please:

- Test only with accounts, API tokens, subscriptions, and data that you own or are authorised to use.
- Stop testing once you have enough evidence to demonstrate the issue.
- Do not access, modify, copy, delete, disclose, or retain data that does not belong to you.
- Do not degrade, interrupt, overload, or attempt denial-of-service testing against the service.
- Do not use spam, social engineering, phishing, malware, credential stuffing, stolen credentials, payment abuse, or physical attacks.
- Avoid high-volume automated scanning unless we have agreed to it in advance.
- Give us a reasonable opportunity to investigate and address the issue before public disclosure.
- Follow the LLM7.io Terms of Service and applicable law while testing and reporting.

If you accidentally access data that is not yours, please stop immediately, do not save or share it, and include only the minimum necessary detail in your report.

---

## Examples of in-scope issues

Security issues that may be useful to report include:

- Authentication, session, or API token flaws.
- Access-control bypasses affecting accounts, subscriptions, usage allowance, or administrative functions.
- Unauthorised access to another user's data, account state, tokens, billing state, usage counters, or private service metadata.
- Server-side vulnerabilities in official LLM7.io services or public endpoints.
- Sensitive information disclosure.
- Bugs that could meaningfully bypass security controls, paid-access controls, abuse-prevention controls, or model-access boundaries.
- Vulnerabilities that could materially affect the confidentiality, integrity, or availability of LLM7.io systems.

---

## Usually out of scope

The following are usually not eligible unless they demonstrate a clear, practical security impact:

- Automated scanner output without verified exploitability or impact.
- Reports about missing headers, cookie attributes, or configuration preferences without a concrete attack path.
- Self-XSS, clickjacking, logout CSRF, or UI-only issues with no meaningful security consequence.
- Rate-limit complaints, quota behaviour, model availability, model output quality, or prompt-injection examples that do not cross a real security boundary.
- Vulnerabilities that require a compromised device, compromised email account, malicious browser extension, outdated browser, or stolen credentials.
- Social engineering, spam, physical security, denial-of-service, or excessive traffic tests.
- Issues only affecting third-party model providers, infrastructure providers, or external services unless they create a direct LLM7.io security impact.
- Duplicate reports, previously known issues, speculative reports, or reports that cannot be reproduced with the information provided.

---

## Review and remediation

We review reports case by case. We may ask for more information, combine duplicate reports, close reports that are out of scope, or decline reports that do not demonstrate a meaningful security impact.

We prioritise issues based on severity, exploitability, affected users or systems, data sensitivity, operational risk, and the quality of the report. We may take temporary protective action while an issue is being investigated.

---

## Potential recognition

Confirmed, meaningful vulnerabilities may be eligible for discretionary, non-cash recognition. When we decide to recognise a report, recognition may take the form of temporary **LLM7.io Pro** subscription access, which includes higher inference rate limits and a larger allowance for supported state-of-the-art LLM models, subject to model availability, service capacity, fair-use controls, and the current Pro plan terms.

As a general reference only, eligible recognition may range from around **one month of Pro access** for a confirmed lower-risk vulnerability to up to **six months of Pro access** for an exceptional vulnerability that we verify as service-breaking or severely compromising security.

These examples are not fixed tiers, minimums, guarantees, or promises of payment or service. Eligibility, duration, and availability are decided at our discretion and may depend on severity, novelty, report quality, reproducibility, remediation value, whether the issue was already known, whether the report followed this program, and whether the testing caused risk or disruption.

Recognition has no cash value, is not transferable, cannot be sold or exchanged, cannot be redeemed for money, and may require an LLM7.io account in good standing.

---

## Contact

Security reports: **[security@llm7.io](mailto:security@llm7.io)**

General support: **[support@llm7.io](mailto:support@llm7.io)**
