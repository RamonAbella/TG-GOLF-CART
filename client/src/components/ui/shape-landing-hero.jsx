import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function HeroShapesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <ElegantShape
        delay={0.3}
        width={520}
        height={130}
        rotate={12}
        gradient="from-white/[0.18]"
        className="left-[-15%] top-[15%]"
      />
      <ElegantShape
        delay={0.5}
        width={380}
        height={100}
        rotate={-15}
        gradient="from-white/[0.12]"
        className="right-[-10%] bottom-[20%]"
      />
      <ElegantShape
        delay={0.4}
        width={260}
        height={70}
        rotate={-8}
        gradient="from-white/[0.14]"
        className="left-[5%] bottom-[8%]"
      />
      <ElegantShape
        delay={0.6}
        width={180}
        height={55}
        rotate={20}
        gradient="from-white/[0.10]"
        className="right-[10%] top-[10%]"
      />
      <ElegantShape
        delay={0.7}
        width={140}
        height={40}
        rotate={-25}
        gradient="from-white/[0.09]"
        className="left-[25%] top-[5%]"
      />
    </div>
  );
}
