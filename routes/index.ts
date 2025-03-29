// Auth routes
export { default as login } from "./auth/login";
export { default as validateSession } from "./auth/session";
export { default as logout } from "./auth/logout";

// User routes
export { default as getAllUsers } from "./users/all";
export { default as getUser } from "./users/get";
export { default as deleteUser } from "./users/delete";
export { default as changePassword } from "./users/change-password";
export { default as toggleAdmin } from "./users/toggle-admin";
export { default as register } from "./users/register";

// Competition routes
export { default as createCompetition } from "./competitions/create";
export { default as getCompetition } from "./competitions/get";
export { default as deleteCompetition } from "./competitions/delete";
export { default as editCompetition } from "./competitions/edit";
export { default as lockCompetition } from "./competitions/toggle-lock";
export { default as competitionResults } from "./competitions/results";
export { default as results } from "./competitions/results-excel";

// Solves routes
export { default as addSolve } from "./solves/add";
export { default as deleteSolve } from "./solves/delete";
export { default as getSolve } from "./solves/get";

// Posts routes
export { default as newPost } from "./posts/new";
export { default as getPost } from "./posts/get";
export { default as deletePost } from "./posts/delete";
export { default as editPost } from "./posts/edit";

// Other routes
export { default as healthCheck } from "./system/health";
export { default as backup } from "./system/backup";
