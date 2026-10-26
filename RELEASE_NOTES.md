# Release notes

## 2026-10-26: Straight walls and correct perspective

The ASCII view now casts rays through column centres on a flat camera plane.
This preserves the 60-degree horizontal field of view while using perpendicular
camera depth for wall height. Straight walls no longer bow away at the edges;
the reproduced wall now spans 27 character rows across the view, previously
27 centrally and 23 at either edge.

The 120 by 40 character buffer, glyph palette, floor shading, map, movement,
collision, controls, 50 ms update interval and existing page layout are unchanged.
There are no sprites, minimap or additional depth buffers in this game.
