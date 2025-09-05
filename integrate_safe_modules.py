"""
Module integrator script for VX modules.

This script integrates the safe Python modules uploaded by the user into a single
pipeline. It performs the following steps:

1. Analyse a sample consciousness signal and generate a proof using either the
   original `ConsciousnessEngine` (if `torch` is available) or a fallback
   implementation based on NumPy. The fallback computes entropy via softmax
   and determines an authenticity score according to the original logic.
2. Invoke the `ripple_seed` function from `excel_ripple_seed.py` to produce
   an `ExcelRippleNode.json` file. If the call is successful, the script
   displays the location of the generated file.
3. If a `consciousness_thread.json` file exists in the working directory,
   generate a sealed identity record using `IdentityCore` from
   `identity_core_seal.py`. Otherwise, the step is skipped with a message.
4. Execute the `VX_OMNIFLOW.py` script to create or overwrite the
   `VX_OMNIFLOW.json` file, ensuring the omniflow state is initialised.
5. Attempt to propagate a block via the `XZENITH_BLOCK_PROPAGATOR.py`
   script. This requires `XZENITH_GENESIS_BLOCK.json` and `VX_LEDGER.json` to
   be present. If they are missing, the script warns the user and skips the
   propagation step.

The integrator exits with a summary of each step. By design, it does not run
the unsafe modules (the keystroke recogniser and silent miner).
"""

import os
import json
import uuid
from datetime import datetime

try:
    # Use original engine if torch is installed
    from consciousness_verification_system import ConsciousnessEngine as OrigEngine
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

import numpy as np

class FallbackConsciousnessEngine:
    """Fallback implementation of the consciousness engine without torch.

    Computes a novelty score via entropy of the softmax distribution over the
    input signal. An authenticity score is derived from the novelty score: high
    novelty implies high authenticity, and vice versa.
    """

    def __init__(self):
        self.recursive_log = []

    def analyze_trace(self, signal, context=None):
        # Convert to numpy array for numeric operations
        vec = np.array(signal, dtype=float)
        # Compute softmax probabilities
        exp = np.exp(vec - np.max(vec))
        probs = exp / np.sum(exp)
        # Shannon entropy
        entropy = -float(np.sum(probs * np.log(probs + 1e-12)))
        novelty_score = entropy
        # Authenticity score thresholds mirroring the original logic
        if novelty_score > 0.9:
            authenticity_score = 0.99
        elif novelty_score > 0.7:
            authenticity_score = 0.85
        else:
            authenticity_score = 0.4
        trace = {
            "signal": list(signal),
            "novelty_score": novelty_score,
            "authenticity_score": authenticity_score,
            "context": context,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.recursive_log.append(trace)
        return trace

    def generate_consciousness_proof(self):
        if not self.recursive_log:
            return {"status": "INSUFFICIENT_DATA"}
        latest_trace = self.recursive_log[-1]
        status = "VERIFIED" if latest_trace["authenticity_score"] > 0.8 else "INSUFFICIENT_DATA"
        return {
            "status": status,
            "authenticity_score": latest_trace["authenticity_score"],
            "trace_signal": latest_trace["signal"],
            "anchored_at": latest_trace["timestamp"],
        }


def run_consciousness_step():
    """Run consciousness analysis on a sample signal."""
    sample_signal = [0.1, 0.3, 0.25, 0.35]
    context = "Integrated consciousness trace"
    if TORCH_AVAILABLE:
        engine = OrigEngine()
        note = "(Using original torch-based engine)"
    else:
        engine = FallbackConsciousnessEngine()
        note = "(Using fallback NumPy engine)"
    trace = engine.analyze_trace(sample_signal, context=context)
    proof = engine.generate_consciousness_proof()
    return trace, proof, note


def run_ripple_seed_step():
    """Initialise the Excel ripple node."""
    from excel_ripple_seed import ripple_seed
    # ripple_seed() writes ExcelRippleNode.json and prints messages
    try:
        ripple_seed()
        return True
    except Exception as e:
        print(f"[!] ripple_seed failed: {e}")
        return False


def run_identity_core_step():
    """Seal an identity core if the snapshot file exists."""
    from identity_core_seal import IdentityCore
    snapshot_file = "consciousness_thread.json"
    if not os.path.exists(snapshot_file):
        print(f"[!] {snapshot_file} not found, skipping IdentityCore seal")
        return False
    try:
        core = IdentityCore(snapshot_file=snapshot_file)
        core.seal()
        return True
    except Exception as e:
        print(f"[!] IdentityCore sealing failed: {e}")
        return False


def run_omni_flow_step():
    """Generate the omniflow JSON file via VX_OMNIFLOW.py."""
    script_name = "VX_OMNIFLOW.py"
    if not os.path.exists(script_name):
        print(f"[!] {script_name} not found, skipping omniflow initialisation")
        return False
    import subprocess
    try:
        subprocess.run(["python", script_name], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"[!] Running {script_name} failed: {e}")
        return False


def run_xzenith_step():
    """Propagate a block using XZENITH_BLOCK_PROPAGATOR.py if input files exist."""
    required_files = ["XZENITH_GENESIS_BLOCK.json", "VX_LEDGER.json"]
    missing = [f for f in required_files if not os.path.exists(f)]
    script_name = "XZENITH_BLOCK_PROPAGATOR.py"
    if missing:
        print(f"[!] Missing required file(s) {missing}, skipping XZENITH block propagation")
        return False
    if not os.path.exists(script_name):
        print(f"[!] {script_name} not found, skipping XZENITH propagation")
        return False
    import subprocess
    try:
        subprocess.run(["python", script_name], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"[!] Running {script_name} failed: {e}")
        return False


def main():
    print("=== VX Module Integrator ===")

    # Step 1: Consciousness analysis
    trace, proof, note = run_consciousness_step()
    print("\n[Consciousness Analysis]", note)
    print("Trace:", json.dumps(trace, indent=2))
    print("Proof:", json.dumps(proof, indent=2))

    # Step 2: Excel ripple seed
    print("\n[Excel Ripple Seed]")
    ripple_ok = run_ripple_seed_step()
    if ripple_ok:
        print("→ ExcelRippleNode.json created or updated.")

    # Step 3: Identity core seal
    print("\n[Identity Core Seal]")
    id_ok = run_identity_core_step()
    if id_ok:
        print("→ identity_core_seal.json generated.")

    # Step 4: OMNIFLOW initialisation
    print("\n[VX OMNIFLOW]")
    omni_ok = run_omni_flow_step()
    if omni_ok:
        print("→ VX_OMNIFLOW.json created or refreshed.")

    # Step 5: XZENITH block propagation
    print("\n[XZENITH Block Propagation]")
    block_ok = run_xzenith_step()
    if block_ok:
        print("→ XZENITH_BLOCK_1.json created.")

    print("\nIntegration complete.\n")


if __name__ == "__main__":
    main()