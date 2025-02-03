export default {
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest', // Use Babel to transform files
  },
  testEnvironment: 'node', // Sets the environment for Node.js
};
