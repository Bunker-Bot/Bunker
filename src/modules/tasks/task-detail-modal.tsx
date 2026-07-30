import React from 'react';
import type { TaskItem } from '../../lib/repositories/task.repository';
import { TaskDetailDrawer } from './task-detail-drawer';

interface TaskDetailModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onEdit?: (task: TaskItem) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
}) => {
  return (
    <TaskDetailDrawer
      taskId={task?.id || null}
      isOpen={!!task}
      onClose={onClose}
    />
  );
};

