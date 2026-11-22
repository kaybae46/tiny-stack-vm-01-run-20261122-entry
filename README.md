# Tiny Stack VM — make.fun bounty

[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kaybae46/tiny-stack-vm-01-run-20261122-entry/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kaybae46/tiny-stack-vm-01-run-20261122-entry/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)

Entry for [make.fun's "Build a tiny stack virtual machine, 22 November 2026" bounty](https://make.fun/bounty/tiny-stack-vm-01-run-20261122) ($100 in USDC).

## What it does

`main.ts` (Node 22, no dependencies) runs every program of a set in one run: it reads `/input/<id>/program.bin` and `/input/<id>/input.bin`, executes the tiny stack ISA exactly as the reference VM defines it — wrapping 32-bit arithmetic, all ten traps with their own exit codes, the 1,000,000-step and 65,536-byte output limits — and writes `/output/<id>/stdout.bin` and `/output/<id>/exit.txt`.

Practice set: 40/40 instances match the reference VM, score 1,000,000.
