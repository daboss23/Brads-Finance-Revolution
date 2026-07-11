// GLSL for Sarah's Fusion Core.
//
// Two plasma poles — molten orange fire and electric blue energy — collide
// inside one sphere at a rotating white-hot fusion seam. A frequency ring
// of spectrum bands circles the equator and reacts to Sarah's state.
// Everything runs on the GPU; the CPU only eases uniforms between states.

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

vec3 curlNoise(vec3 p) {
  float n1 = snoise(p + vec3(31.41, 0.0, 0.0));
  float n2 = snoise(p + vec3(0.0, 17.21, 0.0));
  float n3 = snoise(p + vec3(0.0, 0.0, 53.13));
  return normalize(vec3(n2 - n3, n3 - n1, n1 - n2) + 0.001);
}
`;

// ── Fusion shell ─────────────────────────────────────────────────────────────
// Noise-displaced sphere. The fragment shader owns the dual-pole flame field.

export const PLASMA_VERT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uDisplacement;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;

void main() {
  vec3 pos = position;
  float t = uTime * uSpeed * 0.25;
  // Flame-biased displacement: noise scrolls along the surface normal's
  // vertical component so peaks stretch upward like flame licks.
  float n1 = fbm(pos * 1.8 + vec3(0.0, -t * 1.6, 0.0));
  float lick = fbm(pos * 3.2 + vec3(t * 0.4, -t * 2.2, 0.0)) * max(normal.y, 0.0);
  float disp = (n1 + lick * 0.6) * uDisplacement;
  vec3 displaced = pos + normal * disp;
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vObjPos = pos;
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const PLASMA_FRAG = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uSpeed;
uniform vec3 uWarmDeep;   // molten core orange
uniform vec3 uWarmBright; // fire highlight
uniform vec3 uCoolDeep;   // deep electric blue
uniform vec3 uCoolBright; // plasma cyan highlight
uniform vec3 uAxis;       // fusion axis in object space (rotates on CPU)
uniform float uIntensity;
uniform float uSeamHeat;  // how hot the collision seam burns

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);

  float t = uTime * uSpeed;
  vec3 P = normalize(vObjPos);

  // Pole field: -1 = fully cool, +1 = fully warm; noise makes the frontier
  // ragged so the two plasmas interlock like flames, not a painted line.
  float pole = dot(P, normalize(uAxis));
  float frontier = fbm(vObjPos * 2.6 + vec3(0.0, -t * 0.55, t * 0.2)) * 0.55;
  float f = clamp(pole + frontier, -1.0, 1.0);
  float warmMix = smoothstep(-0.25, 0.25, f);

  // Flame body: vertical-scrolling turbulence per pole. Veins are kept
  // thin and sharp so most of the sphere stays deep and dark — the flames
  // read as filaments of fire, not a wash of light.
  float warmFlame = fbm(vObjPos * 2.4 + vec3(t * 0.3, -t * 1.5, 0.0));
  float coolFlame = fbm(vObjPos * 2.8 + vec3(-t * 0.4, -t * 1.1, t * 0.5));
  float warmVeins = smoothstep(0.34, 0.9, abs(warmFlame) * 1.5);
  float coolVeins = smoothstep(0.34, 0.9, abs(coolFlame) * 1.5);

  vec3 warm = mix(uWarmDeep, uWarmBright, warmVeins);
  vec3 cool = mix(uCoolDeep, uCoolBright, coolVeins);
  vec3 body = mix(cool, warm, warmMix);
  float veins = mix(coolVeins, warmVeins, warmMix);

  // Fusion seam: a tight ribbon where the poles collide, flickering hot.
  float seam = 1.0 - abs(f);
  seam = pow(smoothstep(0.72, 1.0, seam), 2.4);
  float seamFlicker = 0.7 + 0.3 * snoise(vec3(vObjPos.xy * 4.0, t * 1.8));
  vec3 seamColor = mix(vec3(1.0, 0.9, 0.72), vec3(0.8, 0.93, 1.0), 0.5 - 0.5 * pole);

  vec3 emissive = body * (0.22 + veins * 1.35) * uIntensity
                + seamColor * seam * seamFlicker * uSeamHeat * uIntensity * 0.8;

  // Rim light follows the pole underneath it.
  vec3 rimColor = mix(uCoolBright, uWarmBright, warmMix);
  vec3 rim = rimColor * fres * (0.55 + uIntensity * 0.25)
           + seamColor * fres * seam * 0.35;

  vec3 color = emissive + rim;
  color = color / (1.0 + color * 0.55);
  float alpha = clamp(0.2 + fres * 0.5 + veins * 0.62 + seam * 0.45, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

// ── Atmosphere halo ──────────────────────────────────────────────────────────
// Backside sphere; halo colour blends warm/cool around the fusion axis.

export const ATMOSPHERE_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vObjPos = position;
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uWarm;
uniform vec3 uCool;
uniform vec3 uAxis;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;
void main() {
  float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 3.0);
  float warmMix = smoothstep(-0.5, 0.5, dot(normalize(vObjPos), normalize(uAxis)));
  vec3 col = mix(uCool, uWarm, warmMix) * fres * uIntensity * 0.6;
  gl_FragColor = vec4(col, fres * 0.55);
}
`;

// ── Core singularity ─────────────────────────────────────────────────────────

export const CORE_FRAG = /* glsl */ `
uniform vec3 uRim;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.2);
  vec3 dark = vec3(0.02, 0.02, 0.05);
  vec3 rim = uRim * fres * (1.2 + uIntensity * 0.6);
  gl_FragColor = vec4(dark + rim, 0.92 + fres * 0.08);
}
`;

// ── Frequency ring ───────────────────────────────────────────────────────────
// Spectrum-analyzer bands orbiting the equator. Each point belongs to a band
// (aBand) and a rung within it (aRung); bands rise and fall with layered
// noise, mirrored above and below the equator. uAudio drives amplitude.

export const FREQ_VERT = /* glsl */ `
${NOISE_GLSL}

attribute float aBand;
attribute float aRung;
attribute float aSide;

uniform float uTime;
uniform float uAudio;
uniform float uRadius;
uniform float uPixelSize;

varying float vHeat;
varying float vFade;

void main() {
  float bandAngle = aBand * 6.2831853;
  // Layered pseudo-spectrum: three sine/noise octaves per band so motion
  // reads as frequency data, not a uniform wave.
  float s1 = snoise(vec3(aBand * 7.3, uTime * 1.35, 0.0));
  float s2 = snoise(vec3(aBand * 19.1, uTime * 2.6, 4.7));
  float wave = sin(bandAngle * 3.0 + uTime * 2.2);
  float level = clamp(0.5 + 0.45 * s1 + 0.3 * s2 + 0.2 * wave, 0.05, 1.3);
  level *= uAudio;

  // Rung climbs the band; points above the level fade out.
  float h = aRung * 0.5 * level;
  vFade = 1.0 - smoothstep(0.75, 1.0, aRung);

  float a = bandAngle + uTime * 0.12;
  vec3 pos = vec3(cos(a) * uRadius, h * aSide, sin(a) * uRadius);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.6 - aRung * 0.9) * uPixelSize * (34.0 / -mv.z);

  // Heat: which pole this band sits over (x axis = warm side).
  vHeat = smoothstep(-0.7, 0.7, cos(a));
}
`;

export const FREQ_FRAG = /* glsl */ `
uniform vec3 uWarm;
uniform vec3 uCool;
uniform float uAudio;
varying float vHeat;
varying float vFade;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uCool, uWarm, vHeat);
  gl_FragColor = vec4(col, core * vFade * (0.16 + uAudio * 0.38));
}
`;

// ── Embers ───────────────────────────────────────────────────────────────────
// Drifting sparks; each ember is warm or cool depending on which pole it
// escaped from, and curls upward like a spark leaving a fire.

export const EMBER_VERT = /* glsl */ `
${NOISE_GLSL}

attribute float aSeed;
attribute float aLife;

uniform float uTime;
uniform float uSpeed;
uniform float uCoreRadius;
uniform float uReach;
uniform float uIntensity;
uniform vec3 uAxis;

varying float vAlpha;
varying float vHeat;

void main() {
  float life = mod(uTime * 0.18 * uSpeed + aLife, 1.0);
  float theta = aSeed * 9.733;
  float phi = mod(aSeed * 3.171, 3.14159265);
  vec3 dir = vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));
  float r = mix(uCoreRadius, uCoreRadius + uReach * 0.55, life);
  vec3 sample1 = dir * r + vec3(aSeed, uTime * 0.05, 0.0);
  vec3 wobble = curlNoise(sample1 * 0.6) * (0.08 * uReach);
  // Sparks rise as they age.
  vec3 pos = dir * r + wobble + vec3(0.0, life * life * 0.5, 0.0);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + aSeed * 12.0);
  gl_PointSize = (1.0 + (1.0 - life) * 1.8) * twinkle * (52.0 / -mv.z);
  vAlpha = (1.0 - life) * (0.35 + uIntensity * 0.2);
  vHeat = smoothstep(-0.4, 0.4, dot(dir, normalize(uAxis)));
}
`;

export const EMBER_FRAG = /* glsl */ `
uniform vec3 uWarm;
uniform vec3 uCool;
varying float vAlpha;
varying float vHeat;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uCool, uWarm, vHeat);
  gl_FragColor = vec4(col, vAlpha * core);
}
`;
