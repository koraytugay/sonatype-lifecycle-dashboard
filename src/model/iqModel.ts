export interface PolicyViolationResponseDto {
  aaData: AaDatum[];
}

export interface AaDatum {
  hash: string;
  componentIdentifier: ComponentIdentifier;
  activeViolations: PolicyViolation[];
  waivedViolations: PolicyViolation[];
  allViolations: PolicyViolation[];
}

export interface PolicyViolation {
  policyThreatLevel: number;
  waived: boolean;
  legacyViolation: boolean;
  policyThreatCategory: string;
}

export interface ComponentIdentifier {
  format: string;
  coordinates: Coordinates;
}

export interface Coordinates {
  name: string;
  version: string;
  artifactId: string;
  packageId: string;
}
