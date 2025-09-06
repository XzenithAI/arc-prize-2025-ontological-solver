"""Core grid and scroll execution logic.

This module defines the Grid data structure and primitive operations used in scrolls. A scroll
is a list of operations to apply sequentially to a grid. Each Grid carries a log of operations
applied, enabling complete provenance.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple, Dict, Any
import numpy as np

@dataclass(frozen=True)
class Grid:
    data: np.ndarray
    log: Tuple[str, ...] = ()

    @staticmethod
    def from_list(lst: List[List[int]]) -> "Grid":
        arr = np.array(lst, dtype=int)
        if arr.ndim != 2:
            raise ValueError("Input must be a 2D list")
        return Grid(arr, ())

    def to_list(self) -> List[List[int]]:
        return self.data.astype(int).tolist()

    @property
    def h(self) -> int:
        return int(self.data.shape[0])

    @property
    def w(self) -> int:
        return int(self.data.shape[1])

def op_ROT90(g: Grid, k: int = 1) -> Grid:
    k = (k % 4 + 4) % 4
    return Grid(np.rot90(g.data, k=k), g.log + (f"ROT90({k})",))

def op_FLIP(g: Grid, axis: int = 1) -> Grid:
    if axis not in (0, 1):
        raise ValueError("axis must be 0 or 1")
    return Grid(np.flip(g.data, axis=axis), g.log + (f"FLIP({axis})",))

def op_TRANSPOSE(g: Grid) -> Grid:
    return Grid(g.data.T.copy(), g.log + ("TRANSPOSE",))

def op_REMAP(g: Grid, mapping: Dict[int, int]) -> Grid:
    out = g.data.copy()
    for a, b in mapping.items():
        out[g.data == a] = b
    return Grid(out, g.log + (f"REMAP({mapping})",))

def apply_scroll(scroll: List[Dict[str, Any]], g: Grid) -> Grid:
    """Apply a sequence of operations (scroll) to a grid."""
    current = g
    for step in scroll:
        op = step.get('op')
        if op == 'ROT90':
            current = op_ROT90(current, int(step.get('k', 1)))
        elif op == 'FLIP':
            current = op_FLIP(current, int(step.get('axis', 1)))
        elif op == 'TRANSPOSE':
            current = op_TRANSPOSE(current)
        elif op == 'REMAP':
            mapping = {int(k): int(v) for k, v in step.get('mapping', {}).items()}
            current = op_REMAP(current, mapping)
        else:
            raise ValueError(f"Unknown op: {op}")
    return current
