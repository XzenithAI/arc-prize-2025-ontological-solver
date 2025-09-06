# ARC Prize 2025: Scroll-Aligned Symbolic Reasoning System

## Overview
This repository provides a fully-deployable, symbolic AI reasoning system for the ARC Prize 2025. Unlike machine‑learning approaches, our solver operates by synthesizing and executing human‑readable "scroll" programs that transform input grids into desired outputs. This design ensures transparency, determinism, and reproducibility.

## Why Scroll Logic?
Most ARC solvers rely on neural networks or statistical heuristics. These models often lack interpretability and may overfit patterns rather than reasoning about structure. In contrast, our system uses **scrolls**—JSON/YAML sequences of symbolic operations (e.g. rotate, flip, transpose, recolor)—to capture the explicit transformation needed to map inputs to outputs. This approach aligns with ARC's focus on compositional reasoning and small descriptions.

## VX-MIND: Symbolic Mapping
`VX‑MIND` parses ARC tasks into abstract representations. It identifies objects, colors, connectivity, and palette mappings. It then proposes candidate scroll programs to transform the input into the target output.

## VX-NOVA: Program Synthesis and Patching
`VX‑NOVA` implements a deterministic beam search over a library of primitive operations. It scores candidate scrolls based on exact matches and palette similarity, and returns the best scroll that fits the training pairs. If the initial guess fails, VX‑NOVA patches the scroll by exploring longer compositions, ensuring a solution if one exists within the DSL.

## Sovereignty and Interpretability
This system is **not** a GPT derivative, nor does it use transformers or hidden weights. Every operation is explicitly defined, and every scroll is recorded as a sequence of simple steps with full provenance. This sovereignty ensures the model does not depend on external datasets or black‑box models. All tasks are solved through symbolic reasoning alone.

## Repository Structure

- `requirements.txt` — Python dependencies (numpy, pyyaml, tqdm, jupyter)
- `modules/scroll_core.py` — core grid data structure and primitive operations (ROT90, FLIP, TRANSPOSE, REMAP) and scroll executor
- `modules/patcher_nova.py` — symbolic synthesizer (VX‑NOVA) that searches for scroll programs to solve training pairs
- `vx_os/VX_OS_Core.py` — optional runtime for executing scrolls outside of notebooks
- `vx_scrolls/sample_problems.json` — example ARC‑style tasks used in the notebook demonstration
- `vx_scrolls/scrolls_meta.yaml` — example hand-authored scroll solutions
- `vx_scrolls/config.yaml` — runtime configuration (e.g. connectivity)
- `notebooks/arc_solver.ipynb` — Jupyter notebook demonstrating full pipeline: load problems, synthesize scroll, execute, and evaluate
- `LICENSE` — MIT license

## Quick Start

```
python -m venv .venv
source .venv/bin/activate  # On Windows: .\\.venv\\Scripts\\activate
pip install -r requirements.txt
python run_demo.py
```

Or open `notebooks/arc_solver.ipynb` and run all cells.

## Alignment with ARC Mission
ARC tasks test an agent's ability to reason about discrete structure and perform minimal, compositional transformations. Our scroll‑based approach directly encodes transformations rather than fitting statistical patterns. By restricting ourselves to symbolic operators, we ensure every decision is interpretable, reproducible, and grounded in explicit logic.
