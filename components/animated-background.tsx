"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Main gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50/30 to-white" />
      
      {/* Gradient orbs */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
        }}
      />
      
      <div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)",
        }}
      />
      
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(236, 72, 153, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236, 72, 153, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Dot accent pattern */}
      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(rgba(236, 72, 153, 0.4) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
    </div>
  )
}
