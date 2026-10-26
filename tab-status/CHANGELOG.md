# Changelog

## [0.1.6] - 2026-10-26

### Fixed
- Ignore a stale extension context after session replacement. Pi can deliver a late `agent_settled` event to the replaced session, for example after a plan-mode handoff starts a fresh session, and updating the tab title from it raised an extension error.

Thanks to @schadin for the fix and regression test ([#113](https://github.com/tmustier/pi-extensions/pull/113)).

## [0.1.5] - 2026-09-22

### Changed
- Update tab state from Pi 0.87's final agent settlement, preserving commit detection across automatic retries and queued continuations.
- Use `session_start` reasons for new and resumed session titles.

## [0.1.4] - 2026-05-07

### Changed
- Declare the `@earendil-works` Pi peer and development dependencies used by runtime imports.
- Update Pi extension imports to the new `@earendil-works` namespace.

## 0.1.3 - 2026-02-03
- Add preview image metadata for the extension listing.

## 0.1.2 - 2026-01-26
- Added note clarifying one active session per tab is tracked.

## 0.1.0 - 2026-01-13
- Initial release.
