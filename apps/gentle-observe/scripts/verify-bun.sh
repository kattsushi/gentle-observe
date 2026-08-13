#!/bin/sh

required_version="1.3.14"

if ! command -v bun >/dev/null 2>&1; then
  printf '%s\n' "Bun ${required_version} is required, but Bun was not found in PATH." >&2
  exit 1
fi

actual_version="$(bun --version)"

if [ "${actual_version}" != "${required_version}" ]; then
  printf '%s\n' "Bun ${required_version} is required, but found Bun ${actual_version}." >&2
  exit 1
fi
