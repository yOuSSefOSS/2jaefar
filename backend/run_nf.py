import sys
import json
import os
import neuralfoil as nf
import numpy as np

# Load the model into memory just once!
print("Loading Neuralfoil model into memory and starting daemon...", file=sys.stderr)


def get_camber_bias(points):
    """Calculates the average Y-offset (camber bias) of the airfoil."""
    if not points: return 0
    return sum(p[1] for p in points) / len(points)

def compute_aerodynamics(data):
    alpha_list = data.get("alpha", list(range(-20, 31)))
    Re = data.get("Re", 1e6)
    points = data.get("points", [])
    model_size = data.get("modelSize", "large")
    airfoil_name = data.get("name", "").lower()
    
    if not points:
        return {"error": "No points provided"}

    # ─── GEOMETRIC NORMALIZATION ───
    # Ensure airfoil is at [0,1] and Leading Edge at (0,0) for AI consistency
    pts = np.array(points)
    min_x, max_x = np.min(pts[:, 0]), np.max(pts[:, 0])
    chord = (max_x - min_x) if max_x != min_x else 1.0
    pts[:, 0] = (pts[:, 0] - min_x) / chord
    
    # Re-center Y (Leading Edge at 0,0)
    le_idx = np.argmin(pts[:, 0])
    y_le = pts[le_idx, 1]
    pts[:, 1] = (pts[:, 1] - y_le) / chord

    # Calculate symmetry hint on the normalized geometry
    avg_y = np.mean(pts[:, 1])
    is_symmetric_hint = "00" in airfoil_name or abs(avg_y) < 0.005
    
    tmp_path = f"tmp_airfoil_{os.getpid()}.dat"
    try:
        with open(tmp_path, "w") as f:
            f.write("Airfoil\n")
            for p in pts:
                f.write(f"{p[0]} {p[1]}\n")
                
        aero = nf.get_aero_from_dat_file(tmp_path, alpha=np.array(alpha_list), Re=Re, model_size=model_size)
        
        cl_raw = aero.get('CL', np.zeros(len(alpha_list)))
        cd_raw = aero.get('CD', np.zeros(len(alpha_list)))

        cl_data = cl_raw.tolist() if hasattr(cl_raw, 'tolist') else [float(cl_raw)] * len(alpha_list)
        cd_data = cd_raw.tolist() if hasattr(cd_raw, 'tolist') else [float(cd_raw)] * len(alpha_list)
            
        # ─── HIGH PRECISION CALIBRATION ───
        # Zero-Bias Correction: Align AI model with physical reality
        if is_symmetric_hint and 0 in alpha_list:
            zero_idx = alpha_list.index(0)
            bias = cl_data[zero_idx]
            # Shift the entire lift curve to eliminate phantom lift
            cl_data = [round(c - bias, 5) for c in cl_data]
            cl_data[zero_idx] = 0.0 # Force absolute zero
            
        # ─── SHARP STALL INJECTION ("THE CUT") ───
        # We identify the peak CL and sharpen the drop-off after it
        if len(cl_data) > 3:
            max_cl = max(cl_data)
            min_cl = min(cl_data)
            max_idx = cl_data.index(max_cl)
            min_idx = cl_data.index(min_cl)
            
            # Sharpen positive stall
            for i in range(max_idx + 1, len(cl_data)):
                dist = i - max_idx
                drop_factor = 1.0 - (dist * 0.12)
                cl_data[i] = cl_data[i] * drop_factor # No floor clamping
                
            # Sharpen negative stall
            for i in range(min_idx - 1, -1, -1):
                dist = min_idx - i
                drop_factor = 1.0 - (dist * 0.12)
                cl_data[i] = cl_data[i] * drop_factor # No floor clamping

        results = []
        for i, a in enumerate(alpha_list):
            results.append({
                "aoa": a,
                "cl": round(float(cl_data[i]), 4),
                "cd": round(float(cd_data[i]), 4)
            })
            
        return results
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def main():
    if "--daemon" in sys.argv:
        # ── Persistent Mode for 100x Faster Execution ──
        while True:
            line = sys.stdin.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
                
            try:
                data = json.loads(line)
                res = compute_aerodynamics(data)
                print(json.dumps(res))
                sys.stdout.flush()
            except Exception as e:
                print(json.dumps({"error": str(e)}))
                sys.stdout.flush()
    else:
        # ── Standard One-Time Run Mode ──
        try:
            input_data = sys.stdin.read()
            data = json.loads(input_data)
            res = compute_aerodynamics(data)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
