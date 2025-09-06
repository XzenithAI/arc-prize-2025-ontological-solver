#!/usr/bin/env python3
import json
from pathlib import Path
from modules.scroll_core import Grid, apply_scroll
from modules.patcher_nova import synthesize_scroll, eval_scroll

def main():
    P = json.loads((Path(__file__).parent / "vx_scrolls" / "sample_problems.json").read_text())
    for name, task in P.items():
        train = task["train"]
        best = synthesize_scroll(train, beam=200, depth=3)
        ok, msg = eval_scroll(best, train)
        print(f"[{name}] scroll={best}  train_ok={ok} ({msg})")
        test_in = task["test"][0]["input"]
        pred = apply_scroll(best, Grid.from_list(test_in)).to_list()
        print(f"[{name}] test_pred={pred}")

if __name__ == "__main__":
    main()
