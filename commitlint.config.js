export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      ['shared', 'landing', 'lab-reports', 'games', '1-ar', '2-ar', '3-ar', 'server', 'tools', 'ci', 'deps', 'config'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
  },
};
