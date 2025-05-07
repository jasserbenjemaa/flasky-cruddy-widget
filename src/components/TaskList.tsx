
import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { getTasks, deleteTask, toggleTaskCompletion } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';
import TaskDialog from './TaskDialog';

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(false);
  const { toast } = useToast();

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      toast({
        title: 'Task Deleted',
        description: 'Task has been successfully deleted.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle task completion toggle
  const handleToggleCompletion = async (task: Task) => {
    try {
      const updatedTask = await toggleTaskCompletion(task);
      setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
      toast({
        title: updatedTask.completed ? 'Task Completed' : 'Task Reopened',
        description: updatedTask.completed 
          ? 'Task has been marked as complete.' 
          : 'Task has been reopened.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Open dialog to edit a task
  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setIsDialogOpen(true);
  };

  // Open dialog to create a new task
  const openNewTaskDialog = () => {
    setSelectedTask(null);
    setIsNewTask(true);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = (refreshNeeded: boolean) => {
    setIsDialogOpen(false);
    if (refreshNeeded) {
      fetchTasks();
    }
  };

  // Get priority color class
  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-task-low';
      case 'medium':
        return 'bg-task-medium';
      case 'high':
        return 'bg-task-high';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="text-lg font-medium text-red-500">{error}</div>
        <Button onClick={fetchTasks}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Button onClick={openNewTaskDialog} className="flex items-center gap-2">
          <Plus size={18} /> Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600">No tasks yet</h2>
          <p className="text-gray-500 mt-2">Create your first task to get started.</p>
          <Button onClick={openNewTaskDialog} className="mt-4">Create Task</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`shadow-md animate-slide-in ${
                task.completed ? 'opacity-70' : ''
              }`}
            >
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => handleToggleCompletion(task)}
                    className="mt-1"
                  />
                  <div>
                    <CardTitle className={task.completed ? 'line-through text-gray-500' : ''}>
                      {task.title}
                    </CardTitle>
                    <div className="flex items-center mt-1">
                      <span 
                        className={`${getPriorityColorClass(task.priority)} px-2 py-1 rounded-full text-white text-xs`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className={`text-gray-600 ${task.completed ? 'text-gray-400' : ''}`}>
                  {task.description || 'No description provided.'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(task)}>
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        task={selectedTask}
        isNew={isNewTask}
      />
    </div>
  );
};

export default TaskList;
