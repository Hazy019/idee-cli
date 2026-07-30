import { Package } from './schema.js';
import { CircularDependencyError, MissingDependencyError } from './errors.js';

export interface DAGResult {
  executionOrder: Package[];
}

export function sortPackagesTopologically(packages: Package[]): Package[] {
  if (packages.length === 0) {
    return [];
  }

  const packageMap = new Map<string, Package>();
  const indegreeMap = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const pkg of packages) {
    packageMap.set(pkg.id, pkg);
    indegreeMap.set(pkg.id, 0);
    graph.set(pkg.id, []);
  }

  for (const pkg of packages) {
    if (pkg.dependsOn) {
      for (const depId of pkg.dependsOn) {
        if (!packageMap.has(depId)) {
          throw new MissingDependencyError(pkg.id, depId);
        }
        graph.get(depId)!.push(pkg.id);
        indegreeMap.set(pkg.id, (indegreeMap.get(pkg.id) || 0) + 1);
      }
    }
  }

  const initialEligible = packages.filter((pkg) => indegreeMap.get(pkg.id) === 0);

  const eligibleQueue: Package[] = [...initialEligible];
  const sorted: Package[] = [];

  while (eligibleQueue.length > 0) {
    const current = eligibleQueue.shift()!;
    sorted.push(current);

    const dependents = graph.get(current.id) || [];
    for (const dependentId of dependents) {
      const currentIndegree = indegreeMap.get(dependentId)! - 1;
      indegreeMap.set(dependentId, currentIndegree);

      if (currentIndegree === 0) {
        const dependentPackage = packageMap.get(dependentId)!;
        eligibleQueue.push(dependentPackage);
      }
    }
  }

  if (sorted.length !== packages.length) {
    const unresolvedNodeIds = packages
      .filter((pkg) => (indegreeMap.get(pkg.id) || 0) > 0)
      .map((pkg) => pkg.id);
    throw new CircularDependencyError(unresolvedNodeIds);
  }

  return sorted;
}
