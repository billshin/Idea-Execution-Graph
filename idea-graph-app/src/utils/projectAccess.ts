import type { IdeaProject, ProjectAccessMode } from '../types/graph'
import { matchesPasswordHash } from './passwords'

export function hasProtectedPassword(project: IdeaProject): boolean {
  return Boolean(project.snapshot.ideaSpace.password)
}

export function resolveDefaultProjectAccessMode(project: IdeaProject): ProjectAccessMode {
  return project.snapshot.ideaSpace.readOnly ? 'read-only' : 'edit'
}

export async function resolveProjectAccessModeFromPassword(
  project: IdeaProject,
  password: string,
): Promise<ProjectAccessMode | null> {
  if (await matchesPasswordHash(password, project.snapshot.ideaSpace.password)) {
    // Single password always grants edit mode.
    // Without password, mode is resolved from readOnly/public settings.
    return 'edit'
  }

  return null
}
