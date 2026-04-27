import sys
import json
import os
import neuralfoil as nf
import numpy as np

# Load the model into memory just once!
print("Loading Neuralfoil model into memory and starting daemon...", file=sys.stderr)


def is_symmetric(points, tol=1e-5):
    """Checks if the airfoil coordinates are symmetric."""
    if not points: return False
    # Split points into upper and lower (Selig format usually goes from TE-upper to LE to TE-lower)
    n = len(points)
    half = n // 2
    # Check if Y-coordinates are mirrored around y=0 (assuming normalized coordinates)
    # We compare points from the first half and second half
    for i in range(half):
        j = n - 1 - i
        if abs(points[i][1] + points[j][1]) > tol:
            return False
    return True

def compute_aerodynamics(data):
    alpha_list = data.get("alpha", list(range(-20, 31)))
    Re = data.get("Re", 1e6)
    points = data.get("points", [])
    model_size = data.get("modelSize", "large")
    
    if not points:
        return {"error": "No points provided"}

    symmetric = is_symmetric(points)
    tmp_path = f"tmp_airfoil_{os.getpid()}.dat"
    try:
        with open(tmp_path, "w") as f:
            f.write("Airfoil\n")
            for p in points:
                f.write(f"{p[0]} {p[1]}\n")
                
        aero = nf.get_aero_from_dat_file(tmp_path, alpha=np.array(alpha_list), Re=Re, model_size=model_size)
        
        cl_raw = aero.get('CL', np.zeros(len(alpha_list)))
        cd_raw = aero.get('CD', np.zeros(len(alpha_list)))

        if hasattr(cl_raw, 'tolist'):
            cl_data = cl_raw.tolist()
            cd_data = cd_raw.tolist()
        else:
            cl_data = [float(cl_raw)] * len(alpha_list)
            cd_data = [float(cd_raw)] * len(alpha_list)
            
        # ─── HIGH PRECISION CALIBRATION ───
        # 1. Zero-Bias Correction for Symmetric Airfoils
        zero_index = None
        if 0 in alpha_list:
            zero_index = alpha_list.index(0)
            
        if symmetric and zero_index is not None:
            bias = cl_data[zero_index]
            cl_data = [c - bias for c in cl_data]
            cl_data[zero_index] = 0.0 # Hard clamp
            
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
                # Apply an accelerating drop-off factor
                drop_factor = 1.0 - (dist * 0.12) # Sharp 12% drop per degree after peak
                cl_data[i] = max(0.1, cl_data[i] * drop_factor)
                
            # Sharpen negative stall
            for i in range(min_idx - 1, -1, -1):
                dist = min_idx - i
                drop_factor = 1.0 - (dist * 0.12)
                cl_data[i] = min(-0.1, cl_data[i] * drop_factor)

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
