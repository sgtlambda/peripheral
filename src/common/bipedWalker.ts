/**
 * 2D Vector type
 */
export type Vec2 = {
  x: number;
  y: number;
};

/**
 * Configuration for the bipedal walker
 */
export type BipedWalkerConfig = {
  /** Width between feet at rest */
  footSpacing: number;
  /** Height of body above feet */
  bodyHeight: number;
  /** Body radius for rendering */
  bodyRadius: number;
  /** Head radius */
  headRadius: number;
  /** Foot radius for rendering */
  footRadius: number;
  /** Distance between steps */
  strideLength: number;
  /** How high foot lifts during step */
  stepHeight: number;
};

/**
 * State of a single foot
 */
export type FootState = {
  position: Vec2;
  targetPosition: Vec2; // Where the foot is trying to reach
  grounded: boolean;
  terrainAngle: number; // Angle of terrain at foot position (radians)
};

/**
 * Complete state of the biped for rendering
 */
export type BipedState = {
  /** Body center position */
  bodyCenter: Vec2;
  /** Head center position */
  headCenter: Vec2;
  /** Left foot state */
  leftFoot: FootState;
  /** Right foot state */
  rightFoot: FootState;
  /** Current walk cycle phase (0-1) */
  walkPhase: number;
  /** Is character in the air */
  isInAir: boolean;
};

const DEFAULT_CONFIG: BipedWalkerConfig = {
  footSpacing: 20,
  bodyHeight: 50,
  bodyRadius: 18,
  headRadius: 12,
  footRadius: 8,
  strideLength: 40,
  stepHeight: 20,
};

/**
 * Bipedal walking character with simple foot placement.
 * Feet snap to terrain and render as half-circles matching terrain angle.
 */
export class BipedWalker {
  private config: BipedWalkerConfig;
  private walkPhase: number = 0;
  private position: Vec2;
  
  // Foot positions
  private leftFootPos: Vec2;
  private rightFootPos: Vec2;
  
  // Foot target positions (where feet are trying to reach)
  private leftFootTarget: Vec2;
  private rightFootTarget: Vec2;
  
  // Terrain angles at foot positions
  private leftFootAngle: number = 0;
  private rightFootAngle: number = 0;
  
  // Track world offset for foot positioning
  private worldOffset: number = 0;
  
  // Walking direction: 1 = forward (right), -1 = backward (left)
  private walkDirection: number = 1;
  
  // Jump state
  private jumpOffset: number = 0;
  private isInAir: boolean = false;
  private wasInAir: boolean = false;
  
  // Landing state - pause walk cycle briefly after landing
  private landingTimer: number = 0;
  private readonly LANDING_DURATION: number = 0.15;
  
  // Terrain snap threshold
  private readonly SNAP_THRESHOLD: number = 15;

  constructor(
    startPosition: Vec2,
    config: Partial<BipedWalkerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.position = { ...startPosition };
    
    // Initialize feet at starting position
    this.leftFootPos = {
      x: this.position.x - this.config.footSpacing / 2,
      y: this.position.y + this.config.bodyHeight,
    };
    this.rightFootPos = {
      x: this.position.x + this.config.footSpacing / 2,
      y: this.position.y + this.config.bodyHeight,
    };
    this.leftFootTarget = { ...this.leftFootPos };
    this.rightFootTarget = { ...this.rightFootPos };
  }

  /**
   * Update the walker state.
   */
  update(
    deltaTime: number,
    getGroundHeight: (x: number) => number,
    getTerrainAngle: (x: number) => number,
    scrollSpeed: number = 100
  ): void {
    // Update world offset based on scroll
    this.worldOffset += scrollSpeed * deltaTime;
    
    // Track walking direction
    if (scrollSpeed !== 0) {
      this.walkDirection = scrollSpeed > 0 ? 1 : -1;
    }
    
    // Update landing timer
    if (this.landingTimer > 0) {
      this.landingTimer -= deltaTime;
    }
    
    // Only progress walk phase when not in air and not landing
    const isLanding = this.landingTimer > 0;
    if (!this.isInAir && !isLanding) {
      const stepsPerSecond = Math.abs(scrollSpeed) / this.config.strideLength;
      this.walkPhase = (this.walkPhase + stepsPerSecond * deltaTime) % 1;
    }
    
    // Get ground height at character position
    const groundHeight = getGroundHeight(this.position.x + this.worldOffset);
    
    // Position character on ground
    this.position.y = groundHeight - this.config.bodyHeight * 0.9;
    
    // Update foot positions
    this.updateFootPositions(getGroundHeight, getTerrainAngle);
  }

  /**
   * Update foot positions based on walk cycle
   */
  private updateFootPositions(
    getGroundHeight: (x: number) => number,
    getTerrainAngle: (x: number) => number
  ): void {
    const { footSpacing } = this.config;
    
    // Phase offset for each leg (opposite phase)
    const leftPhase = this.walkPhase;
    const rightPhase = (this.walkPhase + 0.5) % 1;
    
    // Calculate foot targets
    this.leftFootTarget = this.calculateFootTarget(leftPhase, -footSpacing / 2, getGroundHeight);
    this.rightFootTarget = this.calculateFootTarget(rightPhase, footSpacing / 2, getGroundHeight);
    
    // Smoothly move feet towards targets
    this.leftFootPos = this.smoothFootMove(this.leftFootPos, this.leftFootTarget, leftPhase, getGroundHeight);
    this.rightFootPos = this.smoothFootMove(this.rightFootPos, this.rightFootTarget, rightPhase, getGroundHeight);
    
    // Update terrain angles at foot positions
    this.leftFootAngle = getTerrainAngle(this.leftFootPos.x + this.worldOffset);
    this.rightFootAngle = getTerrainAngle(this.rightFootPos.x + this.worldOffset);
  }

  /**
   * Calculate foot target position for a given phase
   */
  private calculateFootTarget(
    phase: number,
    footOffset: number,
    getGroundHeight: (x: number) => number
  ): Vec2 {
    const { strideLength, stepHeight, bodyHeight } = this.config;
    
    // When in the air, tuck feet up
    if (this.isInAir) {
      const tuckAmount = Math.min(1, Math.abs(this.jumpOffset) / 50);
      return {
        x: this.position.x + footOffset - this.walkDirection * 8 * tuckAmount,
        y: this.position.y + this.jumpOffset + bodyHeight * (0.7 - 0.2 * tuckAmount),
      };
    }
    
    // When landing, plant feet directly below body
    const isLanding = this.landingTimer > 0;
    if (isLanding) {
      const footX = this.position.x + footOffset;
      const groundY = getGroundHeight(footX + this.worldOffset);
      return { x: footX, y: groundY };
    }
    
    // Normal walking
    // During stance (half cycle), terrain moves strideLength/2, so foot should too
    // Using 0.25 multiplier means foot moves from +strideLength/4 to -strideLength/4
    // = strideLength/2 total, matching terrain movement
    let xOffset: number;
    let yLift: number;
    
    if (phase < 0.5) {
      // Stance phase - foot on ground, moves with terrain
      const stanceProgress = phase / 0.5;
      xOffset = strideLength * 0.25 * (1 - 2 * stanceProgress) * this.walkDirection;
      yLift = 0;
    } else {
      // Swing phase - foot lifted, swings forward
      const swingProgress = (phase - 0.5) / 0.5;
      xOffset = strideLength * 0.25 * (-1 + 2 * swingProgress) * this.walkDirection;
      yLift = -stepHeight * Math.sin(swingProgress * Math.PI);
    }
    
    const footX = this.position.x + footOffset + xOffset;
    const groundY = getGroundHeight(footX + this.worldOffset);
    
    return {
      x: footX,
      y: groundY + yLift,
    };
  }

  /**
   * Smooth foot movement with terrain snapping
   */
  private smoothFootMove(
    current: Vec2,
    target: Vec2,
    phase: number,
    getGroundHeight: (x: number) => number
  ): Vec2 {
    // During landing, snap quickly
    const isLanding = this.landingTimer > 0;
    if (isLanding) {
      return {
        x: current.x + (target.x - current.x) * 0.5,
        y: current.y + (target.y - current.y) * 0.5,
      };
    }
    
    // Smoothing factor
    const isSwing = phase >= 0.5;
    const smoothing = isSwing ? 0.3 : 0.1;
    
    let newX = current.x + (target.x - current.x) * smoothing;
    let newY = current.y + (target.y - current.y) * smoothing;
    
    // Snap to terrain if close (and not in air)
    if (!this.isInAir) {
      const groundY = getGroundHeight(newX + this.worldOffset);
      const distanceToGround = newY - groundY;
      
      if (distanceToGround >= 0 && distanceToGround < this.SNAP_THRESHOLD) {
        // Snap to ground
        newY = groundY;
      }
    }
    
    return { x: newX, y: newY };
  }

  /**
   * Get current state for rendering
   */
  getState(): BipedState {
    const { bodyHeight, bodyRadius, headRadius } = this.config;
    
    // Apply jump offset to body position
    const bodyY = this.position.y + this.jumpOffset;
    
    const bodyCenter: Vec2 = {
      x: this.position.x,
      y: bodyY,
    };
    
    const headCenter: Vec2 = {
      x: this.position.x,
      y: bodyY - bodyRadius - headRadius - 4,
    };
    
    // Determine if feet are grounded based on phase
    const leftPhase = this.walkPhase;
    const rightPhase = (this.walkPhase + 0.5) % 1;
    
    return {
      bodyCenter,
      headCenter,
      leftFoot: {
        position: { ...this.leftFootPos },
        targetPosition: { ...this.leftFootTarget },
        grounded: !this.isInAir && leftPhase < 0.5,
        terrainAngle: this.leftFootAngle,
      },
      rightFoot: {
        position: { ...this.rightFootPos },
        targetPosition: { ...this.rightFootTarget },
        grounded: !this.isInAir && rightPhase < 0.5,
        terrainAngle: this.rightFootAngle,
      },
      walkPhase: this.walkPhase,
      isInAir: this.isInAir,
    };
  }

  /**
   * Get configuration
   */
  getConfig(): BipedWalkerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<BipedWalkerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current world offset
   */
  getWorldOffset(): number {
    return this.worldOffset;
  }

  /**
   * Reset walker to initial state
   */
  reset(position: Vec2): void {
    this.position = { ...position };
    this.walkPhase = 0;
    this.worldOffset = 0;
    this.jumpOffset = 0;
    this.isInAir = false;
    this.wasInAir = false;
    this.landingTimer = 0;
    
    this.leftFootPos = {
      x: position.x - this.config.footSpacing / 2,
      y: position.y + this.config.bodyHeight,
    };
    this.rightFootPos = {
      x: position.x + this.config.footSpacing / 2,
      y: position.y + this.config.bodyHeight,
    };
    this.leftFootTarget = { ...this.leftFootPos };
    this.rightFootTarget = { ...this.rightFootPos };
    this.leftFootAngle = 0;
    this.rightFootAngle = 0;
  }

  /**
   * Set vertical jump offset (negative = up)
   */
  setJumpOffset(offset: number): void {
    this.wasInAir = this.isInAir;
    this.jumpOffset = offset;
    this.isInAir = offset < -5;
    
    // Detect landing
    if (this.wasInAir && !this.isInAir) {
      this.landingTimer = this.LANDING_DURATION;
    }
  }

  /**
   * Get current jump offset
   */
  getJumpOffset(): number {
    return this.jumpOffset;
  }

  /**
   * Check if character is in the air
   */
  getIsInAir(): boolean {
    return this.isInAir;
  }

  /**
   * Check if character is landing
   */
  getIsLanding(): boolean {
    return this.landingTimer > 0;
  }
}
