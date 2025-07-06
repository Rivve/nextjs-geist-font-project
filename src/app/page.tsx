"use client";

import React, { useState, useEffect } from "react";

// Helper function to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const upgradesData: {
  id: number;
  name: string;
  description: string;
  cost: number;
  type: "click" | "auto";
  value: number;
}[] = [
  {
    id: 1,
    name: "Click Power +1",
    description: "Increase points per click by 1",
    cost: 10,
    type: "click",
    value: 1,
  },
  {
    id: 2,
    name: "Auto Clicker +1",
    description: "Gain 1 point per second automatically",
    cost: 50,
    type: "auto",
    value: 1,
  },
  {
    id: 3,
    name: "Click Power +5",
    description: "Increase points per click by 5",
    cost: 200,
    type: "click",
    value: 5,
  },
  {
    id: 4,
    name: "Auto Clicker +5",
    description: "Gain 5 points per second automatically",
    cost: 1000,
    type: "auto",
    value: 5,
  },
];

const managerUpgradesData: {
  id: number;
  name: string;
  description: string;
  cost: number;
  clickRateIncrease: number;
}[] = [
  {
    id: 1,
    name: "Manager Level 1",
    description: "Manager clicks 1 time per second",
    cost: 500,
    clickRateIncrease: 1,
  },
  {
    id: 2,
    name: "Manager Level 2",
    description: "Manager clicks 5 times per second",
    cost: 2500,
    clickRateIncrease: 5,
  },
  {
    id: 3,
    name: "Manager Level 3",
    description: "Manager clicks 10 times per second",
    cost: 10000,
    clickRateIncrease: 10,
  },
];

const boostsData: {
  id: number;
  name: string;
  description: string;
  cost: number;
  duration: number; // in seconds
  multiplier: number;
}[] = [
  {
    id: 1,
    name: "Double Points (30s)",
    description: "Doubles points gained for 30 seconds",
    cost: 1000,
    duration: 30,
    multiplier: 2,
  },
  {
    id: 2,
    name: "Triple Points (15s)",
    description: "Triples points gained for 15 seconds",
    cost: 1500,
    duration: 15,
    multiplier: 3,
  },
];

export default function Home() {
  const [points, setPoints] = useState(0);
  const [pointsPerClick, setPointsPerClick] = useState(1);
  const [autoPointsPerSecond, setAutoPointsPerSecond] = useState(0);
  const [upgrades, setUpgrades] = useState(upgradesData);
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(1);

  const [managerClickRate, setManagerClickRate] = useState(0);
  const [managerUpgrades, setManagerUpgrades] = useState(managerUpgradesData);
  const [managerLevel, setManagerLevel] = useState(0);

  const [boosts, setBoosts] = useState(boostsData);
  const [activeBoosts, setActiveBoosts] = useState<
    { id: number; expiresAt: number; multiplier: number; name: string }[]
  >([]);

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Calculate manager boost based on level (every 25 levels)
  const managerBoostLevel = Math.floor(managerLevel / 25);
  const managerEfficiency = 1 + (managerBoostLevel * 0.5); // 50% faster per boost level

  // Update current time every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load saved game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("idleClickerGameState");
    if (savedState) {
      const state = JSON.parse(savedState);
      setPoints(state.points || 0);
      setPointsPerClick(state.pointsPerClick || 1);
      setAutoPointsPerSecond(state.autoPointsPerSecond || 0);
      setUpgrades(state.upgrades || upgradesData);
      setPrestigePoints(state.prestigePoints || 0);
      setPrestigeMultiplier(state.prestigeMultiplier || 1);
      setManagerClickRate(state.managerClickRate || 0);
      setManagerUpgrades(state.managerUpgrades || managerUpgradesData);
      setManagerLevel(state.managerLevel || 0);
      setActiveBoosts(state.activeBoosts || []);
    }
  }, []);

  // Auto save game state to localStorage every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const state = {
        points,
        pointsPerClick,
        autoPointsPerSecond,
        upgrades,
        prestigePoints,
        prestigeMultiplier,
        managerClickRate,
        managerUpgrades,
        managerLevel,
        activeBoosts,
      };
      localStorage.setItem("idleClickerGameState", JSON.stringify(state));
    }, 5000);
    return () => clearInterval(interval);
  }, [
    points,
    pointsPerClick,
    autoPointsPerSecond,
    upgrades,
    prestigePoints,
    prestigeMultiplier,
    managerClickRate,
    managerUpgrades,
    managerLevel,
    activeBoosts,
  ]);

  // Calculate total multiplier from prestige and active boosts
  const totalMultiplier = activeBoosts.reduce(
    (acc, boost) => acc * boost.multiplier,
    prestigeMultiplier
  );

  // Auto increment points per second
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => prev + autoPointsPerSecond * totalMultiplier);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoPointsPerSecond, totalMultiplier]);

  // Manager auto clicks with efficiency boost
  useEffect(() => {
    if (managerClickRate > 0) {
      const effectiveClickRate = managerClickRate * managerEfficiency;
      const interval = setInterval(() => {
        setPoints((prev) => prev + pointsPerClick * totalMultiplier);
      }, 1000 / effectiveClickRate);
      return () => clearInterval(interval);
    }
  }, [managerClickRate, pointsPerClick, totalMultiplier, managerEfficiency]);

  // Handle click
  const handleClick = () => {
    setPoints((prev) => prev + pointsPerClick * totalMultiplier);
  };

  // Handle upgrade purchase
  const buyUpgrade = (upgrade: {
    id: number;
    name: string;
    description: string;
    cost: number;
    type: "click" | "auto";
    value: number;
  }) => {
    if (points >= upgrade.cost) {
      setPoints((prev) => prev - upgrade.cost);
      setUpgrades((prev) =>
        prev.map((u) =>
          u.id === upgrade.id ? { ...u, cost: Math.floor(u.cost * 1.5) } : u
        )
      );
      if (upgrade.type === "click") {
        setPointsPerClick((prev) => prev + upgrade.value);
      } else if (upgrade.type === "auto") {
        setAutoPointsPerSecond((prev) => prev + upgrade.value);
      }
    }
  };

  // Handle manager upgrade purchase
  const buyManagerUpgrade = (upgrade: {
    id: number;
    name: string;
    description: string;
    cost: number;
    clickRateIncrease: number;
  }) => {
    if (points >= upgrade.cost) {
      setPoints((prev) => prev - upgrade.cost);
      setManagerUpgrades((prev) =>
        prev.map((u) =>
          u.id === upgrade.id ? { ...u, cost: Math.floor(u.cost * 1.5) } : u
        )
      );
      setManagerClickRate((prev) => prev + upgrade.clickRateIncrease);
      setManagerLevel((prev) => prev + 1);
    }
  };

  // Handle boost purchase
  const buyBoost = (boost: {
    id: number;
    name: string;
    description: string;
    cost: number;
    duration: number;
    multiplier: number;
  }) => {
    if (points >= boost.cost) {
      setPoints((prev) => prev - boost.cost);
      const expiresAt = Date.now() + boost.duration * 1000;
      setActiveBoosts((prev) => [...prev, { 
        id: boost.id, 
        expiresAt, 
        multiplier: boost.multiplier,
        name: boost.name
      }]);
    }
  };

  // Remove expired boosts
  useEffect(() => {
    if (activeBoosts.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveBoosts((prev) => prev.filter((boost) => boost.expiresAt > now));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBoosts]);

  // Handle prestige
  const handlePrestige = () => {
    if (points >= 1000) {
      const gainedPrestige = Math.floor(points / 1000);
      setPrestigePoints((prev) => prev + gainedPrestige);
      setPrestigeMultiplier((prev) => prev + gainedPrestige * 0.1);
      setPoints(0);
      setPointsPerClick(1);
      setAutoPointsPerSecond(0);
      setUpgrades(upgradesData);
      setManagerClickRate(0);
      setManagerLevel(0);
      setManagerUpgrades(managerUpgradesData);
      setActiveBoosts([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-black">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <main className="flex flex-col items-center justify-center p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Idle Clicker Game
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-black">{Math.floor(points).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-black">{(pointsPerClick * totalMultiplier).toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Per Click</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-black">{(autoPointsPerSecond * totalMultiplier).toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Per Second</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-black">{prestigePoints}</p>
                  <p className="text-sm text-gray-600">Prestige</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-black">x{prestigeMultiplier.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Multiplier</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-black">{(managerClickRate * managerEfficiency).toFixed(1)}/s</p>
                  <p className="text-sm text-gray-600">Manager</p>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Boost Indicator */}
          {managerLevel > 0 && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-800">Manager Level: {managerLevel}</p>
                    <p className="text-sm text-blue-600">
                      Efficiency Boost: x{managerEfficiency.toFixed(2)} 
                      {managerBoostLevel > 0 && ` (${managerBoostLevel} boost${managerBoostLevel > 1 ? 's' : ''})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600">Next boost at level {(managerBoostLevel + 1) * 25}</p>
                    <p className="text-xs text-blue-500">{(managerBoostLevel + 1) * 25 - managerLevel} levels to go</p>
                  </div>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((managerLevel % 25) / 25) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Active Boosts */}
          {activeBoosts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Active Boosts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeBoosts.map((boost, index) => {
                  const timeLeft = Math.max(0, Math.ceil((boost.expiresAt - currentTime) / 1000));
                  return (
                    <div key={index} className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-green-800">{boost.name}</p>
                          <p className="text-sm text-green-600">x{boost.multiplier} multiplier</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-800">{formatTime(timeLeft)}</p>
                          <p className="text-xs text-green-600">remaining</p>
                        </div>
                      </div>
                      <div className="mt-2 bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(timeLeft / (boost.name.includes('30s') ? 30 : 15)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Click Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleClick}
              className="bg-black text-white px-12 py-6 rounded-xl text-2xl font-bold shadow-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-label="Click to gain points"
            >
              CLICK ME
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upgrades */}
            <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-center">Upgrades</h2>
              <div className="space-y-3">
                {upgrades.map((upgrade) => (
                  <button
                    key={upgrade.id}
                    onClick={() => buyUpgrade(upgrade)}
                    disabled={points < upgrade.cost}
                    className={`w-full border rounded-lg p-4 text-left transition-all duration-200 ${
                      points >= upgrade.cost
                        ? "bg-black text-white hover:bg-gray-800 border-black shadow-md hover:shadow-lg"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    }`}
                    aria-label={`Buy upgrade ${upgrade.name} for ${upgrade.cost} points`}
                  >
                    <h3 className="font-semibold text-lg">{upgrade.name}</h3>
                    <p className="text-sm opacity-80">{upgrade.description}</p>
                    <p className="mt-2 font-bold">Cost: {upgrade.cost.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Manager Upgrades */}
            <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-center">Manager</h2>
              <div className="space-y-3">
                {managerUpgrades.map((upgrade) => (
                  <button
                    key={upgrade.id}
                    onClick={() => buyManagerUpgrade(upgrade)}
                    disabled={points < upgrade.cost}
                    className={`w-full border rounded-lg p-4 text-left transition-all duration-200 ${
                      points >= upgrade.cost
                        ? "bg-black text-white hover:bg-gray-800 border-black shadow-md hover:shadow-lg"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    }`}
                    aria-label={`Buy manager upgrade ${upgrade.name} for ${upgrade.cost} points`}
                  >
                    <h3 className="font-semibold text-lg">{upgrade.name}</h3>
                    <p className="text-sm opacity-80">{upgrade.description}</p>
                    <p className="mt-2 font-bold">Cost: {upgrade.cost.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Boost Store */}
            <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-center">Boost Store</h2>
              <div className="space-y-3">
                {boosts.map((boost) => (
                  <button
                    key={boost.id}
                    onClick={() => buyBoost(boost)}
                    disabled={points < boost.cost}
                    className={`w-full border rounded-lg p-4 text-left transition-all duration-200 ${
                      points >= boost.cost
                        ? "bg-black text-white hover:bg-gray-800 border-black shadow-md hover:shadow-lg"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    }`}
                    aria-label={`Buy boost ${boost.name} for ${boost.cost} points`}
                  >
                    <h3 className="font-semibold text-lg">{boost.name}</h3>
                    <p className="text-sm opacity-80">{boost.description}</p>
                    <p className="mt-2 font-bold">Cost: {boost.cost.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Prestige */}
          <div className="text-center mt-8">
            <button
              onClick={handlePrestige}
              disabled={points < 1000}
              className={`px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 ${
                points >= 1000
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Prestige to reset progress and gain prestige points"
            >
              PRESTIGE ({Math.floor(points / 1000)} points)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
