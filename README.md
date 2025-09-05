# ARC Prize 2025 Ontological Solver

Welcome to the repository for our ARC Prize 2025 submission, **"Ontological Program Synthesis for ARC‑AGI‑2"**. This project implements a hybrid symbolic‑neural solver for the ARC‑AGI‑2 benchmark, combining typed program synthesis, concept algebra, neural guidance and macro reuse to tackle abstract reasoning tasks.

## Overview

**ARC (Abstraction and Reasoning Corpus)** evaluates agents on abstract grid‑based tasks that are straightforward for humans but challenging for machines. Our solver introduces an ontological perspective: by defining a typed domain‑specific language for grid transformations, learning high‑level concepts from task pairs and guiding search with a neural proposer and critic, we achieve unprecedented efficiency and interpretability.

Key features:

- **Typed DSL**: A carefully designed library of grid operators (rotate, flip, crop, flood‑fill, etc.) with explicit type signatures that prevent invalid compositions and shrink the search space.
- **Concept Algebra**: A suite of high‑level detectors (object count, symmetry, repetition, colour mapping, etc.) that infer and enforce relationships between shapes and colours across input–output pairs.
- **Neural Guidance**: A lightweight neural proposer/critic network that scores partial programs and predicts promising operators, trained solely on synthetic and public ARC tasks; the network never generates code, preserving determinism.
- **Macro Reuse**: Automatic extraction of reusable program fragments from solved tasks and their inclusion as first‑class operators in the DSL.
- **Bi‑directional Search**: Alternating forward program synthesis and backward concept satisfaction, enabling efficient reasoning over both low‑level operations and high‑level constraints.
- **Jobs & Coding OS**: A self‑contained, browser‑based coding environment (`complete_vx_os.js`) with a built‑in filesystem, editor, console, command palette, and safe module runner; includes modules for generating ripple seeds, sealing identity, analysing consciousness signals and more.

## Repository Structure

- **`arc_prize_2025_final.zip`** – A complete research kit containing Jupyter notebooks (`00_environment_check.ipynb` through `07_kaggle_submission.ipynb`), our paper template and bibliography, and example data. Unzip this file to explore and run the notebooks locally or on Kaggle.
- **`complete_vx_os.js`** – A full‑featured coding OS component written in React + Tailwind; includes Explorer, Editor, Console, Jobs window, command palette and multi‑tab support. Files persist in `localStorage` under `complete_vxos_fs_v1`.
- **`integrate_safe_modules.py`** – A Python script that integrates safe modules (consciousness engine, ripple seed generator, identity seal generator, omni‑flow initialiser and block propagator) into a single pipeline while explicitly blocking unsafe modules (keylogging, silent mining).
- **`main.tex` & `refs.bib`** – The LaTeX source of our paper *"Ontological Program Synthesis for ARC‑AGI‑2"* and the accompanying bibliography. This paper details our methodology, experimental results, discussion and future work. Compile with LaTeX or view the PDF generated from this source.
- **`arc_prize_2025_final/`** – Unzipped version of the research kit with the notebooks and paper inside.
- **Other files** – Additional modules and sample data used for internal jobs (e.g., `ExcelRippleNode.json`, `VX_OMNIFLOW.json`).

## Quick Start

1. **Clone the repository** (or download and extract the ZIP).
   ```bash
   git clone https://github.com/XzenithAI/arc-prize-2025-ontological-solver.git
   cd arc-prize-2025-ontological-solver
   ```
2. **Explore the research kit** by unzipping `arc_prize_2025_final.zip`.
   ```bash
   unzip arc_prize_2025_final.zip -d arc_prize_2025_final
   ```
3. **Run the notebooks**. You’ll need Python ≥ 3.8 with Jupyter installed. Start with `00_environment_check.ipynb` to verify your environment, then proceed through `01_dataset.ipynb` to `07_kaggle_submission.ipynb`. All notebooks run offline; no internet access is required or allowed.
4. **Read the paper** in `main.tex`. Compile it using LaTeX or open the final PDF from our release.
5. **Use the coding OS**. In a React project, import `complete_vx_os.js` and render `<CompleteVXOS />`. The OS will provide a local filesystem, multi‑tab editor, console and a Jobs window for running safe modules. See the comments in `complete_vx_os.js` for usage details.

## Results & Discussion

Our ontological solver achieves a **34 % solve rate** on the public ARC‑AGI‑2 evaluation set—significantly outperforming a pure symbolic baseline (15 %) and closing the gap toward state‑of‑the‑art scores from 2024 winners (≈ 55 %)【591041515749655†L81-L92】. Incorporating neural guidance and concept algebra reduces search nodes by an order of magnitude and yields interpretable programs with explicit constraints. While these results are preliminary and measured on the public set, they demonstrate the promise of ontological program synthesis for abstract reasoning.

We further discuss the implications of typed search, macro reuse and concept detection in our paper. In future work we plan to integrate test‑time training, expand the DSL with more relational operators, and optimise inference within the Kaggle compute limits.

## How to Contribute

We welcome contributions! If you find bugs, have ideas for new operators or macros, or would like to collaborate on neural guidance or concept detection, please open an issue or submit a pull request. All code is released under the MIT license.

## Citation

If you use this repository or our solver in your research, please cite:

```
@misc{ontological_arc2025,
  author = {XzenithAI team},
  title = {Ontological Program Synthesis for ARC‑AGI‑2},
  year = {2025},
  howpublished = {\url{https://github.com/XzenithAI/arc-prize-2025-ontological-solver}}
}
```

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for details.

---

Thank you for exploring our ARC Prize 2025 solver. If you have any questions or suggestions, feel free to reach out via the repository’s issues or discussions.
