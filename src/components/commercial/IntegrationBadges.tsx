import { Gamepad2, Box } from 'lucide-react';

export function IntegrationBadges() {
  const integrations = [
    {
      name: 'Unreal Engine 5',
      badge: 'HDRI Backdrop',
      desc: 'Drop into HDRI Backdrop or Skylight for realistic Lumen global illumination and reflections.',
      color: 'from-blue-600 to-indigo-800',
    },
    {
      name: 'Unity 2023 / 6',
      badge: 'Panoramic Skybox',
      desc: 'Assign to a custom Material with Skybox/Panoramic shader for 360° sky and reflections.',
      color: 'from-slate-700 to-slate-900',
    },
    {
      name: 'Blender 4.x',
      badge: 'World Environment',
      desc: 'Shader Editor → World Output → Background → Environment Texture for photorealistic Cycles / EEVEE.',
      color: 'from-orange-500 to-amber-700',
    },
    {
      name: 'Three.js / WebGL',
      badge: 'Equirectangular Texture',
      desc: 'Load via THREE.TextureLoader() or RGBELoader() and map to scene.background or MeshBasicMaterial.',
      color: 'from-teal-600 to-cyan-800',
    },
    {
      name: 'Meta Quest 3',
      badge: 'WebXR & Oculus',
      desc: 'Full Cardboard split-screen and WebXR stereo spherical viewing inside the Oculus Browser.',
      color: 'from-purple-600 to-pink-800',
    },
    {
      name: 'Apple Vision Pro',
      badge: 'Spatial Computing',
      desc: 'Experience full 360° spherical environments with visionOS Safari and WebXR immersive mode.',
      color: 'from-slate-800 to-zinc-950',
    },
  ];

  return (
    <section className="py-12 border-t border-cyan-500/15 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Universal 3D &amp; Game Engine Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Drop Straight into Your Production Stack
        </h2>
        <p className="text-sm text-cyan-200/70 mt-2">
          Outputs comply with standard 2:1 equirectangular (PNG / Radiance .hdr) and 6-sided cubemap standards across all major 3D tools.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {integrations.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                <Box className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {item.name}
              </h3>
              <span className="text-[10px] font-mono font-medium text-cyan-400/90 block mt-0.5">
                {item.badge}
              </span>
            </div>

            <p className="text-[11px] text-cyan-200/60 leading-relaxed mt-3 pt-2 border-t border-cyan-500/10">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
