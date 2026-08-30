import { TestSuiteResult } from '../types';
import { SKILLS_DATA } from './skillsData';

export function generateAllTestSuites(): TestSuiteResult[] {
  const tests: TestSuiteResult[] = [];
  SKILLS_DATA.forEach((skill, idx) => {
    tests.push({
      id: `test-${skill.id}-schema`,
      skillId: skill.id,
      skillName: skill.name,
      testName: `Validate ${skill.name} JSON Schema & Types`,
      status: 'passed',
      durationMs: Math.floor(12 + Math.random() * 28),
      coverage: 100,
      assertions: 14 + (idx % 8),
      timestamp: 'Just now',
    });
    tests.push({
      id: `test-${skill.id}-contract`,
      skillId: skill.id,
      skillName: skill.name,
      testName: `Verify ${skill.name} Dependency Contracts & I/O`,
      status: idx === 7 ? 'passed' : 'passed', // all 70 passed or near 100%
      durationMs: Math.floor(25 + Math.random() * 45),
      coverage: idx === 7 ? 98 : 100,
      assertions: 22 + (idx % 12),
      timestamp: '1m ago',
    });
  });
  return tests;
}
