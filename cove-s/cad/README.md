# Cove S concept CAD

This folder contains a parametric concept model for the Cove S mobile AUV charging station. It shows the product architecture and component packaging; it is not fabrication-ready engineering.

## Included components

- 8 m surface hull
- deckhouse, navigation mast, and communications equipment
- power-takeoff and generator housing
- two structural tethers plus a power/data umbilical
- submerged reaction body and structural spine
- funnel-guided underwater AUV dock
- wave-propulsion foil pair
- ducted electric maneuvering thruster
- modular station battery
- power electronics enclosure
- representative 2.7 m AUV

The detailed geometry includes deck access hatches and rub rails; radar, satellite, and GNSS equipment; a PTO drum, brake, flanges, and guide rollers; reaction-body framing and pressure pods; dock guide rails, capture latches, charging puck, and acoustic beacon; two articulated foil pairs and actuator bodies; a five-blade ducted thruster; battery bus and disconnect hardware; and an AUV propeller, control fins, antenna, DVL, and side-scan housings.

## Deliverables

- `exports/cove-s-compact-assembly.step`: inspection assembly with compressed vertical spacing
- `exports/cove-s-operating-depth-assembly.step`: assembly at the 20 m design depth
- `exports/cove-s-exploded-assembly.step`: separated component view
- `exports/cove-s-compact-assembly.stl`: printable visual model
- `exports/parts/`: individual STEP and STL component files
- `renders/`: assembled, exploded, surface-module, and submerged-module preview images

All dimensions are millimetres. The Python source is the editable master model.

## Regenerate

From the repository root:

```bash
uv run --with cadquery python cove-s/cad/cove_s_cad.py --export
```

Change the values in the `Design` data class to resize the main system. STEP files can be opened in FreeCAD, Fusion 360, SolidWorks, Onshape, or other mechanical CAD software.

## Engineering status

The model defines an initial system envelope. Before fabrication, the following require separate engineering work:

- hull stability and survivability
- reaction-plate and foil hydrodynamics
- PTO force, stroke, and fatigue loading
- tether strength and dynamic behavior
- dock capture envelope and AUV compatibility
- pressure housings, seals, connectors, and thermal design
- mass, buoyancy, center of gravity, and center of buoyancy
