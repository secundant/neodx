# Maintaining neodx

Operations that land packages on npm. Contributors: [`CONTRIBUTING.md`](./CONTRIBUTING.md).
Policy: [`SEMVER.md`](./SEMVER.md). Advisories: [`SECURITY.md`](./SECURITY.md).

Do not put tokens, OTPs, or secret values in git, issues, or this file.

## Release flow

Push to `main` runs [`.github/workflows/release.yaml`](./.github/workflows/release.yaml)
(`changesets/action` → `yarn pack:libs && yarn changeset publish`).

1. Merge a PR that includes Changesets.
2. Release opens a **Version Packages** PR, or publishes if git is already ahead of npm.
3. Merge that PR (merge commit unless the owner names squash). That second push publishes.

Version Packages PRs opened by `GITHUB_TOKEN` often have no `check` / `e2e-svg` runs. Expected.

Publishable: `@neodx/std`, `colors`, `fs`, `glob`, `pkg-misc`, `log`, `vfs`, `svg`, `figma`.
Private packages stay unpublished.

## npm publish auth

Release already has `id-token: write`, installs npm ≥ 11.15, and sets
`NPM_CONFIG_PROVENANCE=true`. It does **not** pass `NPM_TOKEN`.

Confirm account 2FA before debugging tokens: `npm profile get tfa` must not be `false`.
[Configuring 2FA](https://docs.npmjs.com/configuring-two-factor-authentication/) — website
Account settings, or `npm profile enable-2fa auth-and-writes` in a real TTY.

| Symptom                          | Cause                                                 | Escape                                                             |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `E403` on `npm trust` / settings | Account 2FA off, or session is legacy/GAT             | Enable 2FA, then web login (not `--auth-type=legacy`)              |
| `E403` on CI `PUT`               | GitHub secret is a write token **without** bypass 2FA | Replace the secret with a GAT that has **Bypass 2FA**, or use OIDC |
| `E404` on CI `PUT`               | Secret missing, expired, or not on `@neodx`           | Replace the secret                                                 |

`npm login --auth-type=legacy` cannot configure trust. GAT bypass tokens cannot either
([npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/)).
`--namespace=@neodx` only sets the publish scope; it does not change 2FA.

### Preferred: trusted publishers (after 2FA is on)

[Trusted publishers](https://docs.npmjs.com/trusted-publishers/). First call in a **TTY** so the
browser 2FA page can open. Omit `-y` on that first call. Check **skip 2FA for the next 5 minutes**,
then loop the rest:

```shell
npx -y -p npm@^11.15.0 npm trust github @neodx/std \
  --repo secundant/neodx --file release.yaml --allow-publish

for pkg in colors fs glob pkg-misc log vfs svg figma; do
  npx -y -p npm@^11.15.0 npm trust github "@neodx/$pkg" \
    --repo secundant/neodx --file release.yaml --allow-publish -y
  sleep 2
done
```

The Release workflow must not set `NPM_TOKEN`. `changesets/action` would write it to `.npmrc`
and npm would use the 2FA token path instead of OIDC. Keep `id-token: write`.

### Stopgap: bypass-2FA GAT (publish only, not trust)

If a package has no trusted publisher yet, a granular token with **Read and write** and
**Bypass 2FA** can still publish until npm drops that path (~January 2027). Do not `npm login`
over it — a session token shadows the GAT ([npm/cli#9268](https://github.com/npm/cli/issues/9268)).
Do not put that token back into Release once OIDC is live.

### Retry

```shell
gh run list --branch main --workflow Release --limit 5
gh run rerun <run-id>
gh run watch <run-id>
```

Do not invent a new version bump. Confirm with `npm view @neodx/<pkg> version`. Missing provenance
after a successful publish is a process gap ([`SECURITY.md`](./SECURITY.md)).

## New publishable package

Enable trust with the same `npm trust github` line before the first Release that would publish it.
Keep it out of Changesets `ignore` unless it is meant to stay private.
