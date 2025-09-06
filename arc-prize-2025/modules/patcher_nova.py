"""VX-NOVA symbolic program synthesizer.

Given training examples, this module searches for a scroll (sequence of operations) that
transforms the input grids into the output grids. It uses a simple beam search over a
small library of primitives and scores candidates based on exact matches and palette
similarity.
"""
from typing import List, Dict, Any, Tuple
import numpy as np
from .scroll_core import Grid, apply_scroll


def palette(arr: np.ndarray) -> Dict[int, int]:
    vals, counts = np.unique(arr, return_counts=True)
    return {int(v): int(c) for v, c in zip(vals, counts)}


def palette_similarity(a: np.ndarray, b: np.ndarray) -> float:
    pa, pb = palette(a), palette(b)
    colors = set(pa) | set(pb)
    if not colors:
        return 1.0
    num = sum(min(pa.get(c, 0), pb.get(c, 0)) for c in colors)
    den = sum(max(pa.get(c, 0), pb.get(c, 0)) for c in colors)
    return float(num / den) if den > 0 else 1.0


def _op_space() -> List[List[Dict[str, Any]]]:
    """Generate a library of primitive operation sequences."""
    ops: List[List[Dict[str, Any]]] = []
    # Single operations
    for k in (1, 2, 3):
        ops.append([{'op': 'ROT90', 'k': k}])
    for axis in (0, 1):
        ops.append([{'op': 'FLIP', 'axis': axis}])
    ops.append([{'op': 'TRANSPOSE'}])
    # Two-step sequences: rotation followed by flip
    for k in (1, 2, 3):
        for axis in (0, 1):
            ops.append([{'op': 'ROT90', 'k': k}, {'op': 'FLIP', 'axis': axis}])
    return ops


def _infer_remap(x: np.ndarray, y: np.ndarray) -> Dict[int, int] | None:
    xv = sorted(np.unique(x).tolist())
    yv = sorted(np.unique(y).tolist())
    if len(xv) != len(yv):
        return None
    return {int(a): int(b) for a, b in zip(xv, yv)}


def score_prog(scroll: List[Dict[str, Any]], xs: List[Grid], ys: List[Grid]) -> float:
    """Score a candidate scroll by average match quality across training pairs."""
    scores: List[float] = []
    for x, y in zip(xs, ys):
        try:
            out = apply_scroll(scroll, x).data
        except Exception:
            scores.append(0.0)
            continue
        if out.shape == y.data.shape and np.all(out == y.data):
            scores.append(1.0)
        else:
            p_sim = palette_similarity(out, y.data)
            shape_sim = 1.0 if out.shape == y.data.shape else 0.0
            scores.append(0.7 * p_sim + 0.3 * shape_sim)
    return float(np.mean(scores)) if scores else 0.0


def synthesize_scroll(
    train_pairs: List[Dict[str, Any]], beam: int = 100, depth: int = 3
) -> List[Dict[str, Any]]:
    """Search for a scroll that matches the training pairs.

    Args:
        train_pairs: A list of dicts with 'input' and 'output' grids.
        beam: Number of top candidates to keep at each expansion step.
        depth: Maximum number of expansion steps.

    Returns:
        A scroll (list of operations) that scores highest on the training pairs.
    """
    xs = [Grid.from_list(p['input']) for p in train_pairs]
    ys = [Grid.from_list(p['output']) for p in train_pairs]
    # Base: start with either no operation or a remap if possible
    remap0 = _infer_remap(xs[0].data, ys[0].data)
    pool: List[Tuple[List[Dict[str, Any]], float]] = [([], score_prog([], xs, ys))]
    if remap0:
        rm = [{'op': 'REMAP', 'mapping': remap0}]
        pool.append((rm, score_prog(rm, xs, ys)))
    # Search by expanding operations
    op_lib = _op_space()
    seen = set()
    for _ in range(depth):
        next_pool: List[Tuple[List[Dict[str, Any]], float]] = []
        for prog, _score in pool:
            for ops in op_lib:
                new_prog = prog + ops
                key = tuple((step['op'], tuple(sorted(step.items()))) for step in new_prog)
                if key in seen:
                    continue
                seen.add(key)
                s = score_prog(new_prog, xs, ys)
                next_pool.append((new_prog, s))
        next_pool.sort(key=lambda t: t[1], reverse=True)
        pool = next_pool[:beam]
    pool.sort(key=lambda t: t[1], reverse=True)
    return pool[0][0] if pool else []


def eval_scroll(scroll: List[Dict[str, Any]], train_pairs: List[Dict[str, Any]]):
    """Check if a scroll exactly matches all training pairs."""
    xs = [Grid.from_list(p['input']) for p in train_pairs]
    ys = [Grid.from_list(p['output']) for p in train_pairs]
    for i, (x, y) in enumerate(zip(xs, ys)):
        out = apply_scroll(scroll, x)
        if out.data.shape != y.data.shape or not np.array_equal(out.data, y.data):
            return False, f"mismatch on pair {i + 1}"
    return True, 'exact match'
