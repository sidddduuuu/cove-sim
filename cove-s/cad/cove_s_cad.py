#!/usr/bin/env python3
"""Parametric concept CAD for the Cove S mobile AUV charging station.

Units are millimetres.  The model is intended for architecture, packaging, and
discussion.  Hull, foil, PTO, and structural dimensions require hydrodynamic
and mechanical validation before fabrication.
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass
from pathlib import Path

import cadquery as cq


ROOT = Path(__file__).resolve().parent
EXPORTS = ROOT / "exports"
PARTS = EXPORTS / "parts"
RENDERS = ROOT / "renders"


@dataclass(frozen=True)
class Design:
    hull_length: float = 8000
    hull_beam: float = 3000
    hull_height: float = 1300
    operating_depth: float = 20000
    display_depth: float = 6500
    reaction_length: float = 5200
    reaction_beam: float = 2600
    reaction_thickness: float = 260
    dock_length: float = 3600
    dock_inside_diameter: float = 850
    auv_length: float = 2700
    auv_diameter: float = 480


D = Design()


COLORS = {
    "surface_hull": (0.94, 0.48, 0.08, 1.0),
    "deckhouse": (0.92, 0.95, 0.97, 1.0),
    "mast": (0.95, 0.80, 0.15, 1.0),
    "pto": (0.12, 0.22, 0.32, 1.0),
    "tethers": (0.17, 0.20, 0.23, 1.0),
    "reaction_body": (0.08, 0.42, 0.52, 1.0),
    "dock": (0.10, 0.57, 0.65, 1.0),
    "foils": (0.12, 0.28, 0.36, 1.0),
    "thruster": (0.13, 0.16, 0.20, 1.0),
    "battery": (0.18, 0.63, 0.34, 1.0),
    "electronics": (0.20, 0.46, 0.82, 1.0),
    "auv": (0.92, 0.74, 0.12, 1.0),
}


def rounded_box(x: float, y: float, z: float, radius: float) -> cq.Workplane:
    solid = cq.Workplane("XY").box(x, y, z, centered=(True, True, True))
    return solid.edges().fillet(radius)


def surface_hull() -> cq.Workplane:
    # Four elliptical waterline sections produce a simple low-profile monohull.
    shell = (
        cq.Workplane("XY")
        .workplane(offset=-450)
        .ellipse(D.hull_length * 0.34, D.hull_beam * 0.26)
        .workplane(offset=350)
        .ellipse(D.hull_length * 0.50, D.hull_beam * 0.50)
        .workplane(offset=650)
        .ellipse(D.hull_length * 0.47, D.hull_beam * 0.48)
        .workplane(offset=300)
        .ellipse(D.hull_length * 0.38, D.hull_beam * 0.38)
        .loft(combine=True)
    )
    deck = rounded_box(5600, 2050, 170, 75).translate((150, 0, 900))
    fore_hatch = rounded_box(1050, 720, 90, 32).translate((-2400, 0, 1030))
    aft_hatch = rounded_box(950, 650, 90, 32).translate((2500, 0, 1030))
    rub_port = cq.Workplane("YZ").circle(70).extrude(3200, both=True).translate((0, 1430, 180))
    rub_starboard = cq.Workplane("YZ").circle(70).extrude(3200, both=True).translate((0, -1430, 180))
    return shell.union(deck).union(fore_hatch).union(aft_hatch).union(rub_port).union(rub_starboard)


def deckhouse() -> cq.Workplane:
    cabin = rounded_box(2700, 1500, 680, 170)
    roof = rounded_box(2400, 1380, 90, 30).translate((0, 0, 380))
    service_hatch = rounded_box(850, 580, 45, 15).translate((-550, 0, 450))
    vent_port = cq.Workplane("XZ").box(520, 55, 210, centered=(True, True, True)).translate((550, 765, 0))
    vent_starboard = vent_port.mirror("XZ")
    return cabin.union(roof).union(service_hatch).union(vent_port).union(vent_starboard)


def mast() -> cq.Workplane:
    pole = cq.Workplane("XY").circle(70).extrude(1900)
    radar = cq.Workplane("XY").workplane(offset=1450).box(650, 80, 90, centered=(True, True, True))
    antenna = cq.Workplane("XY").workplane(offset=1900).circle(28).extrude(500)
    light = cq.Workplane("XY").workplane(offset=1800).circle(110).extrude(130)
    sat_dome = cq.Workplane("XY").workplane(offset=1100).sphere(210)
    gnss_port = cq.Workplane("XY").workplane(offset=720).center(260, 0).sphere(75)
    gnss_starboard = cq.Workplane("XY").workplane(offset=720).center(-260, 0).sphere(75)
    return pole.union(radar).union(antenna).union(light).union(sat_dome).union(gnss_port).union(gnss_starboard)


def pto_housing() -> cq.Workplane:
    housing = rounded_box(1100, 900, 650, 120)
    drum = cq.Workplane("YZ").circle(235).extrude(380, both=True)
    shaft = cq.Workplane("YZ").circle(65).extrude(560, both=True)
    flange_a = cq.Workplane("YZ").circle(285).extrude(45).translate((-410, 0, 0))
    flange_b = cq.Workplane("YZ").circle(285).extrude(45).translate((365, 0, 0))
    guide_a = cq.Workplane("YZ").circle(90).extrude(280, both=True).translate((-100, 360, -360))
    guide_b = cq.Workplane("YZ").circle(90).extrude(280, both=True).translate((-100, -360, -360))
    brake = rounded_box(260, 540, 390, 55).translate((560, 0, 0))
    return housing.union(drum).union(shaft).union(flange_a).union(flange_b).union(guide_a).union(guide_b).union(brake)


def reaction_body() -> cq.Workplane:
    plate = rounded_box(D.reaction_length, D.reaction_beam, D.reaction_thickness, 110)
    spine = rounded_box(4000, 520, 520, 120).translate((0, 0, 220))
    keels = (
        rounded_box(2600, 140, 650, 55).translate((0, 780, -300))
        .union(rounded_box(2600, 140, 650, 55).translate((0, -780, -300)))
    )
    pod_port = cq.Workplane("YZ").circle(230).extrude(1800, both=True).translate((0, 870, 240))
    pod_starboard = cq.Workplane("YZ").circle(230).extrude(1800, both=True).translate((0, -870, 240))
    braces = cq.Workplane("XY")
    for x in (-1700, 0, 1700):
        braces = braces.union(rounded_box(160, 2200, 180, 35).translate((x, 0, 210)))
    return plate.union(spine).union(keels).union(pod_port).union(pod_starboard).union(braces)


def dock() -> cq.Workplane:
    outer_radius = D.dock_inside_diameter / 2 + 90
    inner_radius = D.dock_inside_diameter / 2
    tube = (
        cq.Workplane("YZ")
        .circle(outer_radius)
        .circle(inner_radius)
        .extrude(D.dock_length)
        .translate((-D.dock_length / 2, 0, 0))
    )
    funnel = cq.Solid.makeCone(
        outer_radius + 470,
        outer_radius,
        950,
        cq.Vector(-D.dock_length / 2 - 950, 0, 0),
        cq.Vector(1, 0, 0),
    )
    funnel_bore = cq.Solid.makeCone(
        inner_radius + 390,
        inner_radius,
        950,
        cq.Vector(-D.dock_length / 2 - 950, 0, 0),
        cq.Vector(1, 0, 0),
    )
    funnel_shell = cq.Workplane(obj=funnel.cut(funnel_bore))
    ribs = cq.Workplane("YZ")
    for x in (-1200, 0, 1200):
        ribs = ribs.union(
            cq.Workplane("YZ")
            .circle(outer_radius + 55)
            .circle(outer_radius)
            .extrude(55)
            .translate((x, 0, 0))
        )
    rails = cq.Workplane("XY")
    for y, z in ((0, outer_radius + 120), (0, -outer_radius - 120), (outer_radius + 120, 0), (-outer_radius - 120, 0)):
        rail = rounded_box(D.dock_length + 1250, 55, 55, 16).translate((-420, y, 0))
        if y == 0:
            rail = rounded_box(D.dock_length + 1250, 55, 55, 16).translate((-420, 0, z))
        rails = rails.union(rail)
    backstop = cq.Workplane("YZ").circle(outer_radius + 80).circle(inner_radius * 0.60).extrude(110).translate((D.dock_length / 2 - 110, 0, 0))
    charge_puck = cq.Workplane("YZ").circle(135).extrude(150).translate((D.dock_length / 2 - 170, 0, 0))
    latch_port = rounded_box(420, 110, 150, 28).translate((950, inner_radius - 40, 0))
    latch_starboard = latch_port.mirror("XZ")
    acoustic_beacon = cq.Workplane("XY").circle(85).extrude(260).translate((-900, 0, outer_radius + 180))
    return tube.union(funnel_shell).union(ribs).union(rails).union(backstop).union(charge_puck).union(latch_port).union(latch_starboard).union(acoustic_beacon)


def battery_pack() -> cq.Workplane:
    modules = cq.Workplane("XY")
    for x in (-900, 0, 900):
        modules = modules.union(rounded_box(720, 620, 360, 55).translate((x, 0, 0)))
    busbar = rounded_box(2550, 130, 85, 25).translate((0, 0, 240))
    disconnect = rounded_box(260, 260, 250, 38).translate((1320, 0, 0))
    return modules.union(busbar).union(disconnect)


def electronics_pack() -> cq.Workplane:
    enclosure = rounded_box(1050, 700, 420, 65)
    heat_sink = cq.Workplane("XY")
    for x in range(-400, 401, 160):
        heat_sink = heat_sink.union(cq.Workplane("XY").box(55, 560, 90, centered=(True, True, True)).translate((x, 0, 250)))
    connectors = cq.Workplane("YZ")
    for y in (-220, 0, 220):
        connectors = connectors.union(cq.Workplane("YZ").circle(45).extrude(90).translate((550, y, 0)))
    return enclosure.union(heat_sink).union(connectors)


def foil_pair() -> cq.Workplane:
    # Conceptual swept wings; final hydrofoil section and hinge require CFD/tank tests.
    planform = [(-1050, -90), (-650, -560), (950, -350), (1200, -80), (850, 70), (-650, 150)]
    wing = cq.Workplane("XY").polyline(planform).close().extrude(65, both=True)
    port = wing.translate((0, 760, 0)).rotate((0, 0, 0), (0, 1, 0), -8)
    starboard = wing.mirror("XZ").translate((0, -760, 0)).rotate((0, 0, 0), (0, 1, 0), -8)
    hinges = (
        cq.Workplane("YZ").circle(70).extrude(400, both=True).translate((-650, 690, 0))
        .union(cq.Workplane("YZ").circle(70).extrude(400, both=True).translate((-650, -690, 0)))
    )
    aft_port = port.translate((1650, 0, -40)).rotate((0, 0, 0), (0, 1, 0), 12)
    aft_starboard = starboard.translate((1650, 0, -40)).rotate((0, 0, 0), (0, 1, 0), 12)
    actuator_port = cq.Workplane("YZ").circle(75).extrude(620).translate((-250, 620, 180)).rotate((0, 0, 0), (0, 1, 0), -18)
    actuator_starboard = actuator_port.mirror("XZ")
    return port.union(starboard).union(aft_port).union(aft_starboard).union(hinges).union(actuator_port).union(actuator_starboard)


def thruster() -> cq.Workplane:
    shroud = cq.Workplane("YZ").circle(330).circle(265).extrude(360, both=True)
    hub = cq.Workplane("YZ").circle(90).extrude(520, both=True)
    blade = cq.Workplane("XY").box(45, 430, 90, centered=(True, True, True)).rotate((0, 0, 0), (1, 0, 0), 18)
    prop = blade
    for angle in (72, 144, 216, 288):
        prop = prop.union(blade.rotate((0, 0, 0), (1, 0, 0), angle))
    struts = cq.Workplane("XY")
    for angle in (0, 90, 180, 270):
        strut = cq.Workplane("XY").box(240, 38, 45, centered=(True, True, True)).translate((0, 180, 0)).rotate((0, 0, 0), (1, 0, 0), angle)
        struts = struts.union(strut)
    mount = rounded_box(800, 220, 180, 45).translate((0, 0, 430))
    return shroud.union(hub).union(prop).union(struts).union(mount)


def example_auv() -> cq.Workplane:
    r = D.auv_diameter / 2
    body_len = D.auv_length - 2 * r
    body = cq.Workplane("YZ").circle(r).extrude(body_len).translate((-body_len / 2, 0, 0))
    nose = cq.Solid.makeCone(r, 20, r, cq.Vector(body_len / 2, 0, 0), cq.Vector(1, 0, 0))
    tail = cq.Solid.makeCone(20, r, r, cq.Vector(-body_len / 2 - r, 0, 0), cq.Vector(1, 0, 0))
    fins = cq.Workplane("XY").box(450, 1050, 45, centered=(True, True, True)).translate((-900, 0, 0))
    vertical = cq.Workplane("XZ").box(450, 45, 750, centered=(True, True, True)).translate((-900, 0, 0))
    prop_shaft = cq.Workplane("YZ").circle(45).extrude(300).translate((-D.auv_length / 2 - 220, 0, 0))
    prop_blade = cq.Workplane("XY").box(35, 520, 55, centered=(True, True, True)).translate((-D.auv_length / 2 - 250, 0, 0))
    prop = prop_blade.union(prop_blade.rotate((-D.auv_length / 2 - 250, 0, 0), (-D.auv_length / 2 - 249, 0, 0), 90))
    dvl = rounded_box(260, 180, 70, 25).translate((250, 0, -r - 20))
    antenna = cq.Workplane("XY").circle(20).extrude(260).translate((-420, 0, r))
    side_scan_port = rounded_box(900, 65, 80, 24).translate((100, r - 5, -20))
    side_scan_starboard = side_scan_port.mirror("XZ")
    return (
        body.union(cq.Workplane(obj=nose)).union(cq.Workplane(obj=tail))
        .union(fins).union(vertical).union(prop_shaft).union(prop)
        .union(dvl).union(antenna).union(side_scan_port).union(side_scan_starboard)
    )


def tether_bundle(depth: float) -> cq.Workplane:
    parts = cq.Workplane("XY")
    for x, y, radius in [(-520, 0, 40), (520, 0, 40), (0, 260, 28)]:
        cable = cq.Workplane("XY").center(x, y).circle(radius).extrude(depth)
        parts = parts.union(cable)
    return parts


def raw_parts(depth: float) -> dict[str, cq.Workplane]:
    """Return each component around its own modeling origin."""
    return {
        "surface_hull": surface_hull(),
        "deckhouse": deckhouse(),
        "mast": mast(),
        "pto": pto_housing(),
        "tethers": tether_bundle(depth - 850),
        "reaction_body": reaction_body(),
        "dock": dock(),
        "foils": foil_pair(),
        "thruster": thruster(),
        "battery": battery_pack(),
        "electronics": electronics_pack(),
        "auv": example_auv(),
    }


def build_parts(depth: float) -> dict[str, cq.Workplane]:
    submerged_z = -depth
    parts = raw_parts(depth)
    placements = {
        "surface_hull": (0, 0, 0),
        "deckhouse": (650, 0, 1320),
        "mast": (650, 0, 1650),
        "pto": (-1150, 0, 1250),
        "tethers": (0, 0, -depth + 420),
        "reaction_body": (0, 0, submerged_z),
        "dock": (200, 0, submerged_z - 760),
        "foils": (450, 0, submerged_z - 820),
        "thruster": (2150, 0, submerged_z - 280),
        "battery": (0, 0, submerged_z + 510),
        "electronics": (650, 0, 1700),
        "auv": (-900, 0, submerged_z - 760),
    }
    return {name: shape.translate(placements[name]) for name, shape in parts.items()}


def build_assembly(depth: float, exploded: bool = False) -> cq.Assembly:
    parts = build_parts(depth)
    assembly = cq.Assembly(name="Cove S concept assembly")
    offsets = {
        "surface_hull": (0, 0, 0),
        "deckhouse": (0, 0, 900),
        "mast": (0, 0, 1700),
        "pto": (-900, 0, 350),
        "tethers": (0, 0, 0),
        "reaction_body": (0, 0, 0),
        "dock": (-2400, 1500, -550),
        "foils": (400, 2800, -1200),
        "thruster": (2200, -1200, -500),
        "battery": (0, -2100, 700),
        "electronics": (1800, 0, 1100),
        "auv": (-3200, -2600, -1500),
    }
    for name, shape in parts.items():
        if exploded:
            shape = shape.translate(offsets[name])
        assembly.add(shape, name=name, color=cq.Color(*COLORS[name]))
    return assembly


def export_shape(shape: cq.Workplane, name: str) -> None:
    cq.exporters.export(shape, str(PARTS / f"{name}.step"))
    cq.exporters.export(shape, str(PARTS / f"{name}.stl"), tolerance=1.0, angularTolerance=0.2)


def export_all() -> None:
    EXPORTS.mkdir(parents=True, exist_ok=True)
    PARTS.mkdir(parents=True, exist_ok=True)
    RENDERS.mkdir(parents=True, exist_ok=True)

    local_parts = raw_parts(D.display_depth)
    for name, shape in local_parts.items():
        if name != "tethers":
            export_shape(shape, name)

    compact = build_assembly(D.display_depth)
    operational = build_assembly(D.operating_depth)
    exploded = build_assembly(D.display_depth, exploded=True)
    compact.save(str(EXPORTS / "cove-s-compact-assembly.step"))
    operational.save(str(EXPORTS / "cove-s-operating-depth-assembly.step"))
    exploded.save(str(EXPORTS / "cove-s-exploded-assembly.step"))
    compact.save(str(EXPORTS / "cove-s-compact-assembly.stl"))

    render_assembly(build_parts(D.display_depth), RENDERS / "cove-s-assembled.png", exploded=False)
    render_assembly(build_parts(D.display_depth), RENDERS / "cove-s-exploded.png", exploded=True)
    render_detail(surface_detail_parts(), RENDERS / "cove-s-surface-module.png", "COVE S — SURFACE POWER MODULE")
    render_detail(submerged_detail_parts(), RENDERS / "cove-s-submerged-module.png", "COVE S — SUBMERGED SERVICE MODULE")


def surface_detail_parts() -> dict[str, cq.Workplane]:
    return {
        "surface_hull": surface_hull(),
        "deckhouse": deckhouse().translate((650, 0, 1320)),
        "mast": mast().translate((650, 0, 1650)),
        "pto": pto_housing().translate((-1150, 0, 1250)),
        "electronics": electronics_pack().translate((650, 0, 1700)),
    }


def submerged_detail_parts() -> dict[str, cq.Workplane]:
    return {
        "reaction_body": reaction_body(),
        "dock": dock().translate((200, 0, -760)),
        "foils": foil_pair().translate((450, 0, -820)),
        "thruster": thruster().translate((2150, 0, -280)),
        "battery": battery_pack().translate((0, 0, 510)),
        "auv": example_auv().translate((-3600, -1850, -900)),
    }


def render_detail(parts: dict[str, cq.Workplane], path: Path, title: str) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    from matplotlib.patches import Patch
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    friendly = {
        "surface_hull": "Surface hull + deck", "deckhouse": "Control deckhouse",
        "mast": "Navigation + communications", "pto": "PTO drum + brake",
        "electronics": "Power electronics", "reaction_body": "Reaction body + pressure pods",
        "dock": "Dock funnel + latch + charger", "foils": "Two foil pairs + actuators",
        "thruster": "Ducted maneuvering thruster", "battery": "Battery modules + disconnect",
        "auv": "Reference AUV",
    }
    fig = plt.figure(figsize=(14, 10), facecolor="#07141d")
    ax = fig.add_subplot(111, projection="3d", facecolor="#07141d")
    all_xyz = []
    for name, workplane in parts.items():
        vertices, triangles = workplane.val().tessellate(6.0, 0.25)
        xyz = np.array([[v.x, v.y, v.z] for v in vertices])
        faces = [xyz[list(t)] for t in triangles]
        poly = Poly3DCollection(faces, linewidths=0.10, edgecolors=(0.65, 0.82, 0.9, 0.25))
        poly.set_facecolor(COLORS[name])
        ax.add_collection3d(poly)
        all_xyz.append(xyz)

    xyz = np.vstack(all_xyz)
    mins, maxs = xyz.min(axis=0), xyz.max(axis=0)
    center = (mins + maxs) / 2
    radius = max(maxs - mins) / 2 * 0.72
    ax.set_xlim(center[0] - radius, center[0] + radius)
    ax.set_ylim(center[1] - radius, center[1] + radius)
    ax.set_zlim(center[2] - radius, center[2] + radius)
    ax.set_box_aspect((1, 1, 0.72))
    ax.view_init(elev=24, azim=-56)
    ax.set_axis_off()
    ax.set_title(title, color="white", fontsize=18, weight="bold", pad=18)
    handles = [Patch(facecolor=COLORS[k], edgecolor="#8aa5b4", label=friendly[k]) for k in parts]
    legend = fig.legend(handles=handles, loc="lower center", bbox_to_anchor=(0.5, 0.035), ncol=2,
                        frameon=False, labelcolor="white", fontsize=9)
    for text_item in legend.get_texts():
        text_item.set_color("white")
    fig.text(0.5, 0.012, "Concept CAD · packaging geometry only", ha="center", color="#9bb7c5", fontsize=9)
    fig.savefig(path, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def render_assembly(parts: dict[str, cq.Workplane], path: Path, exploded: bool) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    from matplotlib.patches import Patch

    offsets = {
        "surface_hull": (0, 0, 0), "deckhouse": (0, 0, 900), "mast": (0, 0, 1700),
        "pto": (-900, 0, 350), "tethers": (0, 0, 0), "reaction_body": (0, 0, 0),
        "dock": (-2400, 1500, -550), "foils": (400, 2800, -1200), "thruster": (2200, -1200, -500),
        "battery": (0, -2100, 700), "electronics": (1800, 0, 1100), "auv": (-3200, -2600, -1500),
    }
    fig = plt.figure(figsize=(13, 10), facecolor="#07141d")
    ax = fig.add_subplot(111, projection="3d", facecolor="#07141d")

    all_xyz = []
    for name, workplane in parts.items():
        shape = workplane.val()
        if exploded:
            shape = shape.translate(cq.Vector(*offsets[name]))
        vertices, triangles = shape.tessellate(12.0, 0.35)
        xyz = np.array([[v.x, v.y, v.z] for v in vertices])
        faces = [xyz[list(t)] for t in triangles]
        poly = Poly3DCollection(faces, linewidths=0.08, edgecolors=(0.6, 0.8, 0.9, 0.20))
        poly.set_facecolor(COLORS[name])
        ax.add_collection3d(poly)
        all_xyz.append(xyz)

    xyz = np.vstack(all_xyz)
    mins, maxs = xyz.min(axis=0), xyz.max(axis=0)
    center = (mins + maxs) / 2
    radius = max(maxs - mins) / 2
    ax.set_xlim(center[0] - radius, center[0] + radius)
    ax.set_ylim(center[1] - radius, center[1] + radius)
    ax.set_zlim(center[2] - radius, center[2] + radius)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=18, azim=-58)
    ax.set_axis_off()
    title = "COVE S — EXPLODED COMPONENT VIEW" if exploded else "COVE S — COMPACT ASSEMBLY VIEW"
    ax.set_title(title, color="white", fontsize=18, weight="bold", pad=20)
    subtitle = "Concept CAD · dimensions in mm · submerged spacing compressed for inspection"
    fig.text(0.5, 0.04, subtitle, ha="center", color="#9bb7c5", fontsize=10)
    if exploded:
        labels = {
            "surface_hull": "Surface hull", "deckhouse": "Deckhouse", "mast": "Navigation mast",
            "pto": "Wave-energy PTO", "tethers": "Tethers + umbilical",
            "reaction_body": "Reaction body", "dock": "AUV dock", "foils": "Wave propulsion fins",
            "thruster": "Electric thruster", "battery": "Battery modules",
            "electronics": "Power electronics", "auv": "Example AUV",
        }
        handles = [Patch(facecolor=COLORS[k], edgecolor="#8aa5b4", label=labels[k]) for k in labels]
        legend = fig.legend(
            handles=handles, loc="center right", bbox_to_anchor=(0.98, 0.50), ncol=1,
            frameon=False, labelcolor="white", fontsize=9,
        )
        for text_item in legend.get_texts():
            text_item.set_color("white")
        fig.subplots_adjust(right=0.82)
    fig.savefig(path, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--export", action="store_true", help="Generate STEP, STL, and PNG outputs")
    args = parser.parse_args()
    if args.export:
        export_all()
        print(f"Exported Cove S CAD to {EXPORTS}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
