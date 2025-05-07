
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFormData } from '@/types/task';

export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      priority: item.priority as 'low' | 'medium' | 'high',
      completed: item.completed
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      priority: data.priority as 'low' | 'medium' | 'high',
      completed: data.completed
    };
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    throw error;
  }
};

export const createTask = async (taskData: TaskFormData): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      priority: data.priority as 'low' | 'medium' | 'high',
      completed: data.completed
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      priority: data.priority as 'low' | 'medium' | 'high',
      completed: data.completed
    };
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<{ message: string }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { message: 'Task deleted successfully' };
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
};

export const toggleTaskCompletion = async (task: Task): Promise<Task> => {
  return updateTask(task.id, { completed: !task.completed });
};
