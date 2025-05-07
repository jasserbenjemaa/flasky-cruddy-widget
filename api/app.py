
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# In-memory database for demonstration
tasks = [
    {
        "id": "1",
        "title": "Complete project proposal",
        "description": "Finish the initial draft of the project proposal",
        "priority": "high",
        "completed": False
    },
    {
        "id": "2",
        "title": "Schedule team meeting",
        "description": "Coordinate with team members for weekly sync-up",
        "priority": "medium",
        "completed": True
    },
    {
        "id": "3",
        "title": "Research new technologies",
        "description": "Look into trending technologies for next quarter",
        "priority": "low",
        "completed": False
    }
]

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = next((task for task in tasks if task['id'] == task_id), None)
    if task:
        return jsonify(task)
    abort(404, description="Task not found")

@app.route('/api/tasks', methods=['POST'])
def create_task():
    if not request.json or 'title' not in request.json:
        abort(400, description="Title is required")
    
    task = {
        'id': str(uuid.uuid4()),
        'title': request.json['title'],
        'description': request.json.get('description', ''),
        'priority': request.json.get('priority', 'medium'),
        'completed': False
    }
    tasks.append(task)
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    task = next((task for task in tasks if task['id'] == task_id), None)
    if not task:
        abort(404, description="Task not found")
    
    if not request.json:
        abort(400, description="No data provided")
    
    if 'title' in request.json:
        task['title'] = request.json['title']
    if 'description' in request.json:
        task['description'] = request.json['description']
    if 'priority' in request.json:
        task['priority'] = request.json['priority']
    if 'completed' in request.json:
        task['completed'] = request.json['completed']
    
    return jsonify(task)

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    task = next((task for task in tasks if task['id'] == task_id), None)
    if not task:
        abort(404, description="Task not found")
    
    tasks = [t for t in tasks if t['id'] != task_id]
    return jsonify({"message": "Task deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True)
