"""Optional VX:OS runtime for executing scrolls.

This module provides a simple function to apply a scroll to a nested list representation
of a grid, returning the resulting grid as a nested list. It depends on the scroll_core
module.
"""
from typing import List, Dict, Any
from modules.Grid import Grid, apply_scroll


def run_scroll(scroll: List[Dict[str, Any]], grid: List[List[int]]) -> List[List[int]]:
    """Run a scroll on a grid represented as a list of lists.

    Args:
        scroll: A list of operation dictionaries (scroll) to apply.
        grid: A 2D list representing the input grid.

    Returns:
        The resulting grid after applying the scroll, as a 2D list.
    """
    g = Grid.from_list(grid)
    result = apply_scroll(scroll, g)
    return result.to_list()
