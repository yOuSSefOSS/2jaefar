
import math

def compute_naca(m, p, t, N=60):
    upper = []
    lower = []
    for i in range(N + 1):
        x = (1 - math.cos(math.pi * i / N)) / 2
        xn = max(0, x)
        yt = 5 * t * (0.2969 * math.sqrt(xn + 1e-9) - 0.126 * xn - 0.3516 * xn ** 2 + 0.2843 * xn ** 3 - 0.1015 * xn ** 4)
        
        # For NACA 0012: m=0, p=0
        if m == 0 or p == 0:
            yc = 0
            dyc = 0
        elif xn < p:
            yc = (m / p ** 2) * (2 * p * xn - xn ** 2)
            dyc = (2 * m / p ** 2) * (p - xn)
        else:
            yc = (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xn - xn ** 2)
            dyc = (2 * m / (1 - p) ** 2) * (p - xn)
            
        theta = math.atan(dyc)
        upper.append([xn - yt * math.sin(theta) - 0.5, yc + yt * math.cos(theta)])
        lower.append([xn + yt * math.sin(theta) - 0.5, yc - yt * math.cos(theta)])
    
    return upper, lower

# Test NACA 0012
up, lo = compute_naca(0, 0, 0.12)

asymmetry_found = False
for i in range(len(up)):
    # In a perfectly symmetric airfoil, x should be identical (if theta=0) and y should be y_up = -y_low
    # Since m=0, p=0 -> theta=0, sin(theta)=0, cos(theta)=1
    # x_up = xn - 0.5, x_low = xn - 0.5
    # y_up = yt, y_low = -yt
    
    x_diff = abs(up[i][0] - lo[i][0])
    y_sum = up[i][1] + lo[i][1]
    
    if x_diff > 1e-15 or abs(y_sum) > 1e-15:
        print(f"Index {i}: Asymmetry! X-diff: {x_diff}, Y-sum: {y_sum}")
        asymmetry_found = True

if not asymmetry_found:
    print("Coordinates are perfectly symmetric.")
else:
    print("Asymmetry detected in coordinate generation.")
