export class IdeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class CircularDependencyError extends IdeeError {
  public readonly unresolvedIds: string[];

  constructor(unresolvedIds: string[]) {
    super(
      `Circular dependency detected in package graph. Unresolved package IDs: ${unresolvedIds.join(', ')}`
    );
    this.unresolvedIds = unresolvedIds;
  }
}

export class LockedFieldViolationError extends IdeeError {
  public readonly packageId: string;
  public readonly field: string;
  public readonly baselineValue: unknown;
  public readonly overrideValue: unknown;

  constructor(packageId: string, field: string, baselineValue: unknown, overrideValue: unknown) {
    super(
      `Cannot override locked field "${field}" for package "${packageId}". Baseline value: ${JSON.stringify(
        baselineValue
      )}, Override attempted: ${JSON.stringify(overrideValue)}.`
    );
    this.packageId = packageId;
    this.field = field;
    this.baselineValue = baselineValue;
    this.overrideValue = overrideValue;
  }
}

export class MissingDependencyError extends IdeeError {
  public readonly packageId: string;
  public readonly missingDependencyId: string;

  constructor(packageId: string, missingDependencyId: string) {
    super(
      `Package "${packageId}" specifies non-existent dependency "${missingDependencyId}".`
    );
    this.packageId = packageId;
    this.missingDependencyId = missingDependencyId;
  }
}

export class ConfigValidationError extends IdeeError {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Configuration validation failed:\n- ${errors.join('\n- ')}`);
    this.errors = errors;
  }
}
