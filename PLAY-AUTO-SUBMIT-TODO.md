# TODO — Auto-submit the Android build to Google Play (EAS Submit)

**Status:** Deferred (decided 2026-06-21). The current pipeline is **build-only** — the
`Android AAB (EAS)` workflow produces the `.aab` as a downloadable artifact and you upload it to
Play Console by hand. This doc is the turnkey plan for when you want CI to publish it automatically.

**Goal:** after the AAB builds on EAS, push it to a Play track (internal → … → production) with
`eas submit`, instead of downloading + uploading manually.

---

## Prerequisites (the real blockers — do these first)

1. **App created in Play Console + first AAB uploaded *manually* once.** Google rejects Play
   Developer API uploads until the app has had at least one manual release. Use the artifact from
   the current build-only workflow for that first upload.
2. **A Google Cloud service account** with the *Google Play Android Developer API* enabled, invited
   into Play Console (**Users & permissions** → add the service-account email → grant release
   permission for this app), with its **JSON key** downloaded. Step-by-step:
   <https://github.com/expo/fyi/blob/main/creating-google-service-account.md>
3. Decide where the key lives (see "Where the service-account key goes" below).

## Implementation steps

### 1. `eas.json` — add an Android submit profile
The `submit.production` block is already present (empty). Fill it in:

```jsonc
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-play-key.json",  // only if using the file-based option
      "track": "internal",          // internal | alpha | beta | production — start with internal
      "releaseStatus": "draft"      // draft (review in console) | completed (auto-publish)
    }
  }
}
```
Start conservative: `track: internal` + `releaseStatus: draft`, then promote in the console. Bump to
`track: production` / `releaseStatus: completed` once you trust the flow.

### 2. Where the service-account key goes — pick one

- **(Preferred) Let EAS hold the key**, the same way it already holds your Android *upload keystore*.
  Run `eas credentials` (Android → submission/service-account) or set it on the Expo dashboard once.
  Then CI needs **nothing extra** — no JSON in GitHub, no `serviceAccountKeyPath`. Verify EAS still
  supports server-side submit credentials when you pick this up; if so, this is the cleanest.

- **(Alternative) JSON as a GitHub secret.** Store the key **base64-encoded** as a secret (e.g.
  `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`) and decode it to the `serviceAccountKeyPath` at runtime. Keep
  the path **gitignored** and delete it after.

### 3. Workflow — pick one shape

- **Option A — separate submit step** in `.github/workflows/android-build.yml` after the build
  (lets you re-submit an existing build without rebuilding):
  ```yaml
  - name: Write Play service-account key      # only for the GitHub-secret option
    run: echo "${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}" | base64 -d > google-play-key.json
  - name: Submit latest build to Play
    run: eas submit -p android --profile production --latest --non-interactive
  - name: Shred the key
    if: always()
    run: rm -f google-play-key.json
  ```
- **Option B — combined build + submit** in one command:
  ```yaml
  - run: eas build -p android --profile production --auto-submit --non-interactive
  ```
  (`--auto-submit` submits right after the build; the key must be in place before this step.)

Add a `workflow_dispatch` input like `submit: true|false` (or a dedicated **"Release to Play"**
workflow) so *building* and *publishing* stay independently gated — you rarely want every build to
publish.

### 4. `.gitignore`
If you go file-based, add `google-play-key.json` (or a `secrets/` dir) so the decoded key can never
be committed.

## Decisions to make when you pick this up
- **Track:** internal first (recommended) → promote manually, vs straight to production.
- **releaseStatus:** `draft` (gate in console) vs `completed` (auto-publish to the track).
- **Combined `--auto-submit` vs a separate submit job** (separate = re-submit without rebuild).
- **Staged rollout %** for production.

## Security
The service-account JSON is a **Play publishing credential** — treat it like the keystore. Never
commit it; if you must put it in GitHub, store it base64 as a secret, decode to a gitignored path at
runtime, and `rm` it in an `if: always()` step. Use a **dedicated, least-privilege** service account
(only this app, only release perms) and rotate it if it ever leaks. The EAS-managed option avoids
having the raw key in CI at all.

## References
- Submit to Google Play — <https://docs.expo.dev/submit/android/>
- Configure EAS Submit with `eas.json` — <https://docs.expo.dev/submit/eas-json/>
- Create a Google Service Account — <https://github.com/expo/fyi/blob/main/creating-google-service-account.md>
