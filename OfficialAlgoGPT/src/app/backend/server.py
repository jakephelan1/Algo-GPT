from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import threading
import time
from utils import get_slides
from constants import SOLN, DESC

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Global list to store slides
slides_cache = []

def generate_slides_in_background(description, solution):
    """Generates slides asynchronously and stores them in the global list."""
    global slides_cache
    slides_cache.clear()  # Clear previous slides before generating new ones

    for slide in get_slides(description, solution):
        slides_cache.append(slide)  # Append new slides as they are generated
        time.sleep(1)  # Simulate delay for async effect

    slides_cache.append("DONE")

@app.route("/get_solution", methods=["POST"])
def get_solution():
    """Returns solution immediately and starts generating slides asynchronously."""
    data = request.get_json()
    problem_id = str(data.get("problemNumber"))

    if not problem_id:
        return jsonify({"error": "Invalid or missing problem number"}), 400

    solution = SOLN[problem_id]  
    description = DESC[problem_id]

    # Start slide generation in a separate thread
    threading.Thread(target=generate_slides_in_background, args=(description, solution), daemon=True).start()

    return jsonify({"solution": solution})  # ✅ Chatbot gets response immediately!

@app.route("/get_slides", methods=["GET"])
def get_slides_stream():
    """Streams slides as they are generated in real-time."""
    def stream_slides():
        sent_slides = 0
        while True:
            if sent_slides < len(slides_cache):
                yield f"{slides_cache[sent_slides]}\n"
                sent_slides += 1
            else:
                if "DONE" in slides_cache:
                    break
                time.sleep(0.5)

    return Response(stream_slides(), content_type="application/json")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
