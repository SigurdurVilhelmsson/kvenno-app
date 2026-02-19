import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type {
  ParticleSimulationProps,
  Particle,
  ParticleType,
  PhysicsConfig,
  ReactionConfig
} from './types';

const DEFAULT_PHYSICS: PhysicsConfig = {
  speedMultiplier: 1,
  enableCollisions: false,
  gravity: 0,
  friction: 0,
  activationEnergy: 0
};

/**
 * ParticleSimulation - A reusable canvas-based particle simulation component
 *
 * Features:
 * - Multiple particle types with configurable appearance
 * - Temperature-based particle speed
 * - Wall collisions with elastic bouncing
 * - Optional particle-particle collisions
 * - Optional chemical reactions on collision
 * - Region highlights for activation energy visualization
 *
 * Usage:
 * ```tsx
 * <ParticleSimulation
 *   container={{ width: 400, height: 300 }}
 *   particleTypes={[{ id: 'gas', color: '#3b82f6' }]}
 *   particles={[{ typeId: 'gas', count: 50 }]}
 *   temperature={300}
 *   running={true}
 * />
 * ```
 */
export const ParticleSimulation: React.FC<ParticleSimulationProps> = ({
  container,
  particleTypes,
  particles: initialParticles,
  physics = DEFAULT_PHYSICS,
  reactions = [],
  regions = [],
  running = true,
  temperature = 300,
  onParticleCountChange,
  onFrame,
  showLabels = false,
  showVelocityVectors = false,
  ariaLabel = 'Particle simulation',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [particleCounts, setParticleCounts] = useState<Record<string, number>>({});

  const { width, height } = container;
  const borderColor = container.borderColor || getBorderColorFromPressure(container.pressure);
  const borderWidth = container.borderWidth || getBorderWidthFromPressure(container.pressure);
  const backgroundColor = container.backgroundColor || '#1e293b';

  // Create particle type lookup
  const typeMap = useMemo(() => {
    const map = new Map<string, ParticleType>();
    particleTypes.forEach(type => map.set(type.id, type));
    return map;
  }, [particleTypes]);

  // Calculate speed from temperature (kinetic theory: KE = 3/2 kT)
  const getSpeedFromTemperature = useCallback((temp: number, mass: number = 1) => {
    // Simplified: speed proportional to sqrt(T/m)
    const baseSpeed = Math.sqrt(temp / 100) * (physics.speedMultiplier || 1);
    return baseSpeed / Math.sqrt(mass);
  }, [physics.speedMultiplier]);

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    let idCounter = 0;

    initialParticles.forEach(group => {
      const type = typeMap.get(group.typeId);
      if (!type) return;

      const radius = type.radius || 4;
      const speed = group.initialSpeed ?? getSpeedFromTemperature(temperature, type.mass || 1);

      const spawnRegion = group.spawnRegion || {
        xMin: radius,
        xMax: width - radius,
        yMin: radius,
        yMax: height - radius
      };

      for (let i = 0; i < group.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const x = spawnRegion.xMin! + Math.random() * (spawnRegion.xMax! - spawnRegion.xMin!);
        const y = spawnRegion.yMin! + Math.random() * (spawnRegion.yMax! - spawnRegion.yMin!);

        newParticles.push({
          id: `p-${idCounter++}`,
          typeId: group.typeId,
          x: Math.max(radius, Math.min(width - radius, x)),
          y: Math.max(radius, Math.min(height - radius, y)),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          color: type.color,
          strokeColor: type.strokeColor,
          mass: type.mass || 1,
          energy: 0.5 * (type.mass || 1) * speed * speed
        });
      }
    });

    particlesRef.current = newParticles;
    updateParticleCounts();
  }, [initialParticles, typeMap, temperature, width, height, getSpeedFromTemperature]);

  // Update particle counts
  const updateParticleCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    particlesRef.current.forEach(p => {
      counts[p.typeId] = (counts[p.typeId] || 0) + 1;
    });
    setParticleCounts(counts);
    onParticleCountChange?.(counts);
  }, [onParticleCountChange]);

  // Check for particle-particle collision
  const checkCollision = useCallback((p1: Particle, p2: Particle): boolean => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < p1.radius + p2.radius;
  }, []);

  // Resolve elastic collision between two particles
  const resolveCollision = useCallback((p1: Particle, p2: Particle) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    // Normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = p1.vx - p2.vx;
    const dvy = p1.vy - p2.vy;
    const dvn = dvx * nx + dvy * ny;

    // Don't resolve if particles are moving apart
    if (dvn < 0) return;

    // Conservation of momentum (elastic collision)
    const m1 = p1.mass;
    const m2 = p2.mass;
    const factor = (2 * dvn) / (m1 + m2);

    p1.vx -= factor * m2 * nx;
    p1.vy -= factor * m2 * ny;
    p2.vx += factor * m1 * nx;
    p2.vy += factor * m1 * ny;

    // Separate particles to prevent overlap
    const overlap = (p1.radius + p2.radius - distance) / 2;
    p1.x -= overlap * nx;
    p1.y -= overlap * ny;
    p2.x += overlap * nx;
    p2.y += overlap * ny;
  }, []);

  // Check and process reactions
  const processReaction = useCallback((p1: Particle, p2: Particle, reaction: ReactionConfig): boolean => {
    // Check if this is the right reaction
    const [r1, r2] = reaction.reactants;
    const match = (p1.typeId === r1 && p2.typeId === r2) ||
                  (p1.typeId === r2 && p2.typeId === r1);
    if (!match) return false;

    // Check activation energy
    const collisionEnergy = 0.5 * p1.mass * (p1.vx * p1.vx + p1.vy * p1.vy) +
                           0.5 * p2.mass * (p2.vx * p2.vx + p2.vy * p2.vy);
    if (reaction.activationEnergy && collisionEnergy < reaction.activationEnergy) {
      return false;
    }

    // Check probability
    if (reaction.probability !== undefined && Math.random() > reaction.probability) {
      return false;
    }

    // Reaction occurs!
    reaction.onReaction?.(p1, p2);
    return true;
  }, []);

  // Update particle position
  const updateParticle = useCallback((particle: Particle) => {
    // Apply gravity
    if (physics.gravity) {
      particle.vy += physics.gravity;
    }

    // Apply friction
    if (physics.friction) {
      particle.vx *= (1 - physics.friction);
      particle.vy *= (1 - physics.friction);
    }

    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Wall collisions
    const elasticWalls = container.elasticWalls !== false;
    if (particle.x - particle.radius < 0) {
      particle.x = particle.radius;
      if (elasticWalls) particle.vx *= -1;
    }
    if (particle.x + particle.radius > width) {
      particle.x = width - particle.radius;
      if (elasticWalls) particle.vx *= -1;
    }
    if (particle.y - particle.radius < 0) {
      particle.y = particle.radius;
      if (elasticWalls) particle.vy *= -1;
    }
    if (particle.y + particle.radius > height) {
      particle.y = height - particle.radius;
      if (elasticWalls) particle.vy *= -1;
    }

    // Update energy
    particle.energy = 0.5 * particle.mass * (particle.vx * particle.vx + particle.vy * particle.vy);
  }, [physics.gravity, physics.friction, container.elasticWalls, width, height]);

  // Main animation loop
  useEffect(() => {
    if (!running) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const particles = particlesRef.current;

      // Update physics
      particles.forEach(updateParticle);

      // Handle collisions
      if (physics.enableCollisions) {
        const toRemove = new Set<string>();

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];

            if (toRemove.has(p1.id) || toRemove.has(p2.id)) continue;

            if (checkCollision(p1, p2)) {
              // Check for reactions first
              let reacted = false;
              for (const reaction of reactions) {
                if (processReaction(p1, p2, reaction)) {
                  toRemove.add(p1.id);
                  toRemove.add(p2.id);
                  reacted = true;
                  break;
                }
              }

              // If no reaction, do elastic collision
              if (!reacted) {
                resolveCollision(p1, p2);
              }
            }
          }
        }

        // Remove reacted particles
        if (toRemove.size > 0) {
          particlesRef.current = particles.filter(p => !toRemove.has(p.id));
          updateParticleCounts();
        }
      }

      // Draw
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Regions
      regions.forEach(region => {
        ctx.fillStyle = region.color;
        const x = region.xMin ?? 0;
        const y = region.yMin ?? 0;
        const w = (region.xMax ?? width) - x;
        const h = (region.yMax ?? height) - y;
        ctx.fillRect(x, y, w, h);

        if (region.label) {
          ctx.fillStyle = region.color.replace(/[\d.]+\)$/, '1)');
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(region.label, x + 5, y + 15);
        }
      });

      // Container border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(0, 0, width, height);

      // Particles
      particlesRef.current.forEach(particle => {
        // Velocity vector
        if (showVelocityVectors) {
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + particle.vx * 5, particle.y + particle.vy * 5);
          ctx.stroke();
        }

        // Particle body
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        if (particle.strokeColor) {
          ctx.strokeStyle = particle.strokeColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        if (showLabels) {
          const type = typeMap.get(particle.typeId);
          if (type?.label) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(type.label, particle.x, particle.y + 3);
          }
        }
      });

      // Callback
      onFrame?.(particlesRef.current);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    running, width, height, backgroundColor, borderColor, borderWidth,
    physics.enableCollisions, regions, showLabels, showVelocityVectors,
    updateParticle, checkCollision, resolveCollision, processReaction,
    reactions, updateParticleCounts, onFrame, typeMap
  ]);

  // Initialize on mount and when config changes
  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  // Update speeds when temperature changes
  useEffect(() => {
    particlesRef.current.forEach(particle => {
      const type = typeMap.get(particle.typeId);
      const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      const targetSpeed = getSpeedFromTemperature(temperature, type?.mass || 1);

      if (currentSpeed > 0) {
        const scale = targetSpeed / currentSpeed;
        particle.vx *= scale;
        particle.vy *= scale;
      }
    });
  }, [temperature, typeMap, getSpeedFromTemperature]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-md"
        role="img"
        aria-label={ariaLabel}
      />
      {/* Legend */}
      {particleTypes.length > 1 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {particleTypes.map(type => (
            <div key={type.id} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-gray-100 font-medium">
                {type.label || type.id}: {particleCounts[type.id] || 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
function getBorderColorFromPressure(pressure?: 'low' | 'normal' | 'high'): string {
  switch (pressure) {
    case 'low': return '#3b82f6';
    case 'high': return '#ef4444';
    default: return '#22c55e';
  }
}

function getBorderWidthFromPressure(pressure?: 'low' | 'normal' | 'high'): number {
  switch (pressure) {
    case 'low': return 2;
    case 'high': return 6;
    default: return 4;
  }
}
