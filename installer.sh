#!/usr/bin/env bash
# Automatically installs XCTasteful.
# This script was designed for usage in CI systems.

git clone --depth 1 https://github.com/thislooksfun/XCTasteful.git ~/.xctasteful
export XCTASTEFUL_ROOT="$HOME/.xctasteful"
export PATH="$XCTASTEFUL_ROOT/bin:$PATH"