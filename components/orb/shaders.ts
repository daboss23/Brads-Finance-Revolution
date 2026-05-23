// Shared GLSL snippets for the plasma orb.
// Simplex 3D noise (Ashima / Stefan Gustavson) + fbm + curl approximation.

export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// Lightweight curl approximation: two snoise samples, take perpendicular gradient.
// Much cheaper than full 6-sample curl noise.
vec3 curlNoise(vec3 p) {
  float n1 = snoise(p + vec3(31.41, 0.0, 0.0));
  float n2 = snoise(p + vec3(0.0, 17.21, 0.0));
  float n3 = snoise(p + vec3(0.0, 0.0, 53.13));
  return normalize(vec3(n2 - n3, n3 - n1, n1 - n2) + 0.001);
}
`;

// Plasma shell: noise-displaced sphere with fresnel rim + animated emissive plasma surface.
export const PLASMA_VERT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uDisplacement;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

void main() {
  vec3 pos = position;
  float t = uTime * uSpeed * 0.25;
  float n1 = fbm(pos * 1.8 + vec3(0.0, t, 0.0));
  float disp = n1 * uDisplacement;
  vec3 displaced = pos + normal * disp;
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const PLASMA_FRAG = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uSpeed;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uIntensity;
uniform float uHueShift;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

vec3 cyclePalette(float t) {
  vec3 a = vec3(0.0, 0.86, 1.0);
  vec3 b = vec3(0.47, 0.86, 1.0);
  vec3 c = vec3(0.7, 0.47, 1.0);
  vec3 d = vec3(1.0, 1.0, 1.0);
  vec3 e = vec3(1.0, 0.84, 0.4);
  float ft = fract(t);
  float seg = ft * 5.0;
  int i = int(floor(seg));
  float u = fract(seg);
  vec3 c0;
  vec3 c1;
  if (i == 0) { c0 = a; c1 = b; }
  else if (i == 1) { c0 = b; c1 = c; }
  else if (i == 2) { c0 = c; c1 = d; }
  else if (i == 3) { c0 = d; c1 = e; }
  else { c0 = e; c1 = a; }
  return mix(c0, c1, u);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);

  float t = uTime * uSpeed * 0.35;
  float n = fbm(vWorldPos * 2.2 + vec3(t, t * 0.7, -t));
  float veins = smoothstep(0.4, 0.95, abs(n) * 1.35);

  vec3 baseA = mix(uColorA, uColorB, smoothstep(-0.4, 0.6, n));
  vec3 hueShifted = mix(baseA, cyclePalette(uTime * 0.06 + n * 0.2), uHueShift);
  vec3 emissive = hueShifted * (0.4 + veins * 1.2) * uIntensity;

  // Gold vein highlights: only on the brightest plasma peaks, so the orb
  // stays cyan/blue overall with warm glints where energy concentrates.
  vec3 gold = vec3(1.0, 0.78, 0.32);
  float goldMask = smoothstep(0.62, 0.95, veins) * (0.7 + 0.3 * sin(uTime * 0.8));
  emissive = mix(emissive, gold * (0.6 + veins * 0.9) * uIntensity, goldMask * 0.55);

  vec3 rim = uColorC * fres * (1.1 + uIntensity * 0.35);
  // Subtle gold accent on the rim as well.
  rim += gold * fres * 0.18 * goldMask;

  vec3 color = emissive + rim;
  // Soft tone-mapping so bright states don't blow to pure white.
  color = color / (1.0 + color * 0.4);
  float alpha = clamp(0.32 + fres * 0.7 + veins * 0.5, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

// Atmosphere halo: backside sphere, inverse fresnel for soft outer bloom.
export const ATMOSPHERE_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  // Atmosphere is rendered on the BackSide. For a back-facing surface the
  // original geometry normal points away from the camera, so dot(N,V) goes
  // negative. Using abs() means the halo is brightest at the silhouette
  // (where the dot product crosses zero) and falls off both at the rim
  // and toward the back centre.
  float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 3.0);
  vec3 col = uColor * fres * uIntensity * 0.6;
  gl_FragColor = vec4(col, fres * 0.55);
}
`;

// Core singularity: small dark sphere with subtle rim glow.
export const CORE_FRAG = /* glsl */ `
uniform vec3 uRim;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.2);
  vec3 dark = vec3(0.02, 0.02, 0.05);
  vec3 rim = uRim * fres * (1.2 + uIntensity * 0.6);
  gl_FragColor = vec4(dark + rim, 0.92 + fres * 0.08);
}
`;

// Filament system: each vertex carries (tendrilId, pathU) attributes.
// Vertex shader places points on a curl-noise-displaced path radiating outward from origin.
export const FILAMENT_VERT = /* glsl */ `
${NOISE_GLSL}

attribute float aPathU;
attribute float aTendril;

uniform float uTime;
uniform float uSpeed;
uniform float uReach;
uniform float uCoreRadius;
uniform float uIntensity;
uniform float uCurlAmount;
uniform float uPixelSize;

varying float vTendril;
varying float vAlpha;

void main() {
  // Stable per-tendril seed.
  float seed = aTendril * 13.137;
  float theta = aTendril * 2.39996323;
  float phi = mod(seed * 7.71, 3.14159265);
  vec3 dir = vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));

  // Radius along filament: starts at core edge, extends to reach.
  float r = mix(uCoreRadius, uCoreRadius + uReach, aPathU);

  // Sample curl noise to push the filament off the radial line organically.
  float t = uTime * uSpeed * 0.25;
  vec3 sample1 = dir * (r * 0.5) + vec3(seed, t, 0.0);
  vec3 offset = curlNoise(sample1 * 0.8) * uCurlAmount * aPathU;

  // Add a longitudinal flicker so the filament breathes along its length.
  float flicker = snoise(vec3(aTendril * 0.7, uTime * uSpeed * 0.6 + aPathU * 3.5, 0.0));
  offset *= 1.0 + flicker * 0.35;

  vec3 worldPos = dir * r + offset;

  vec4 mv = modelViewMatrix * vec4(worldPos, 1.0);
  gl_Position = projectionMatrix * mv;
  // Sprite size: thicker near root, thinner at tip; pulse over time.
  float pulse = 0.6 + 0.4 * sin(uTime * uSpeed * 2.0 + aTendril * 1.7);
  float taper = mix(2.4, 0.4, smoothstep(0.0, 1.0, aPathU));
  gl_PointSize = taper * pulse * uPixelSize * (300.0 / -mv.z);

  vTendril = aTendril;
  // Alpha falls off near tip; brighter when uIntensity is high.
  vAlpha = (1.0 - aPathU * 0.85) * (0.6 + uIntensity * 0.6);
}
`;

export const FILAMENT_FRAG = /* glsl */ `
uniform vec3 uColorBright;
uniform vec3 uColorDeep;
uniform float uHueShift;
uniform float uTime;
varying float vTendril;
varying float vAlpha;

vec3 cyclePalette(float t) {
  vec3 a = vec3(0.4, 0.86, 1.0);
  vec3 b = vec3(0.7, 0.47, 1.0);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(1.0, 0.84, 0.4);
  float ft = fract(t);
  float seg = ft * 4.0;
  int i = int(floor(seg));
  float u = fract(seg);
  vec3 c0;
  vec3 c1;
  if (i == 0) { c0 = a; c1 = b; }
  else if (i == 1) { c0 = b; c1 = c; }
  else if (i == 2) { c0 = c; c1 = d; }
  else { c0 = d; c1 = a; }
  return mix(c0, c1, u);
}

void main() {
  // Soft circular point sprite.
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float halo = smoothstep(0.5, 0.15, d);

  vec3 bright = mix(uColorBright, cyclePalette(uTime * 0.08 + vTendril * 0.07), uHueShift);
  vec3 col = mix(uColorDeep, bright, core);
  float a = vAlpha * (halo * 0.85 + core * 0.6);
  gl_FragColor = vec4(col, a);
}
`;

// Ember particles: floating GPU points, drift outward, twinkle.
export const EMBER_VERT = /* glsl */ `
${NOISE_GLSL}

attribute float aSeed;
attribute float aLife;

uniform float uTime;
uniform float uSpeed;
uniform float uCoreRadius;
uniform float uReach;
uniform float uIntensity;

varying float vAlpha;

void main() {
  float life = mod(uTime * 0.18 * uSpeed + aLife, 1.0);
  float theta = aSeed * 9.733;
  float phi = mod(aSeed * 3.171, 3.14159265);
  vec3 dir = vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));
  float r = mix(uCoreRadius, uCoreRadius + uReach * 0.55, life);
  vec3 sample1 = dir * r + vec3(aSeed, uTime * 0.05, 0.0);
  vec3 wobble = curlNoise(sample1 * 0.6) * (0.08 * uReach);
  vec3 pos = dir * r + wobble;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + aSeed * 12.0);
  gl_PointSize = (1.0 + (1.0 - life) * 1.8) * twinkle * (300.0 / -mv.z);
  vAlpha = (1.0 - life) * (0.35 + uIntensity * 0.2);
}
`;

export const EMBER_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, vAlpha * core);
}
`;
