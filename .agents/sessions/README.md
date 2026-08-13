# Sessions

Live multi-agent boards for parallel neodx work. Plans own _what_ is decided;
[workflows](../workflows/index.md) own _how_; a session owns _who is writing what
right now_.

| Session                                  | Pairing                                                              | Status board                             |
| ---------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| [parallel-s7-r2c](./parallel-s7-r2c/)    | Lane A std 1.0 ∥ Lane C depcruise — **closed** `CONFIRMED_WITH_DEBT` | [STATUS.md](./parallel-s7-r2c/STATUS.md) |
| [fs-1.0-handoff.md](./fs-1.0-handoff.md) | fs 1.0 ∥ S5-R2-b typeAware — **closed** (zero overlap)               | handoff note                             |

Later S7 1.0 slices (glob, pkg-misc, log, vfs, svg, figma) ran serially on `improve/neodx` and are
in `.changeset/*-1.0.0.md`. No live board is open. Next coordination is **push + soak**, then
publish 1.0 — see [plans/AGENTS.md](../plans/AGENTS.md).

When a session closes, keep the STATUS log as evidence; move the folder under
`archive/` only if the board is noise relative to reports.
