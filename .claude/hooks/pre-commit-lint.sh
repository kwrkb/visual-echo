#!/bin/bash

# PreToolUse hook: git commit 前に npm run lint を自動実行する
# git commit を含む Bash コマンドのみを対象とする

COMMAND=$(jq -r '.tool_input.command // empty')

# git commit を含むコマンドを対象とする（cd && git commit 等にも対応）
if [[ ! "$COMMAND" =~ git\ commit ]]; then
  exit 0
fi

# lint 実行
if [[ -z "$CLAUDE_PROJECT_DIR" ]] || ! cd "$CLAUDE_PROJECT_DIR"; then
  echo "Error: CLAUDE_PROJECT_DIR が未設定または移動できません" >&2
  exit 1
fi
if ! LINT_OUTPUT=$(npm run lint 2>&1); then
  echo "$LINT_OUTPUT" >&2
  cat <<HOOK_JSON
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "npm run lint が失敗しました。lintエラーを修正してからコミットしてください。"
  }
}
HOOK_JSON
  exit 0
fi

exit 0
