import streamlit as st
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Set up the page
st.set_page_config(page_title="Aerospace Stability Lab", layout="wide", page_icon="✈️")

# --- DATA & AERODYNAMIC PARAMETERS ---
AIRCRAFT = {
    "Aircraft A (Stable / C-130-like)": {
        "xref": 0.30, "Cm0": 0.05, "Cma_ref": -1.20, "Cmde": -1.10, "CL0": 0.20, "CLa": 5.50
    },
    "Aircraft B (Neutral / F-16-like)": {
        "xref": 0.30, "Cm0": 0.02, "Cma_ref": -0.05, "Cmde": -0.80, "CL0": 0.10, "CLa": 4.50
    }
}

# --- SIDEBAR UI CONTROLS ---
st.sidebar.title("✈️ Simulation Parameters")
ac_selection = st.sidebar.selectbox("Select Aircraft Profile", list(AIRCRAFT.keys()))
ac = AIRCRAFT[ac_selection]

st.sidebar.markdown("---")
st.sidebar.header("Live Controls")
cg_pct = st.sidebar.slider("CG Position (% MAC)", min_value=20.0, max_value=50.0, value=30.0, step=1.0) / 100.0
de_deg = st.sidebar.slider("Elevator Deflection δe (deg)", min_value=-10.0, max_value=10.0, value=0.0, step=0.5)
fuel_mass = st.sidebar.slider("Current Fuel Mass (kg)", min_value=0, max_value=3000, value=3000, step=50)

# --- CALCULATIONS ---
alpha = np.linspace(-10, 10, 100)
cma_current = ac["Cma_ref"] + (cg_pct - ac["xref"]) * ac["CLa"]
is_stable = cma_current < 0

def calc_cm(alpha_array, cma, de):
    return ac["Cm0"] + cma * alpha_array + ac["Cmde"] * de

# --- MAIN DASHBOARD HEADER ---
st.title(f"Dynamic Stability Analysis")
st.markdown(f"**Profile:** {ac_selection}")

col1, col2, col3 = st.columns(3)
with col1:
    st.metric(
        label="Stability Margin (Cm_α)", 
        value=f"{cma_current:.3f}", 
        delta="Stable" if is_stable else "Unstable", 
        delta_color="normal" if is_stable else "inverse"
    )
with col2:
    trim_alpha = - (ac["Cm0"] + ac["Cmde"] * de_deg) / cma_current if cma_current != 0 else 0
    st.metric(label=f"Trim Alpha (for δe = {de_deg}°)", value=f"{trim_alpha:.2f}°")
with col3:
    np_pos = ac["xref"] - (ac["Cma_ref"] / ac["CLa"])
    st.metric(label="Neutral Point (x_np)", value=f"{np_pos * 100:.1f}% MAC")

st.markdown("---")

# --- GRAPH 1: PITCHING MOMENT VS ALPHA ---
st.subheader("1. Pitching Moment vs Angle of Attack")
fig1 = go.Figure()

# Reference lines for assignment
fig1.add_trace(go.Scatter(x=alpha, y=calc_cm(alpha, cma_current, 0), mode='lines', name='δe = 0° (Ref)', line=dict(dash='dash', color='gray')))
fig1.add_trace(go.Scatter(x=alpha, y=calc_cm(alpha, cma_current, 5), mode='lines', name='δe = +5° (Ref)', line=dict(dash='dash', color='green', width=1)))
fig1.add_trace(go.Scatter(x=alpha, y=calc_cm(alpha, cma_current, -5), mode='lines', name='δe = -5° (Ref)', line=dict(dash='dash', color='red', width=1)))

# Dynamic interactive line
fig1.add_trace(go.Scatter(x=alpha, y=calc_cm(alpha, cma_current, de_deg), mode='lines', name=f'Dynamic (δe = {de_deg}°)', line=dict(width=4, color='#00F0FF')))

fig1.update_layout(
    xaxis_title="Angle of Attack α (deg)", 
    yaxis_title="Pitching Moment (Cm)", 
    template="plotly_dark", 
    height=500,
    hovermode="x unified"
)
st.plotly_chart(fig1, use_container_width=True)

# --- GRAPH 2: CG SWEEP EFFECT ---
st.markdown("---")
st.subheader("2. CG Sweep Effect (δe = 0°)")
fig2 = go.Figure()

for cg_sweep in [0.20, 0.30, 0.40, 0.50]:
    cma_sweep = ac["Cma_ref"] + (cg_sweep - ac["xref"]) * ac["CLa"]
    fig2.add_trace(go.Scatter(x=alpha, y=calc_cm(alpha, cma_sweep, 0), mode='lines', name=f'CG = {int(cg_sweep*100)}% MAC'))

# Overlay the dynamic slider CG position
fig2.add_trace(go.Scatter(x=alpha, y=calc_cm(alpha, cma_current, 0), mode='lines', name=f'Slider CG ({int(cg_pct*100)}%)', line=dict(width=4, color='white')))

fig2.update_layout(
    xaxis_title="Angle of Attack α (deg)", 
    yaxis_title="Pitching Moment (Cm)", 
    template="plotly_dark", 
    height=500,
    hovermode="x unified"
)
st.plotly_chart(fig2, use_container_width=True)

# --- GRAPH 3: FUEL BURN SIMULATION ---
st.markdown("---")
st.subheader("3. Fuel Burn & Stability Shift")

fuel_range = np.linspace(3000, 0, 100)
cg_fuel = []
cma_fuel = []
trim_de_fuel = []

# Empty Weight + Payload configuration
W_empty = 8000
cg_empty = 0.30
W_payload = 2000
cg_payload = 0.35
cg_fuel_tank = 0.20

for f in fuel_range:
    mass = W_empty + W_payload + f
    moment = (W_empty * cg_empty) + (W_payload * cg_payload) + (f * cg_fuel_tank)
    cg_pos = moment / mass
    cg_fuel.append(cg_pos)
    
    cur_cma = ac["Cma_ref"] + (cg_pos - ac["xref"]) * ac["CLa"]
    cma_fuel.append(cur_cma)
    
    # Trim elevator to hold alpha = 5 degrees
    trim = -(ac["Cm0"] + cur_cma * 5) / ac["Cmde"]
    trim_de_fuel.append(trim)

fig3 = make_subplots(specs=[[{"secondary_y": True}]])
fig3.add_trace(go.Scatter(x=fuel_range, y=np.array(cg_fuel)*100, mode='lines', name='CG Position (% MAC)', line=dict(color='#00F0FF', width=3)), secondary_y=False)
fig3.add_trace(go.Scatter(x=fuel_range, y=cma_fuel, mode='lines', name='Stability Margin (Cm_α)', line=dict(color='#FF3366', width=3)), secondary_y=True)

# Calculate current state based on slider
current_mass = W_empty + W_payload + fuel_mass
current_moment = (W_empty * cg_empty) + (W_payload * cg_payload) + (fuel_mass * cg_fuel_tank)
current_cg = current_moment / current_mass
current_cma = ac["Cma_ref"] + (current_cg - ac["xref"]) * ac["CLa"]

fig3.add_trace(go.Scatter(x=[fuel_mass], y=[current_cg*100], mode='markers', marker=dict(size=14, color='gold', line=dict(width=2, color='white')), name='Current Fuel State'), secondary_y=False)

fig3.update_layout(
    xaxis_title="Fuel Mass Remaining (kg)", 
    template="plotly_dark", 
    height=500, 
    xaxis=dict(autorange="reversed"),
    hovermode="x unified"
)
fig3.update_yaxes(title_text="CG Position (% MAC)", secondary_y=False)
fig3.update_yaxes(title_text="Stability Margin (Cm_α)", secondary_y=True)

st.plotly_chart(fig3, use_container_width=True)

st.success(f"**Simulation Output:** At `{fuel_mass} kg` of fuel, the CG is at `{current_cg*100:.2f}%` MAC. The stability margin $C_{{m_\\alpha}}$ is `{current_cma:.3f}`.")
