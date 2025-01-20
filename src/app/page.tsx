"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { FloatingIcon } from "@/components/ui/floating-icon";
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const leftTools = [
  {
    name: "PostgreSQL",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    offset: "7.5rem",
    translateX: "-5rem",
  },
  {
    name: "MySQL",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    offset: "15rem",
    translateX: "-7.5rem",
  },
  {
    name: "Oracle",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg",
    offset: "22.5rem",
    translateX: "-7.5rem",
  },
  {
    name: "SQL Server",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
    offset: "30rem",
    translateX: "-3.75rem",
  },
];

const rightTools = [
  {
    name: "Redshift",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
    offset: "7.5rem",
    translateX: "5rem",
  },
  {
    name: "BigQuery",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
    offset: "15rem",
    translateX: "7.5rem",
  },
  {
    name: "Snowflake",
    icon: "https://yt3.googleusercontent.com/ytc/AIdro_lGSOnAxbJFwJVicy8ZtlFTsQOwwV4DCHF7ooSabKcClqU=s900-c-k-c0x00ffffff-no-rj",
    offset: "22.5rem",
    translateX: "6.25rem",
  },
  {
    name: "Kafka",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg",
    offset: "30rem",
    translateX: "5rem",
  },
];

export default function Home() {
  const isAuthenticated = useAppSelector((state) => state.auth.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <TooltipProvider>
      <div className="h-auto relative bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-12">
            {/* Left Floating Icons */}
            <div className="pointer-events-none">
              {leftTools.map((tool, index) => (
                <div
                  key={tool.name}
                  className="absolute left-1/4 z-10"
                  style={{
                    top: tool.offset,
                    transform: `translateX(${tool.translateX})`,
                  }}
                >
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <div className="pointer-events-auto ">
                        <FloatingIcon
                          src={tool.icon}
                          alt={tool.name}
                          delay={index * 1200}
                          size={48}
                          className="hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{tool.name}</p>
                    </TooltipContent>
                  </TooltipRoot>
                </div>
              ))}
            </div>

            {/* Right Floating Icons */}
            <div className="pointer-events-none">
              {rightTools.map((tool, index) => (
                <div
                  key={tool.name}
                  className="absolute right-1/4 z-10"
                  style={{
                    top: tool.offset,
                    transform: `translateX(${tool.translateX})`,
                  }}
                >
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <div className="pointer-events-auto">
                        <FloatingIcon
                          src={tool.icon}
                          alt={tool.name}
                          delay={index * 1200}
                          size={48}
                          className=" hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p className="z-10">{tool.name}</p>
                    </TooltipContent>
                  </TooltipRoot>
                </div>
              ))}
            </div>

            {/* <img className=" absolute left-0 top-0 w-screen h-screen z-0 bg-cover" src="/preview.webp" alt="Page Background" /> */}
            {/* <img className=" absolute left-0 top-0 w-screen h-screen opacity-70 z-0" src="/bg.png" alt="Page Background" /> */}
            {/* Main Content */}
            <div className="space-y-6 relative z-10 p-4 rounded-lg py-16">
              <motion.h1
                className="text-5xl font-extrabold flex gap-8 items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img className=" w-20 h-auto z-0" src="/bg.png" alt="logo" />
                DataPulse
              </motion.h1>
              <motion.p
                // glass effect
                className="max-w-2xl mx-auto text-xl "
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Unified platform for managing multiple databases and datastores
                across cloud providers and open-source solutions
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* <div>
                <div className="text-4xl font-bold text-blue-600">10k+</div>
                <div className="text-gray-600 mt-2">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600 mt-2">Integrations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">99.9%</div>
                <div className="text-gray-600 mt-2">Uptime</div>
              </div> */}
            </motion.div>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <motion.div
                className="flex justify-center gap-4 mt-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign Up
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
