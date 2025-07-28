import React from "react";
import TaskList from "../../pages/Tasks/TaskList";
import TaskAssignment from "../../pages/Tasks/TaskAssignment";

const TaskContext = () => {
  return (
    <div>
      <h2 className="mb-4">Task List</h2>
      <TaskAssignment />
      <TaskList />
    </div>
  );
};

export default TaskContext;