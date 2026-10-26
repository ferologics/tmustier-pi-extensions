# Changelog

## 0.1.3 - 2026-10-26
- Simplify the skill to mechanism selection, installed documentation and the public-extension check before a core patch.
- Cover existing settings/packages, MCP, CLI/RPC/SDK integration and the distinction between packages and runtime mechanisms.
- Remove generic authoring guidance.
- Retire the nested skill-creator skill, its validator and tests, and remove its package manifest entries.

## 0.1.2 - 2026-05-13
- Refresh guidance for current Pi extension architecture: extensions can be single TypeScript files or packaged resources, with `package.json`/`pi` manifests for sharing.
- Add an explicit "extend first, patch last" audit workflow requiring docs, examples, and installed types/source review before considering Pi internal patches.
- Broaden the skill trigger to cover any request to modify Pi behavior.
- Rename skill terminology to Agent Skills and pick up `skill-creator@0.3.2`.

## 0.1.1 - 2026-04-19
- Pick up `skill-creator@0.3.1`: self-contained `validate_skill.py` via PEP 723 + `uv run` (no more system PyYAML requirement). Thanks to @tekumara for reporting ([#20](https://github.com/tmustier/pi-extensions/issues/20)).

## 0.1.0 - 2026-02-05
- Initial release: decision table for skill vs extension vs prompt template vs theme vs context file vs custom model vs package.
- Nested skill-creator sub-skill for detailed skill creation guidance.
