import { Candidate, JobVacancy } from '../types';

/**
 * Calculates matching score based on skill match ratio.
 * Returns percentage (0 to 100)
 */
export function calculateMatchingScore(candidateSkills: string[], jobRequirements: string[]): number {
  if (jobRequirements.length === 0) return 100;
  const matchCount = candidateSkills.filter(skill =>
    jobRequirements.some(req => req.toLowerCase() === skill.toLowerCase())
  ).length;

  return Math.round((matchCount / jobRequirements.length) * 100);
}

/**
 * Extracts candidate skills from a resume filename.
 * Returns extracted candidate skills.
 */
export function parseResumeSkills(fileName: string): string[] {
  const fileLower = fileName.toLowerCase();
  if (fileLower.includes('front')) {
    return ['React', 'TypeScript', 'CSS', 'HTML', 'Tailwind CSS'];
  } else if (fileLower.includes('back')) {
    return ['Node.js', 'Express', 'SQL', 'TypeScript', 'Docker'];
  } else if (fileLower.includes('design')) {
    return ['Figma', 'UI/UX', 'CSS', 'Photoshop'];
  }
  return ['Communication', 'Teamwork'];
}
