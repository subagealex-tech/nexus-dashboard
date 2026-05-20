"use client";

import { motion } from "framer-motion";
import DataNetwork from "@/components/three/DataNetwork";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 relative"
      >
        <DataNetwork />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl font-bold font-[family-name:var(--font-outfit)] text-gradient-cyan mb-4">
              Nexus Dashboard
            </h1>
            <p className="text-xl text-text-secondary max-w-md">
              A cutting-edge data management platform with immersive 3D visualizations and powerful analytics tools.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            {[
              { label: "Real-time", value: "Analytics" },
              { label: "Secure", value: "Data" },
              { label: "Modern", value: "UI/UX" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-accent-cyan font-[family-name:var(--font-jetbrains)]">
                  {item.value}
                </p>
                <p className="text-sm text-text-muted">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-8 bg-bg-primary">
        <div className="w-full max-w-md lg:hidden mb-8 text-center">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-gradient-cyan">
            Nexus Dashboard
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}