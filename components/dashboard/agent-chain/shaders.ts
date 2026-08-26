// Shaders for the Agent Intelligence Chain constellation.
// Two layers only: a fresnel glow for each agent node, and an additive
// particle stream for the energy flowing along the chain conduits.
// Palette is identity — warm discovery heat cools into electric-blue strategy.

// --- Agent node: fresnel rim + soft hot centre -------------------------------

export const NODE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const NODE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = max(dot(vNormal, vView), 0.0);
    float rim = pow(1.0 - facing, 2.2);
    float core = pow(facing, 1.6);
    vec3 col = uColor * (rim * 1.5 + core * 0.55);
    float alpha = (rim + core * 0.4) * uIntensity;
    gl_FragColor = vec4(col * uIntensity, alpha);
  }
`;

// --- Conduit: particles streaming from one node to the next -------------------

export const CONDUIT_VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aParam;   // 0..1 position along its segment
  attribute float aSeed;    // per-particle randomness
  uniform float uTime;
  uniform float uEnergy;    // overall chain drive, 0..1
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    vColor = aColor;

    // A bright head travels along the segment; particles flare as it passes.
    float head = fract(uTime * (0.16 + 0.16 * uEnergy) + aSeed * 0.17);
    float d = aParam - head;
    d = d - floor(d + 0.5);              // shortest wrapped distance
    float pulse = exp(-pow(d * 7.5, 2.0));

    float base = 0.22 + 0.36 * uEnergy;
    vGlow = base + pulse * (0.85 + 0.7 * uEnergy);

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float size = (1.5 + pulse * 3.6) * uPixelRatio;
    gl_PointSize = size * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const CONDUIT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    float alpha = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(vColor * vGlow, alpha * clamp(vGlow, 0.0, 1.0));
  }
`;
