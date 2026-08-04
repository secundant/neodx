# Security Policy

## Supported versions

neodx publishes `@neodx/*` packages on npm. Security fixes land on the latest release line of each
package. Older major/minor lines are not guaranteed to receive backports.

Supported contributor / CI runtime: **Node.js 22+** (see root `package.json` `engines`).

## Reporting a vulnerability

Please report security issues privately:

1. Use [GitHub Security Advisories](https://github.com/secundant/neodx/security/advisories/new) for
   this repository, **or**
2. Email the maintainer listed in the root `package.json` `author` field.

Do **not** open a public GitHub issue for an unfixed vulnerability.

Include: affected package + version, impact, reproduction steps, and any known mitigations.

## Response expectations

- Acknowledgement within a few business days when possible.
- A fix, mitigation, or explicit “won’t fix” with rationale once triage completes.
- Coordinated disclosure preferred; please allow time to ship a patch before public detail.

## Supply chain notes

- Releases go through Changesets on GitHub Actions (`.github/workflows/release.yaml`).
- Prefer npm provenance / trusted publishing when configured on the npm side (see CONTRIBUTING /
  release workflow). Treat a missing provenance attestation as a process gap, not silence.
