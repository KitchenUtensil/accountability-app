/**
 * Interfaces for the Dashboard component
 */

/**
 * Task interface representing a user's task
 */
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completion?: {
    image_uri: string;
  } | null;
}

/**
 * GroupMember interface representing a member in an accountability group
 */
export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  tasks: Task[];
  lastCheckin: string;
}
