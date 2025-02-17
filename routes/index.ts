// routes/index.ts

export { default as register } from "./users/register";
export { default as login } from "./users/login";
export { default as assign } from "./admin/assign";
export { default as addSolve } from "./solves/add";
export { default as deleteSolve } from "./solves/delete";
export { default as getSolve } from "./solves/get";
export { default as getAllUsers } from "./users/all";
export { default as getUser } from "./users/get";
export { default as deleteUser } from "./users/delete";
export { default as changePassword } from "./users/change-password";
export { default as newPost } from "./posts/new";
export { default as getPost } from "./posts/get";
export { default as deletePost } from "./posts/delete";
export { default as editPost } from "./posts/edit";
export { default as results } from "./excel/results";
export { default as validateToken } from "./token/validate";
export { default as healthCheck } from "./health_check/health_check";
export { default as createCompetition } from "./competitions/create";
export { default as getCompetition } from "./competitions/get";
export { default as deleteCompetition } from "./competitions/delete";
export { default as editCompetition } from "./competitions/edit";
export { default as lockCompetition } from "./competitions/lock";
export { default as competitionResults } from "./competitions/results";
export { default as backup } from "./backup/get";
